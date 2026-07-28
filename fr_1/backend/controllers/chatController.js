// backend/controllers/chatController.js
// ── DATA-GROUNDED AI CHAT ASSISTANT CONTROLLER ──
// Processes user prompts, fetches role-permission scoped live MySQL database context,
// and queries OpenAI/Gemini/External LLM (or robust intelligent grounded solver fallback)
// without ever exposing secrets to client frontends.

const { gatherAppContext } = require('../services/contextRetrievalService');

/**
 * Controller endpoint to handle user chat messages.
 * Route: POST /api/chat
 */
const pool = require('../config/db');

// ── ROLE & USER ISOLATION CHAT PERSISTENCE ──
// Each user role (and specific user_id) maintains its own independent thread in DB.

/**
 * GET /api/chat/history
 * Fetches chat history scoped strictly to the authenticated user's role and user_id.
 */
exports.getChatHistory = async (req, res) => {
  try {
    const user = req.user;
    const role = (user.role || 'EMPLOYEE').toUpperCase();

    // Query messages for this specific user and role
    const [rows] = await pool.query(
      'SELECT id, sender, message as text, created_at as timestamp FROM chat_messages WHERE user_id = ? AND UPPER(role) = ? ORDER BY id ASC LIMIT 100',
      [user.id, role]
    );

    return res.json({
      success: true,
      role: user.role,
      history: rows.map(r => ({
        id: r.id,
        sender: r.sender,
        text: r.text,
        timestamp: r.timestamp
      }))
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch chat history.' });
  }
};

/**
 * POST /api/chat/send (and POST /api/chat)
 * Processes user prompt, stores user message & bot answer into DB keyed by (user_id, role).
 */
exports.handleChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user || { id: null, name: 'User', role: 'EMPLOYEE' };
    const role = (user.role || 'EMPLOYEE').toUpperCase();

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    // Save User message to DB
    await pool.query(
      'INSERT INTO chat_messages (user_id, role, sender, message) VALUES (?, ?, ?, ?)',
      [user.id, role, 'user', message.trim()]
    );

    // Fetch previous recent conversation history from DB for prompt context
    const [historyRows] = await pool.query(
      'SELECT sender, message FROM chat_messages WHERE user_id = ? AND UPPER(role) = ? ORDER BY id DESC LIMIT 8',
      [user.id, role]
    );
    const historyPayload = historyRows.reverse().map(h => ({ sender: h.sender, text: h.message }));

    // 1. Gather Ground Truth Context from DB scoped to User's Role & Question Keywords
    const dbContext = await gatherAppContext(message, user);

    // 2. Build Structured Grounding Prompt
    const systemPrompt = `You are AI Assistant, an intelligent, helpful AI pair-assistant embedded inside SMTBMS (Supply Chain & Business Management Suite).
Current Date/Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
User Name: "${user.name}"
User Role: "${user.role}"

CRITICAL GROUNDING RULES:
1. You MUST answer the user's questions based ONLY on the REAL, EXPLICIT database context provided below.
2. Do NOT invent fake numbers, non-existent inventory codes, or dummy employee names that are not in the context.
3. If the requested information is not available in the database context or restricted by role permission, state so plainly and professionally.
4. Format your responses using clean Markdown (bold text, bullet lists, or tables where appropriate).
5. If the user asks what you can do, explain that you can query real live inventory, stock levels, sales pipeline, HR roster, attendance, and system statistics according to their access privileges (${user.role}).

REAL LIVE DATABASE CONTEXT (GROUND TRUTH):
\`\`\`json
${JSON.stringify(dbContext, null, 2)}
\`\`\``;

    let replyText = '';

    // 3. Optional LLM Integration (OpenAI API if key present in .env)
    if (process.env.OPENAI_API_KEY) {
      try {
        const { OpenAI } = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const messagesPayload = [
          { role: 'system', content: systemPrompt },
          ...historyPayload.map(h => ({
            role: h.sender === 'user' ? 'user' : 'assistant',
            content: h.text
          }))
        ];

        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
          messages: messagesPayload,
          temperature: 0.2,
          max_tokens: 600
        });

        replyText = completion.choices[0]?.message?.content || '';
      } catch (llmErr) {
        console.warn('⚠️ OpenAI API call failed or misconfigured, falling back to intelligent grounded synthesis:', llmErr.message);
      }
    }

    // 4. Grounded Synthesis Fallback Engine
    if (!replyText) {
      replyText = synthesizeGroundedResponse(message, dbContext, user);
    }

    // Save Bot reply to DB
    const [botRes] = await pool.query(
      'INSERT INTO chat_messages (user_id, role, sender, message) VALUES (?, ?, ?, ?)',
      [user.id, role, 'bot', replyText]
    );

    return res.json({
      success: true,
      reply: replyText,
      messageId: botRes.insertId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in handleChatMessage controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process chat query.',
      error: error.message
    });
  }
};

/**
 * DELETE /api/chat/history
 * Clears chat history for the authenticated user and role.
 */
exports.clearChatHistory = async (req, res) => {
  try {
    const user = req.user;
    const role = (user.role || 'EMPLOYEE').toUpperCase();
    await pool.query('DELETE FROM chat_messages WHERE user_id = ? AND UPPER(role) = ?', [user.id, role]);
    return res.json({ success: true, message: 'Chat history cleared successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to clear chat history.' });
  }
};

/**
 * Intelligent Grounded Synthesis Engine that extracts exact MySQL database facts
 * matching the user query when external LLM API keys are not present in .env.
 */
function synthesizeGroundedResponse(query, context, user) {
  const cleanQ = (query || '').replace(/['"“View give me a summary of current CRM leads””]/gi, ' ');
  const q = (cleanQ + ' ' + (query || '')).toLowerCase();
  const summary = context.system_overview_summary?.system_totals || {};
  const role = (user.role || 'EMPLOYEE').toUpperCase();

  // Inventory / Materials Queries
  if (q.includes('material') || q.includes('stock') || q.includes('inventory') || q.includes('item') || q.includes('quantity')) {
    if (context.materials) {
      const items = context.materials.items_sample || [];
      const lowCount = context.materials.low_stock_items_count || 0;
      let text = `### 📦 Live Inventory & Stock Report\n\n`;
      text += `Currently, there are **${summary.total_materials_in_database || items.length}** distinct material types registered in the system.\n\n`;
      if (lowCount > 0) {
        text += `⚠️ **Attention Required**: **${lowCount}** material(s) have low stock levels (Quantity ≤ 10 pcs).\n\n`;
      } else {
        text += `✅ **Stock Health**: All active inventory items are at healthy operating thresholds.\n\n`;
      }
      text += `**Sample Material Records:**\n`;
      items.slice(0, 5).forEach(item => text += `- ${item}\n`);
      return text;
    }
  }

  // Material Movements / Transfers
  if (q.includes('movement') || q.includes('transfer') || q.includes('inbound') || q.includes('outbound')) {
    if (context.material_movements && context.material_movements.length) {
      let text = `### 🔄 Recent Material Transit Registers\n\nHere are the latest movement records from the warehouse log:\n\n`;
      context.material_movements.forEach(m => text += `- ${m}\n`);
      return text;
    }
    return `### 🔄 Material Movements\n\nNo recent material movement logs found in the current ledger. You can record a new transit using the **Record Movement** tool in the Material Movements Portal.`;
  }

  // Sales & CRM Queries
  if (q.includes('sale') || q.includes('lead') || q.includes('crm') || q.includes('revenue') || q.includes('customer')) {
    if (!['ADMIN', 'MANAGER', 'SALES'].includes(role)) {
      return `🔒 **Access Restricted**: Sales and CRM records are reserved for **Sales**, **Manager**, and **Admin** roles. Your current role is **${user.role}**.`;
    }
    if (context.sales_and_crm) {
      const crm = context.sales_and_crm;
      let text = `### 📊 CRM & Sales Performance Summary\n\n`;
      text += `- **Total Revenue Recorded**: ₹${Number(crm.total_revenue_recorded).toLocaleString()}\n`;
      text += `- **Total CRM Leads**: ${summary.total_crm_leads || 0}\n`;
      text += `- **Active Customers**: ${summary.total_active_customers || 0}\n\n`;
      if (crm.leads_summary && crm.leads_summary.length) {
        text += `**Recent Sales Leads:**\n`;
        crm.leads_summary.slice(0, 5).forEach(l => text += `- ${l}\n`);
      }
      return text;
    }
  }

  // Workforce / HRMS Queries
  if (q.includes('employee') || q.includes('staff') || q.includes('hrms') || q.includes('leave') || q.includes('roster') || q.includes('department')) {
    if (!['ADMIN', 'HR', 'MANAGER'].includes(role)) {
      return `🔒 **Access Restricted**: Workforce and HR personnel data are restricted to **HR**, **Manager**, and **Admin** roles. Your current role is **${user.role}**.`;
    }
    if (context.workforce_and_hrms) {
      const hr = context.workforce_and_hrms;
      let text = `### 👥 HRMS & Workforce Roster Overview\n\n`;
      text += `Total registered personnel on roster: **${summary.total_employees_on_roster || 0} employees**.\n\n`;
      if (hr.total_employees_sample && hr.total_employees_sample.length) {
        text += `**Recent Roster Entries:**\n`;
        hr.total_employees_sample.slice(0, 5).forEach(e => text += `- ${e}\n`);
      }
      if (hr.recent_leave_requests && hr.recent_leave_requests.length) {
        text += `\n**Recent Leave Requests:**\n`;
        hr.recent_leave_requests.slice(0, 3).forEach(l => text += `- ${l}\n`);
      }
      return text;
    }
  }

  // Payroll Queries
  if (q.includes('payroll') || q.includes('disbursed') || q.includes('disburse') || q.includes('salary') || q.includes('payslip') || q.includes('compensation') || q.includes('pay') || q.includes('wage')) {
    if (!['ADMIN', 'HR'].includes(role)) {
      return `🔒 **Access Restricted**: Detailed corporate payroll ledgers are confidential and restricted to **HR** and **Admin** roles. Your current role is **${user.role}**.`;
    }
    if (context.payroll_ledger) {
      const pay = context.payroll_ledger;
      let text = `### 💰 Corporate Payroll Ledger Summary\n\n`;
      text += `- **Gross Payroll Disbursed**: **₹${Number(pay.gross_payroll_disbursed || 0).toLocaleString()}**\n\n`;
      if (pay.recent_disbursements && pay.recent_disbursements.length) {
        text += `**Recent Disbursements:**\n`;
        pay.recent_disbursements.slice(0, 4).forEach(p => text += `- ${p}\n`);
      } else {
        text += `No recent individual payslip disbursements recorded.`;
      }
      return text;
    }
  }

  // System Help & Greeting
  return `Hello **${user.name}**! I am your AI assistant for **SMTBMS**.

Here is a summary of the current live database context available to your role (**${user.role}**):

| Resource Category | Registered Count | Status |
| :--- | :--- | :--- |
| **Material Catalog** | ${summary.total_materials_in_database || 0} SKUs | Active |
| **Workforce Staff** | ${summary.total_employees_on_roster || 0} Personnel | Monitored |
| **CRM Leads** | ${summary.total_crm_leads || 0} Leads | Pipeline |
| **Customer Accounts** | ${summary.total_active_customers || 0} Clients | Active |

You can ask me questions such as:
- *"Show me materials with low stock"*
- *"What are the recent material movements?"*
- *"Give me a summary of current CRM leads"* (Sales/Admin)
- *"Show employee department breakdown"* (HR/Admin)
- *"What is the total payroll disbursed?"* (HR/Admin)`;
}

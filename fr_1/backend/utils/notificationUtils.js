const pool = require('../config/db');

const ensurePreferencesTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      user_id INT PRIMARY KEY,
      email BOOLEAN DEFAULT 1,
      sms BOOLEAN DEFAULT 0,
      inApp BOOLEAN DEFAULT 1,
      lowStock BOOLEAN DEFAULT 1,
      movements BOOLEAN DEFAULT 1,
      hrEvents BOOLEAN DEFAULT 1,
      payroll BOOLEAN DEFAULT 1,
      crm BOOLEAN DEFAULT 1,
      reports BOOLEAN DEFAULT 1
    )
  `);
};

/**
 * Send notifications, factoring in user preferences.
 * @param {number[]} userIds Array of target user IDs
 * @param {string} title Notification title
 * @param {string} message Notification message
 * @param {string} category The category matching the preference column (e.g. 'hrEvents', 'lowStock', 'movement', 'crm', 'payroll', 'report')
 */
const sendNotification = async (userIds, title, message, category) => {
  try {
    console.log(`[sendNotification] Triggered for category: '${category}'`);
    console.log(`[sendNotification] Initial Recipients:`, userIds);
    if (!userIds || userIds.length === 0) {
      console.log(`[sendNotification] No initial recipients, aborting.`);
      return;
    }

    // Map the system 'category' to the preference column name
    const categoryToPrefMap = {
      'hr_event': 'hrEvents',
      'low_stock': 'lowStock',
      'movement': 'movements',
      'payroll': 'payroll',
      'crm': 'crm',
      'report': 'reports'
    };

    const prefCol = categoryToPrefMap[category];

    let finalRecipients = userIds;

    // If it's a categorizable alert, filter out users who opted out
    if (prefCol) {
      await ensurePreferencesTable(); // MUST run before SELECT to avoid ER_NO_SUCH_TABLE in production
      const [prefs] = await pool.query(
        `SELECT user_id, ?? AS is_enabled FROM notification_preferences WHERE user_id IN (?)`, 
        [prefCol, userIds]
      );
      
      console.log(`[sendNotification] Preference checks from DB for ${prefCol}:`, prefs);

      // Create a map of user_id -> is_enabled
      const prefMap = {};
      prefs.forEach(p => { prefMap[p.user_id] = p.is_enabled; });

      // If a user has a row and is_enabled = 0, drop them. (Default is opt-in if no row exists).
      finalRecipients = userIds.filter(id => {
        if (prefMap[id] === 0) return false;
        return true;
      });
      console.log(`[sendNotification] Recipients after preference filter:`, finalRecipients);
    }

    if (finalRecipients.length === 0) {
      console.log(`[sendNotification] No recipients left after preference filter, aborting.`);
      return;
    }

    // Batch Insert Notifications
    const values = finalRecipients.map(id => [title, message, id, 'Unread', category]);
    console.log(`[sendNotification] Attempting INSERT into notifications with values:`, values);
    
    await pool.query(
      'INSERT INTO notifications (title, message, user_id, status, category, created_at) VALUES ?',
      [values.map(v => [...v, new Date()])]
    );
    console.log(`[sendNotification] Successfully inserted notifications.`);

  } catch (error) {
    console.error(`[Notification Engine Error] Failed to send '${category}' notification:`, error);
  }
};

/**
 * Retrieve user IDs by Role (Admin, HR, Manager, etc.)
 */
const getUsersByRoles = async (roles) => {
  try {
    if (!roles || roles.length === 0) return [];
    
    // Fallback: Just search `users` since that holds the master auth logic
    const [rows] = await pool.query('SELECT id FROM users WHERE role IN (?)', [roles]);
    return rows.map(r => r.id);
  } catch (error) {
    console.error('getUsersByRoles Error:', error.message);
    return [];
  }
};

module.exports = {
  sendNotification,
  getUsersByRoles
};

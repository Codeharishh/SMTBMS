// backend/controllers/leadController.js
const pool = require('../config/db');
const { sendNotification, getUsersByRoles } = require('../utils/notificationUtils');

exports.getAllLeads = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Fetch leads error:', error);
        res.status(500).json({ message: 'Unable to extract leads database records.' });
    }
};

exports.createLead = async (req, res) => {
    try {
        const {
            contact_name, company, email, phone,
            stage, source, value, assigned_to, notes, closing_date
        } = req.body;

        if (!contact_name || !contact_name.trim()) {
            return res.status(400).json({ message: 'Contact name is required.' });
        }

        // closing_date: only pass a value if it's a non-empty string, otherwise NULL
        // This fixes the common "invalid date" MySQL error when frontend sends ""
        const safeClosingDate = closing_date && closing_date.trim() !== '' ? closing_date : null;

        const [result] = await pool.query(
            `INSERT INTO leads 
        (contact_name, company, email, phone, stage, source, value, assigned_to, notes, closing_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                contact_name.trim(),
                company || null,
                email || null,
                phone || null,
                stage || 'New Lead',
                source || 'CRM Terminal',
                parseFloat(value) || 0.00,
                assigned_to || null,
                notes || null,
                safeClosingDate
            ]
        );

        const [rows] = await pool.query('SELECT * FROM leads WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);

    } catch (error) {
        console.error('Create lead error:', error.message, error.code);
        res.status(500).json({
            message: 'Failed to write lead entry.',
            detail: error.message  // visible in Network tab for debugging
        });
    }
};

exports.updateLead = async (req, res) => {
    try {
        const {
            contact_name, company, email, phone,
            stage, source, value, assigned_to, notes, closing_date
        } = req.body;

        if (!contact_name || !contact_name.trim()) {
            return res.status(400).json({ message: 'Contact name is required.' });
        }

        const safeClosingDate = closing_date && closing_date.trim() !== '' ? closing_date : null;

        // Fetch old lead to compare stage
        const [oldRows] = await pool.query('SELECT stage FROM leads WHERE id = ?', [req.params.id]);
        const oldStage = oldRows.length ? oldRows[0].stage : null;

        await pool.query(
            `UPDATE leads 
       SET contact_name = ?, company = ?, email = ?, phone = ?, stage = ?, 
           source = ?, value = ?, assigned_to = ?, notes = ?, closing_date = ? 
       WHERE id = ?`,
            [
                contact_name.trim(),
                company || null,
                email || null,
                phone || null,
                stage || 'New Lead',
                source || 'CRM Terminal',
                parseFloat(value) || 0.00,
                assigned_to || null,
                notes || null,
                safeClosingDate,
                req.params.id
            ]
        );

        const [rows] = await pool.query('SELECT * FROM leads WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ message: 'Lead not found.' });
        
        // CRM Trigger - Stage Changed
        const newStage = stage || 'New Lead';
        if (oldStage && oldStage !== newStage) {
          const title = newStage === 'Closed Won' ? 'Deal Won!' : 'Lead Stage Updated';
          const message = newStage === 'Closed Won' 
            ? `The deal with ${contact_name.trim()} has been successfully closed!`
            : `The lead ${contact_name.trim()} has moved to stage: ${newStage}.`;
          
          const crmIds = await getUsersByRoles(['Admin', 'Manager', 'Sales']);
          const numericAssignedTo = parseInt(assigned_to, 10);
          const recipients = [...new Set([...crmIds, !isNaN(numericAssignedTo) ? numericAssignedTo : null].filter(Boolean))];
          await sendNotification(recipients, title, message, 'crm');
        }

        res.json(rows[0]);

    } catch (error) {
        console.error('Update lead error:', error.message, error.code);
        res.status(500).json({
            message: 'Failed to update lead.',
            detail: error.message
        });
    }
};

exports.deleteLead = async (req, res) => {
    try {
        await pool.query('DELETE FROM leads WHERE id = ?', [req.params.id]);
        res.json({ message: 'Lead record removed successfully.' });
    } catch (error) {
        console.error('Delete lead error:', error.message);
        res.status(500).json({ message: 'Unable to remove lead row.' });
    }
};
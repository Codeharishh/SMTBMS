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

exports.getNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC', [req.user.id]);
    const unread = rows.filter((item) => item.status === 'Unread').length;
    res.json({ notifications: rows, unread });
  } catch (error) {
    console.error('Get notifications error', error);
    res.status(500).json({ message: 'Unable to fetch notifications' });
  }
};

exports.markRead = async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET status = 'Read' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error', error);
    res.status(500).json({ message: 'Unable to mark notification as read' });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { title, message, user_id, is_read } = req.body;
    const [result] = await pool.query(
      'INSERT INTO notifications (title, message, user_id, status, created_at) VALUES (?, ?, ?, ?, NOW())',
      [title, message, user_id || null, is_read ? 'Read' : 'Unread']
    );
    const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create notification error', error);
    res.status(500).json({ message: 'Unable to create notification' });
  }
};

exports.getPreferences = async (req, res) => {
  try {
    await ensurePreferencesTable();
    const [rows] = await pool.query('SELECT * FROM notification_preferences WHERE user_id = ?', [req.user.id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Get preferences error', error);
    res.status(500).json({ message: 'Unable to fetch preferences' });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    await ensurePreferencesTable();
    const { channels, alertTypes } = req.body;

    await pool.query(`
      INSERT INTO notification_preferences 
      (user_id, email, sms, inApp, lowStock, movements, hrEvents, payroll, crm, reports)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      email = VALUES(email),
      sms = VALUES(sms),
      inApp = VALUES(inApp),
      lowStock = VALUES(lowStock),
      movements = VALUES(movements),
      hrEvents = VALUES(hrEvents),
      payroll = VALUES(payroll),
      crm = VALUES(crm),
      reports = VALUES(reports)
    `, [
      req.user.id,
      channels.email ? 1 : 0,
      channels.sms ? 1 : 0,
      channels.inApp ? 1 : 0,
      alertTypes.lowStock ? 1 : 0,
      alertTypes.movements ? 1 : 0,
      alertTypes.hrEvents ? 1 : 0,
      alertTypes.payroll ? 1 : 0,
      alertTypes.crm ? 1 : 0,
      alertTypes.reports ? 1 : 0
    ]);

    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Update preferences error', error);
    res.status(500).json({ message: 'Unable to update preferences' });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET status = 'Read' WHERE status = 'Unread' AND (user_id = ? OR user_id IS NULL)", [req.user.id]);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error', error);
    res.status(500).json({ message: 'Unable to mark all as read' });
  }
};

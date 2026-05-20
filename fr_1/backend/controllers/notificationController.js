const pool = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC');
    const unread = rows.filter((item) => item.is_read === 0 || item.is_read === false).length;
    res.json({ notifications: rows, unread });
  } catch (error) {
    console.error('Get notifications error', error);
    res.status(500).json({ message: 'Unable to fetch notifications' });
  }
};

exports.markRead = async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
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
      'INSERT INTO notifications (title, message, user_id, is_read, created_at) VALUES (?, ?, ?, ?, NOW())',
      [title, message, user_id || null, is_read ? 1 : 0]
    );
    const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create notification error', error);
    res.status(500).json({ message: 'Unable to create notification' });
  }
};

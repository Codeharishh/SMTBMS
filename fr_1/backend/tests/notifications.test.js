const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const pool = require('../config/db');
const { sendNotification, getUsersByRoles } = require('../utils/notificationUtils');

describe('Notification Engine Tests', () => {
  let testUserIds = [];

  before(async () => {
    // Clean up any old test data
    await pool.query("DELETE FROM notifications WHERE title LIKE '[TEST]%'");
    await pool.query("DELETE FROM notification_preferences WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test_%@smtbms.com')");
    await pool.query("DELETE FROM employees WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test_%@smtbms.com')");
    await pool.query("DELETE FROM users WHERE email LIKE 'test_%@smtbms.com'");

    // Create 2 test users (Admin, Employee)
    const [res1] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ('Test Admin', 'test_admin@smtbms.com', 'test', 'Admin')"
    );
    const [res2] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ('Test Emp', 'test_emp@smtbms.com', 'test', 'Employee')"
    );
    
    testUserIds = [res1.insertId, res2.insertId];

    // Set preferences: User 1 wants HR events, User 2 DOES NOT want HR events
    await pool.query(
      "INSERT INTO notification_preferences (user_id, hrEvents) VALUES (?, 1), (?, 0)",
      [testUserIds[0], testUserIds[1]]
    );
  });

  after(async () => {
    // Clean up
    await pool.query("DELETE FROM notifications WHERE title LIKE '[TEST]%'");
    await pool.query("DELETE FROM notification_preferences WHERE user_id IN (?)", [testUserIds]);
    await pool.query("DELETE FROM users WHERE id IN (?)", [testUserIds]);
  });

  test('sendNotification creates row when preference is ON (default or explicit)', async () => {
    await sendNotification([testUserIds[0]], '[TEST] HR Event', 'Test msg', 'hr_event');
    
    const [rows] = await pool.query("SELECT * FROM notifications WHERE user_id = ? AND title = '[TEST] HR Event'", [testUserIds[0]]);
    assert.strictEqual(rows.length, 1);
  });

  test('sendNotification DOES NOT create row when preference is OFF', async () => {
    await sendNotification([testUserIds[1]], '[TEST] HR Event', 'Test msg', 'hr_event');
    
    const [rows] = await pool.query("SELECT * FROM notifications WHERE user_id = ? AND title = '[TEST] HR Event'", [testUserIds[1]]);
    assert.strictEqual(rows.length, 0); // User 2 opted out
  });

  test('getUsersByRoles returns correct IDs', async () => {
    const adminIds = await getUsersByRoles(['Admin']);
    assert.ok(adminIds.includes(testUserIds[0]));
    assert.ok(!adminIds.includes(testUserIds[1]));
  });
});

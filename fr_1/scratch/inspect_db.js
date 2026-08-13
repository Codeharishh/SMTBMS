process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pool = require('../backend/config/db');

(async () => {
  try {
    const [notifCols] = await pool.query('DESCRIBE notifications');
    console.log('--- COLUMNS IN notifications ---');
    console.log(notifCols.map(c => `${c.Field} (${c.Type}) - Default: ${c.Default}`).join('\n'));

    const [prefCols] = await pool.query('DESCRIBE notification_preferences');
    console.log('\n--- COLUMNS IN notification_preferences ---');
    console.log(prefCols.map(c => `${c.Field} (${c.Type}) - Default: ${c.Default}`).join('\n'));

    process.exit(0);
  } catch (err) {
    console.error('Error inspecting DB:', err);
    process.exit(1);
  }
})();

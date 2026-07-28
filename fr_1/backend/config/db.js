const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 15000,

  // Keeps pooled connections alive instead of going stale. Not strictly
  // needed for a local DB, but harmless to keep — useful again if you ever
  // move back to a hosted DB later.
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// Session-level IST offset. Harmless to keep locally — guarantees
// NOW()/CURDATE() are IST regardless of how your local MySQL server's own
// timezone is configured.
pool.on('connection', (connection) => {
  connection.query('SET time_zone = "+05:30"', (err) => {
    if (err) console.error('⚠️ Failed to set session time_zone to IST:', err.message);
  });
});

pool.on('error', (err) => {
  console.error('⚠️ MySQL pool error:', err.code || err.message);
});

pool.getConnection()
  .then((conn) => {
    console.log('🎉 Successfully connected to local MySQL database!');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Local database connection failed:', err.message);
  });

module.exports = pool;
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
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

  // Aiven requires SSL for all connections. ca.pem must sit in the same
  // folder as this file (or adjust the path below to wherever you put it).
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, 'ca.pem'))
  },

  // Keeps pooled connections alive instead of going stale — useful for a
  // hosted DB since idle connections can otherwise get dropped.
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// Session-level IST offset. Guarantees NOW()/CURDATE() are IST regardless
// of how Aiven's server timezone is configured.
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
    console.log('🎉 Successfully connected to Aiven MySQL database!');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Aiven database connection failed:', err.message);
  });

module.exports = pool;
const pool = require('./config/db');

async function alterRating() {
  try {
    await pool.query("ALTER TABLE performance_reviews MODIFY COLUMN rating VARCHAR(50) DEFAULT 'Excellent'");
    console.log('Successfully altered rating column to VARCHAR');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
alterRating();

const pool = require('./config/db');

async function alterDB() {
  try {
    await pool.query(`ALTER TABLE performance_reviews 
      ADD COLUMN kpi_score INT DEFAULT 85, 
      ADD COLUMN attendance_score INT DEFAULT 96, 
      ADD COLUMN targets_met INT DEFAULT 88, 
      ADD COLUMN teamwork INT DEFAULT 84, 
      ADD COLUMN appraisal VARCHAR(10) DEFAULT '10%'`);
    console.log('Success');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
alterDB();

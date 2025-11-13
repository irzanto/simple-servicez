const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  ssl: process.env.PGSSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  testConnection: async () => {
    const c = await pool.connect();
    try {
      await c.query('SELECT 1');
    } finally {
      c.release();
    }
  }
};

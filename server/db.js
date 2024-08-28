const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || process.env.POSTGRES_USER,
  host: process.env.PGHOST || process.env.PGHOST,
  database: process.env.PGDATABASE || process.env.POSTGRES_DB,
  password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
  port: process.env.PGPORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
  } : false,
});

module.exports = pool;
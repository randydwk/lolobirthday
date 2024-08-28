const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'cocktail',
  password: 'postgres',
  port: 3002,
});

module.exports = pool;
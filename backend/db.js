const mysql = require('mysql2/promise');

let pool;

function getPool() {
  if (pool) return pool;
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASS || '';
  const database = process.env.DB_NAME || 'cronboy';

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
  });

  return pool;
}

async function query(sql, params = []) {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = { getPool, query };
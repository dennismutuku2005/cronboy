import mysql from 'mysql2/promise';

let pool;
export function getPool() {
  if (pool) return pool;
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASS || '';
  const database = process.env.DB_NAME || 'cronboy';
  pool = mysql.createPool({ host, port, user, password, database, waitForConnections: true, connectionLimit: 10 });
  return pool;
}

export async function query(sql, params) {
  const p = getPool();
  const [rows] = await p.execute(sql, params);
  return rows;
}

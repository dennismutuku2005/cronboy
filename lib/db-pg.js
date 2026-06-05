// PostgreSQL Database Client for CronBoy
// This mirrors the schema from migrations/schema.sql

import { Pool } from 'pg';

let pool = null;

function getPool() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'cronboy'}`;

  pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err);
  });

  return pool;
}

export async function query(text, params = []) {
  const start = Date.now();
  const p = getPool();
  try {
    const res = await p.query(text, params);
    const duration = Date.now() - start;
    console.log(`[DB] ${duration}ms | ${text.substring(0, 80)}`);
    return res;
  } catch (error) {
    console.error('[DB] Query error:', error.message);
    throw error;
  }
}

export async function getSingle(text, params = []) {
  const res = await query(text, params);
  return res.rows?.[0] || null;
}

export async function getMany(text, params = []) {
  const res = await query(text, params);
  return res.rows || [];
}

export async function insertReturning(table, data, returning = 'id') {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING ${returning}`;
  const res = await query(sql, values);
  return res.rows[0];
}

export async function updateReturning(table, data, whereKey, whereValue, returning = 'id') {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
  const sql = `UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE ${whereKey} = $${keys.length + 1} RETURNING ${returning}`;
  const res = await query(sql, [...values, whereValue]);
  return res.rows[0];
}

// Check if database is connected and tables exist
export async function healthCheck() {
  try {
    const res = await query('SELECT NOW() as time, (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \'public\') as table_count');
    return { ok: true, time: res.rows[0]?.time, tableCount: parseInt(res.rows[0]?.table_count || '0') };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Run migration from schema file
export async function runMigration() {
  const fs = await import('fs');
  const path = await import('path');
  
  try {
    const schemaPath = path.join(process.cwd(), 'migrations', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const stmt of statements) {
      if (stmt.length > 5) {
        try {
          await query(stmt);
        } catch (e) {
          // Skip errors like "already exists"
          if (!e.message.includes('already exists')) {
            console.error('[Migration] Error:', e.message);
          }
        }
      }
    }
    return { ok: true, count: statements.length };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export default { query, getSingle, getMany, insertReturning, updateReturning, healthCheck, runMigration };



import { NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const env = searchParams.get('env');
    const search = searchParams.get('search');

    const pool = getPool();

    // Build log query with optional filters.
    let sql = `
      SELECT l.id, l.timestamp, l.status, l.duration, l.message, s.subdomain, s.linked_cron, s.env
      FROM logs l
      LEFT JOIN subdomains s ON l.subdomain_id = s.id
    `;
    const conditions = [];
    const params = [];

    if (env && env !== 'All') {
      conditions.push('s.env = ?');
      params.push(env);
    }

    if (search) {
      conditions.push('(s.subdomain LIKE ? OR s.linked_cron LIKE ? OR l.message LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY l.timestamp DESC LIMIT 500';

    const [rows] = await pool.execute(sql, params);
    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error('[API] logs/list error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

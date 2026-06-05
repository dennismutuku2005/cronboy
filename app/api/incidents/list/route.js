import { NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function GET() {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT l.id, l.subdomain_id, s.subdomain, l.timestamp, l.status, l.duration, l.message as details
      FROM logs l
      LEFT JOIN subdomains s ON s.id = l.subdomain_id
      ORDER BY l.timestamp DESC
      LIMIT 50
    `);
    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error('[API] incidents/list error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

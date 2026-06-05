import { NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function GET() {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM cron_jobs ORDER BY created_at DESC');
    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error('[API] cronjobs/list error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

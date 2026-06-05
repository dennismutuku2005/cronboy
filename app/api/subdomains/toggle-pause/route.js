import { NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function POST(req) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 });
    }

    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM subdomains WHERE id = ?', [id]);
    const sub = rows?.[0];

    if (!sub) {
      return NextResponse.json({ ok: false, error: 'Subdomain not found' }, { status: 404 });
    }

    const wasPaused = sub.status === 'paused';
    await pool.execute(
      'UPDATE subdomains SET status = ?, response_time = ?, updated_at = NOW() WHERE id = ?',
      [wasPaused ? 'healthy' : 'paused', wasPaused ? 115 : 0, id]
    );

    return NextResponse.json({ ok: true, wasPaused });
  } catch (err) {
    console.error('[API] subdomains/toggle-pause error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

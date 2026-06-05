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

    // Simulate a ping check
    const ping = sub.status === 'down' ? 0 : Math.floor(Math.random() * 25) + 75;
    const newStatus = sub.status === 'down' ? 'down' : ping > 400 ? 'degraded' : 'healthy';
    let history = sub.history;
    if (typeof history === 'string') {
      try { history = JSON.parse(history); } catch { history = [0,0,0,0,0,0,0]; }
    }
    history = [...(history || [0,0,0,0,0,0,0]).slice(1), ping];
    const historyStr = JSON.stringify(history);

    await pool.execute(
      'UPDATE subdomains SET status = ?, response_time = ?, last_checked = NOW(), history = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, ping, historyStr, id]
    );

    // Log the check
    await pool.execute(
      'INSERT INTO logs (subdomain_id, status, duration, message, response_code) VALUES (?, ?, ?, ?, ?)',
      [id, newStatus, ping > 0 ? `${ping}ms` : '—', `Manual trigger: ${newStatus}`, ping > 0 ? 200 : 503]
    );

    return NextResponse.json({ ok: true, status: newStatus, response_time: ping });
  } catch (err) {
    console.error('[API] subdomains/trigger-check error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

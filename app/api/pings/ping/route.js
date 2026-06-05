import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

async function doPing(url) {
  const start = Date.now();
  try {
    const res = await fetch(url, { method: 'GET' });
    const ms = Date.now() - start;
    return { ok: true, status: 'ok', httpStatus: res.status, response_ms: ms };
  } catch (err) {
    const ms = Date.now() - start;
    return { ok: false, status: 'error', error: err.message, response_ms: ms };
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { id } = body || {};
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const rows = await query('SELECT * FROM pings WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return NextResponse.json({ error: 'target not found' }, { status: 404 });
    const target = rows[0];
    const result = await doPing(target.url);

    const now = new Date();
    const statusText = result.ok ? (result.httpStatus ? 'ok' : 'ok') : 'error';
    await query('INSERT INTO ping_logs (ping_id, status, http_status, response_ms) VALUES (?, ?, ?, ?)', [id, statusText, result.httpStatus || null, result.response_ms || null]);
    await query('UPDATE pings SET last_ping_at = ?, last_status = ?, last_response_ms = ? WHERE id = ?', [now.toISOString().slice(0, 19).replace('T', ' '), statusText, result.response_ms || null, id]);

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function POST() {
  try {
    // select pings where last_ping_at is null or older than interval
    const rows = await query('SELECT * FROM pings', []);
    const now = new Date();
    const due = rows.filter(r => {
      if (!r.last_ping_at) return true;
      const last = new Date(r.last_ping_at);
      const minutes = (now - last) / 60000;
      return minutes >= (r.interval_mins || 5);
    });

    const results = [];
    for (const t of due) {
      try {
        const res = await fetch(t.url, { method: 'GET' });
        const ms = 0; // we don't measure here precisely
        await query('INSERT INTO ping_logs (ping_id, status, http_status, response_ms) VALUES (?, ?, ?, ?)', [t.id, 'ok', res.status, ms]);
        await query('UPDATE pings SET last_ping_at = ?, last_status = ?, last_response_ms = ? WHERE id = ?', [now.toISOString().slice(0, 19).replace('T', ' '), 'ok', ms, t.id]);
        results.push({ id: t.id, ok: true, httpStatus: res.status });
      } catch (err) {
        await query('INSERT INTO ping_logs (ping_id, status, http_status, response_ms) VALUES (?, ?, ?, ?)', [t.id, 'error', null, null]);
        await query('UPDATE pings SET last_ping_at = ?, last_status = ? WHERE id = ?', [now.toISOString().slice(0, 19).replace('T', ' '), 'error', t.id]);
        results.push({ id: t.id, ok: false, error: err.message });
      }
    }

    return NextResponse.json({ ok: true, run: results });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'server error' }, { status: 500 });
  }
}

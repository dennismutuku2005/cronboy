import { NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function POST(req) {
  try {
    const body = await req.json();
    const { subdomain, env, checkInterval, sslAutoRenew, linkedCron, cronSchedule } = body;

    if (!subdomain || !subdomain.trim()) {
      return NextResponse.json({ ok: false, error: 'Subdomain is required' }, { status: 400 });
    }

    const pool = getPool();

    // Check if already exists
    const [existingRows] = await pool.execute('SELECT id FROM subdomains WHERE subdomain = ?', [subdomain.trim()]);
    if (existingRows.length > 0) {
      return NextResponse.json({ ok: false, error: 'Subdomain already exists' }, { status: 409 });
    }

    const [result] = await pool.execute(
      `INSERT INTO subdomains (subdomain, env, status, response_time, uptime, ssl_issuer, ssl_expiry_days, check_interval, ssl_auto_renew, linked_cron, cron_schedule, history)
       VALUES (?, ?, 'healthy', 0, 100.0, 'Let''s Encrypt Authority X3', 90, ?, ?, ?, ?, ?)`,
      [
        subdomain.trim(),
        env || 'Production',
        checkInterval || '5m',
        sslAutoRenew ?? true,
        linkedCron || null,
        cronSchedule || null,
        JSON.stringify([0, 0, 0, 0, 0, 0, 0]),
      ]
    );

    return NextResponse.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error('[API] subdomains/create error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}


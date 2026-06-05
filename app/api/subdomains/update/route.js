import { NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 });
    }

    const allowedFields = ['subdomain', 'env', 'status', 'response_time', 'uptime', 'ssl_issuer', 'ssl_expiry_days', 'linked_cron', 'cron_schedule', 'check_interval', 'ssl_auto_renew', 'history'];
    const setClauses = [];
    const values = [];

    for (const [key, val] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = ?`);
        values.push(val);
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ ok: false, error: 'No valid fields to update' }, { status: 400 });
    }

    values.push(id);
    
    const pool = getPool();
    const sql = `UPDATE subdomains SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = ?`;
    const [result] = await pool.execute(sql, values);
    
    return NextResponse.json({ ok: true, affected: result.affectedRows });
  } catch (err) {
    console.error('[API] subdomains/update error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

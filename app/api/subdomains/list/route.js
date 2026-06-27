import { NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const env = searchParams.get('env');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM subdomains';
    const conditions = [];
    const params = [];

    if (env && env !== 'All') {
      params.push(env);
      conditions.push(`env = ?`);
    }
    if (status && status !== 'All') {
      params.push(status.toLowerCase());
      conditions.push(`status = ?`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(subdomain LIKE ? OR linked_cron LIKE ?)`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY updated_at DESC, created_at DESC';

    const pool = getPool();
    const [rows] = await pool.execute(sql, params);

    let subdomainsWithLogs = rows;
    if (rows.length > 0) {
      const subdomainIds = rows.map(r => r.id);
      const placeholders = subdomainIds.map(() => '?').join(',');
      const [logs] = await pool.execute(
        `SELECT * FROM logs WHERE subdomain_id IN (${placeholders}) ORDER BY timestamp DESC LIMIT 100`,
        subdomainIds
      );
      subdomainsWithLogs = rows.map(sub => ({
        ...sub,
        logs: logs.filter(log => log.subdomain_id === sub.id)
      }));
    }

    return NextResponse.json({ ok: true, data: subdomainsWithLogs });
  } catch (err) {
    console.error('[API] subdomains/list error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

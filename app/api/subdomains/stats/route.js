import { NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function GET() {
  try {
    const pool = getPool();
    const [total] = await pool.execute('SELECT COUNT(*) as count FROM subdomains');
    const [healthy] = await pool.execute("SELECT COUNT(*) as count FROM subdomains WHERE status = 'healthy'");
    const [degraded] = await pool.execute("SELECT COUNT(*) as count FROM subdomains WHERE status = 'degraded'");
    const [down] = await pool.execute("SELECT COUNT(*) as count FROM subdomains WHERE status = 'down'");
    const [paused] = await pool.execute("SELECT COUNT(*) as count FROM subdomains WHERE status = 'paused'");
    const [activeCrons] = await pool.execute("SELECT COUNT(*) as count FROM subdomains WHERE linked_cron IS NOT NULL AND linked_cron != '' AND status != 'paused'");
    const [failures24h] = await pool.execute(
      "SELECT COUNT(*) as count FROM logs WHERE status IN ('down','error') AND timestamp > NOW() - INTERVAL 24 HOUR"
    );

    return NextResponse.json({
      ok: true,
      stats: {
        total: Number(total?.[0]?.count || 0),
        healthy: Number(healthy?.[0]?.count || 0),
        degraded: Number(degraded?.[0]?.count || 0),
        down: Number(down?.[0]?.count || 0),
        paused: Number(paused?.[0]?.count || 0),
        activeCrons: Number(activeCrons?.[0]?.count || 0),
        failures24h: Number(failures24h?.[0]?.count || 0),
      }
    });
  } catch (err) {
    console.error('[API] subdomains/stats error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}


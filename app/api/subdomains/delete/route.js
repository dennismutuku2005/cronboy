import { NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function POST(req) {
  try {
    const body = await req.json();
    const { ids } = body;
    
    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
      return NextResponse.json({ ok: false, error: 'ids array is required' }, { status: 400 });
    }

    const idList = Array.isArray(ids) ? ids : [ids];
    const placeholders = idList.map(() => '?').join(',');
    const pool = getPool();

    await pool.execute(`DELETE FROM logs WHERE subdomain_id IN (${placeholders})`, idList);
    const [result] = await pool.execute(`DELETE FROM subdomains WHERE id IN (${placeholders})`, idList);

    return NextResponse.json({ ok: true, deleted: result.affectedRows });
  } catch (err) {
    console.error('[API] subdomains/delete error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

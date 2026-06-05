import { NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function GET() {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT NOW() as time');
    return NextResponse.json({ ok: true, time: rows?.[0]?.time });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 503 });
  }
}

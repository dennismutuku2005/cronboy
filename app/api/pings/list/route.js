import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET() {
  try {
    const rows = await query('SELECT * FROM pings ORDER BY created_at DESC', []);
    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'server error' }, { status: 500 });
  }
}

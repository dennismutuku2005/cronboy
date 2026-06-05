import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET() {
  try {
    const rows = await query('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT 100');
    return NextResponse.json({ ok: true, rows });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name, role } = body || {};
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
    const id = (globalThis.crypto && globalThis.crypto.randomUUID) ? globalThis.crypto.randomUUID() : `user-${Date.now()}`;
    await query('INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?)', [id, email, name || null, role || 'user']);
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'server error' }, { status: 500 });
  }
}

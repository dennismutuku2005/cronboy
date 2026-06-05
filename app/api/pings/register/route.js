import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

function normalizeUrl(candidate) {
  if (!candidate) return null;
  let url = candidate.trim();
  if (/^https?:\/\//i.test(url)) return url;
  // try https first
  return `https://${url}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, url, interval_mins } = body || {};
    if (!url || !name) return NextResponse.json({ error: 'name and url required' }, { status: 400 });
    const normalized = normalizeUrl(url);
    const id = (globalThis.crypto && globalThis.crypto.randomUUID) ? globalThis.crypto.randomUUID() : `ping-${Date.now()}`;
    await query('INSERT INTO pings (id, name, url, interval_mins) VALUES (?, ?, ?, ?)', [id, name, normalized, parseInt(interval_mins || 5, 10)]);
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'server error' }, { status: 500 });
  }
}

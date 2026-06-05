import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, text } = body || {};
    if (!phone || !text) return NextResponse.json({ error: 'phone and text required' }, { status: 400 });

    const apiKey = process.env.PACE_SEND_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Server missing PACE_SEND_API_KEY', status: 'no-key' }, { status: 500 });

    const resp = await fetch('https://whatsapp.pacewisp.co.ke/send/primary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ phone, text })
    });

    const data = await resp.text().catch(() => null);
    if (!resp.ok) return NextResponse.json({ error: 'Upstream error', status: resp.status, data }, { status: 502 });
    return NextResponse.json({ ok: true, status: resp.status, data });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

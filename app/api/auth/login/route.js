import { NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ ok: false, error: 'Username and password required' }, { status: 400 });
    }

    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, policies FROM users WHERE (LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)) AND password = ?',
      [username.trim(), username.trim(), password]
    );

    const user = rows?.[0];

    if (!user) {
      return NextResponse.json({ ok: false, error: 'Invalid username or password' }, { status: 401 });
    }

    let policies = user.policies;
    if (typeof policies === 'string') {
      try { policies = JSON.parse(policies); } catch { policies = []; }
    }

    const payload = {
      userId: user.id,
      role: user.role,
      name: user.name,
      exp: Date.now() + (8 * 60 * 60 * 1000), // 8 hours
      iat: Date.now(),
    };
    const sessionToken = Buffer.from(JSON.stringify(payload)).toString('base64');

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        policies: Array.isArray(policies) ? policies : [],
      },
      sessionToken,
    });
  } catch (err) {
    console.error('[API] auth/login error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

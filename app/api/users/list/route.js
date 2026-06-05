import { NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function GET() {
  const pool = getPool();
  const [rows] = await pool.execute(
    'SELECT id, name, email, role, policies, created_at FROM users ORDER BY created_at DESC'
  );
  
  const mapped = rows.map(u => {
    let policies = u.policies;
    if (typeof policies === 'string') {
      try { policies = JSON.parse(policies); } catch { policies = []; }
    }
    return { ...u, policies: Array.isArray(policies) ? policies : [] };
  });

  return NextResponse.json({ ok: true, data: mapped });
}

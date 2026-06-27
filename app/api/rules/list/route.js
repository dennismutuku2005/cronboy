import { NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';

export async function GET() {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM alert_rules ORDER BY created_at DESC');
    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error('[API] rules/list error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, condition, enabled } = body;
    const pool = getPool();
    const [result] = await pool.execute(
      'INSERT INTO alert_rules (name, rule_condition, enabled) VALUES (?, ?, ?)',
      [name || 'Untitled Rule', condition || '', enabled ?? true]
    );
    return NextResponse.json({ ok: true, id: result.insertId });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, enabled, name, condition } = body;
    const pool = getPool();
    const sets = [];
    const vals = [];
    if (enabled !== undefined) { sets.push('enabled = ?'); vals.push(enabled); }
    if (name !== undefined) { sets.push('name = ?'); vals.push(name); }
    if (condition !== undefined) { sets.push('rule_condition = ?'); vals.push(condition); }
    if (sets.length === 0) return NextResponse.json({ ok: false, error: 'No fields' }, { status: 400 });
    vals.push(id);
    await pool.execute(`UPDATE alert_rules SET ${sets.join(', ')} WHERE id = ?`, vals);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

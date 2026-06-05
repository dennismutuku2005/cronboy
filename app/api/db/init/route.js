import { NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const pool = getPool();

    // Run schema migration
    const schemaPath = path.join(process.cwd(), 'migrations', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 5 && !s.startsWith('--'));
      
      for (const stmt of statements) {
        try {
          await pool.execute(stmt);
        } catch (e) {
          if (!e.message?.includes('already exists')) {
            console.error('[Migration] Error:', e.message);
          }
        }
      }
    }

    // Check if we need to seed data
    const [countRows] = await pool.execute('SELECT COUNT(*) as count FROM subdomains');
    const isEmpty = Number(countRows?.[0]?.count || 0) === 0;

    let seeded = false;
    if (isEmpty) {
      const seedPath = path.join(process.cwd(), 'scripts', 'seed-data.sql');
      if (fs.existsSync(seedPath)) {
        const seedSQL = fs.readFileSync(seedPath, 'utf8');
        const statements = seedSQL
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 5 && !s.startsWith('--'));
        
        for (const stmt of statements) {
          try {
            await pool.execute(stmt);
          } catch (e) {
            if (!e.message?.includes('already exists') && !e.message?.includes('Duplicate')) {
              console.error('[Seed] Error:', e.message);
            }
          }
        }
        seeded = true;
      }
    }

    const [healthRows] = await pool.execute('SELECT NOW() as time');
    
    return NextResponse.json({
      ok: true,
      migration: { ok: true },
      seeded,
      health: { ok: true, time: healthRows?.[0]?.time },
    });
  } catch (err) {
    console.error('[API] db/init error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

const express = require('express');
const fs = require('fs');
const path = require('path');
const { query, getPool } = require('./db');
const { sendDomainReport } = require('./whatsapp');

const app = express();
app.use(express.json());

const RUN_DUE_INTERVAL_SECONDS = parseInt(process.env.PING_RUN_INTERVAL_SECONDS || '60', 10);

function normalizeUrl(candidate) {
  if (!candidate) return null;
  let url = candidate.trim();
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

async function doPing(url) {
  const start = Date.now();
  try {
    const res = await fetch(url, { method: 'GET' });
    const ms = Date.now() - start;
    return { ok: true, status: 'ok', httpStatus: res.status, response_ms: ms };
  } catch (err) {
    const ms = Date.now() - start;
    return { ok: false, status: 'error', error: err.message, response_ms: ms };
  }
}

async function runDuePings() {
  const rows = await query('SELECT * FROM pings', []);
  const now = new Date();
  const due = rows.filter((r) => {
    if (!r.last_ping_at) return true;
    const last = new Date(r.last_ping_at);
    const minutes = (now - last) / 60000;
    return minutes >= (r.interval_mins || 5);
  });

  const results = [];
  for (const t of due) {
    try {
      const result = await doPing(t.url);
      const statusText = result.ok ? 'ok' : 'error';
      await query('INSERT INTO ping_logs (ping_id, status, http_status, response_ms) VALUES (?, ?, ?, ?)', [t.id, statusText, result.httpStatus || null, result.response_ms || null]);
      await query('UPDATE pings SET last_ping_at = ?, last_status = ?, last_response_ms = ? WHERE id = ?', [now.toISOString().slice(0, 19).replace('T', ' '), statusText, result.response_ms || null, t.id]);
      results.push({ id: t.id, ok: result.ok, httpStatus: result.httpStatus || null });
    } catch (err) {
      await query('INSERT INTO ping_logs (ping_id, status, http_status, response_ms) VALUES (?, ?, ?, ?)', [t.id, 'error', null, null]);
      await query('UPDATE pings SET last_ping_at = ?, last_status = ? WHERE id = ?', [now.toISOString().slice(0, 19).replace('T', ' '), 'error', t.id]);
      results.push({ id: t.id, ok: false, error: err.message });
    }
  }
  return results;
}

async function initDatabase() {
  const pool = getPool();
  const schemaPath = path.join(__dirname, '../migrations/schema.sql');
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 5 && !s.startsWith('--'));

  for (const stmt of statements) {
    try {
      await pool.execute(stmt);
    } catch (e) {
      if (!e.message?.includes('already exists')) {
        console.error('[Migration] Error:', e.message);
      }
    }
  }

  const [countRows] = await pool.execute('SHOW TABLES LIKE \'subdomains\'');
  if (countRows.length === 0) {
    console.log('[Migration] schema applied');
  }
}

app.post('/api/db/init', async (req, res) => {
  try {
    await initDatabase();
    res.json({ ok: true });
  } catch (err) {
    console.error('[API] db/init error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/db/health', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT NOW() as time');
    res.json({ ok: true, time: rows?.[0]?.time });
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ ok: false, error: 'Username and password required' });

    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, policies FROM users WHERE (LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)) AND password = ?',
      [username.trim(), username.trim(), password]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ ok: false, error: 'Invalid username or password' });

    let policies = user.policies;
    if (typeof policies === 'string') {
      try { policies = JSON.parse(policies); } catch { policies = []; }
    }

    const payload = {
      userId: user.id,
      role: user.role,
      name: user.name,
      exp: Date.now() + 8 * 60 * 60 * 1000,
      iat: Date.now(),
    };
    const sessionToken = Buffer.from(JSON.stringify(payload)).toString('base64');

    res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, policies: Array.isArray(policies) ? policies : [] }, sessionToken });
  } catch (err) {
    console.error('[API] auth/login error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/cronjobs/list', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM cron_jobs ORDER BY created_at DESC');
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error('[API] cronjobs/list error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/subdomains/list', async (req, res) => {
  try {
    const env = req.query.env;
    const status = req.query.status;
    const search = req.query.search;

    let sql = 'SELECT * FROM subdomains';
    const conditions = [];
    const params = [];

    if (env && env !== 'All') { params.push(env); conditions.push('env = ?'); }
    if (status && status !== 'All') { params.push(status.toLowerCase()); conditions.push('status = ?'); }
    if (search) { params.push(`%${search}%`); conditions.push('(subdomain LIKE ? OR linked_cron LIKE ?)'); params.push(`%${search}%`); }
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY updated_at DESC, created_at DESC';

    const pool = getPool();
    const [rows] = await pool.execute(sql, params);
    let subdomainsWithLogs = rows;
    if (rows.length > 0) {
      const subdomainIds = rows.map(r => r.id);
      const placeholders = subdomainIds.map(() => '?').join(',');
      const [logs] = await pool.execute(`SELECT * FROM logs WHERE subdomain_id IN (${placeholders}) ORDER BY timestamp DESC LIMIT 100`, subdomainIds);
      subdomainsWithLogs = rows.map(sub => ({ ...sub, logs: logs.filter(log => log.subdomain_id === sub.id) }));
    }
    res.json({ ok: true, data: subdomainsWithLogs });
  } catch (err) {
    console.error('[API] subdomains/list error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/subdomains/create', async (req, res) => {
  try {
    const { subdomain, env, checkInterval, sslAutoRenew, linkedCron, cronSchedule } = req.body;
    if (!subdomain || !subdomain.trim()) return res.status(400).json({ ok: false, error: 'Subdomain is required' });

    const pool = getPool();
    const [existingRows] = await pool.execute('SELECT id FROM subdomains WHERE subdomain = ?', [subdomain.trim()]);
    if (existingRows.length > 0) return res.status(409).json({ ok: false, error: 'Subdomain already exists' });

    const [result] = await pool.execute(
      `INSERT INTO subdomains (subdomain, env, status, response_time, uptime, ssl_issuer, ssl_expiry_days, check_interval, ssl_auto_renew, linked_cron, cron_schedule, history)
       VALUES (?, ?, 'healthy', 0, 100.0, 'Let''s Encrypt Authority X3', 90, ?, ?, ?, ?, ?)`,
      [subdomain.trim(), env || 'Production', checkInterval || '5m', sslAutoRenew ?? true, linkedCron || null, cronSchedule || null, JSON.stringify([0, 0, 0, 0, 0, 0, 0])]
    );

    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error('[API] subdomains/create error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.patch('/api/subdomains/update', async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ ok: false, error: 'id is required' });

    const allowedFields = ['subdomain', 'env', 'status', 'response_time', 'uptime', 'ssl_issuer', 'ssl_expiry_days', 'linked_cron', 'cron_schedule', 'check_interval', 'ssl_auto_renew', 'history'];
    const setClauses = [];
    const values = [];
    for (const [key, val] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = ?`);
        values.push(val);
      }
    }
    if (setClauses.length === 0) return res.status(400).json({ ok: false, error: 'No valid fields to update' });
    values.push(id);
    const pool = getPool();
    const sql = `UPDATE subdomains SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = ?`;
    const [result] = await pool.execute(sql, values);
    res.json({ ok: true, affected: result.affectedRows });
  } catch (err) {
    console.error('[API] subdomains/update error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/subdomains/delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || (Array.isArray(ids) && ids.length === 0)) return res.status(400).json({ ok: false, error: 'ids array is required' });
    const idList = Array.isArray(ids) ? ids : [ids];
    const placeholders = idList.map(() => '?').join(',');
    await query(`DELETE FROM logs WHERE subdomain_id IN (${placeholders})`, idList);
    const [result] = await getPool().execute(`DELETE FROM subdomains WHERE id IN (${placeholders})`, idList);
    res.json({ ok: true, deleted: result.affectedRows });
  } catch (err) {
    console.error('[API] subdomains/delete error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/subdomains/toggle-pause', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ ok: false, error: 'id is required' });
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM subdomains WHERE id = ?', [id]);
    const sub = rows[0];
    if (!sub) return res.status(404).json({ ok: false, error: 'Subdomain not found' });
    const wasPaused = sub.status === 'paused';
    await pool.execute('UPDATE subdomains SET status = ?, response_time = ?, updated_at = NOW() WHERE id = ?', [wasPaused ? 'healthy' : 'paused', wasPaused ? 115 : 0, id]);
    res.json({ ok: true, wasPaused });
  } catch (err) {
    console.error('[API] subdomains/toggle-pause error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/subdomains/trigger-check', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ ok: false, error: 'id is required' });
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM subdomains WHERE id = ?', [id]);
    const sub = rows[0];
    if (!sub) return res.status(404).json({ ok: false, error: 'Subdomain not found' });
    const ping = sub.status === 'down' ? 0 : Math.floor(Math.random() * 25) + 75;
    const newStatus = sub.status === 'down' ? 'down' : ping > 400 ? 'degraded' : 'healthy';
    let history = sub.history;
    if (typeof history === 'string') {
      try { history = JSON.parse(history); } catch { history = [0,0,0,0,0,0,0]; }
    }
    history = [...(history || [0,0,0,0,0,0,0]).slice(1), ping];
    await pool.execute('UPDATE subdomains SET status = ?, response_time = ?, last_checked = NOW(), history = ?, updated_at = NOW() WHERE id = ?', [newStatus, ping, JSON.stringify(history), id]);
    await pool.execute('INSERT INTO logs (subdomain_id, status, duration, message, response_code) VALUES (?, ?, ?, ?, ?)', [id, newStatus, ping > 0 ? `${ping}ms` : '—', `Manual trigger: ${newStatus}`, ping > 0 ? 200 : 503]);
    res.json({ ok: true, status: newStatus, response_time: ping });
  } catch (err) {
    console.error('[API] subdomains/trigger-check error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/subdomains/stats', async (req, res) => {
  try {
    const pool = getPool();
    const [total] = await pool.execute('SELECT COUNT(*) as count FROM subdomains');
    const [healthy] = await pool.execute("SELECT COUNT(*) as count FROM subdomains WHERE status = 'healthy'");
    const [degraded] = await pool.execute("SELECT COUNT(*) as count FROM subdomains WHERE status = 'degraded'");
    const [down] = await pool.execute("SELECT COUNT(*) as count FROM subdomains WHERE status = 'down'");
    const [paused] = await pool.execute("SELECT COUNT(*) as count FROM subdomains WHERE status = 'paused'");
    const [activeCrons] = await pool.execute("SELECT COUNT(*) as count FROM subdomains WHERE linked_cron IS NOT NULL AND linked_cron != '' AND status != 'paused'");
    const [failures24h] = await pool.execute("SELECT COUNT(*) as count FROM logs WHERE status IN ('down','error') AND timestamp > NOW() - INTERVAL 24 HOUR");
    res.json({ ok: true, stats: { total: Number(total?.[0]?.count || 0), healthy: Number(healthy?.[0]?.count || 0), degraded: Number(degraded?.[0]?.count || 0), down: Number(down?.[0]?.count || 0), paused: Number(paused?.[0]?.count || 0), activeCrons: Number(activeCrons?.[0]?.count || 0), failures24h: Number(failures24h?.[0]?.count || 0) } });
  } catch (err) {
    console.error('[API] subdomains/stats error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/logs/list', async (req, res) => {
  try {
    const { env, search } = req.query;
    let sql = `SELECT l.id, l.timestamp, l.status, l.duration, l.message, s.subdomain, s.linked_cron, s.env FROM logs l LEFT JOIN subdomains s ON l.subdomain_id = s.id`;
    const conditions = [];
    const params = [];
    if (env && env !== 'All') { conditions.push('s.env = ?'); params.push(env); }
    if (search) { conditions.push('(s.subdomain LIKE ? OR s.linked_cron LIKE ? OR l.message LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY l.timestamp DESC LIMIT 500';
    const [rows] = await getPool().execute(sql, params);
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error('[API] logs/list error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/pings/list', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM pings ORDER BY created_at DESC', []);
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/pings/register', async (req, res) => {
  try {
    const { name, url, interval_mins } = req.body;
    if (!url || !name) return res.status(400).json({ ok: false, error: 'name and url required' });
    const normalized = normalizeUrl(url);
    const id = `ping-${Date.now()}`;
    await query('INSERT INTO pings (id, name, url, interval_mins) VALUES (?, ?, ?, ?)', [id, name, normalized, parseInt(interval_mins || 5, 10)]);
    res.json({ ok: true, id });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/pings/ping', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ ok: false, error: 'id required' });
    const rows = await query('SELECT * FROM pings WHERE id = ?', [id]);
    if (!rows || !rows.length) return res.status(404).json({ ok: false, error: 'target not found' });
    const target = rows[0];
    const result = await doPing(target.url);
    const now = new Date();
    const statusText = result.ok ? 'ok' : 'error';
    await query('INSERT INTO ping_logs (ping_id, status, http_status, response_ms) VALUES (?, ?, ?, ?)', [id, statusText, result.httpStatus || null, result.response_ms || null]);
    await query('UPDATE pings SET last_ping_at = ?, last_status = ?, last_response_ms = ? WHERE id = ?', [now.toISOString().slice(0, 19).replace('T', ' '), statusText, result.response_ms || null, id]);
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/pings/run-due', async (req, res) => {
  try {
    const results = await runDuePings();
    res.json({ ok: true, run: results });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/users/list', async (req, res) => {
  try {
    const [rows] = await getPool().execute('SELECT id, name, email, role, policies, created_at FROM users ORDER BY created_at DESC');
    const mapped = rows.map(u => {
      let policies = u.policies;
      if (typeof policies === 'string') {
        try { policies = JSON.parse(policies); } catch { policies = []; }
      }
      return { ...u, policies: Array.isArray(policies) ? policies : [] };
    });
    res.json({ ok: true, data: mapped });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { email, name, role } = req.body;
    if (!email) return res.status(400).json({ ok: false, error: 'email required' });
    const id = `user-${Date.now()}`;
    await query('INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?)', [id, email, name || null, role || 'user']);
    res.json({ ok: true, id });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/rules/list', async (req, res) => {
  try {
    const [rows] = await getPool().execute('SELECT * FROM alert_rules ORDER BY created_at DESC');
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/rules/list', async (req, res) => {
  try {
    const { name, condition, enabled } = req.body;
    const [result] = await getPool().execute('INSERT INTO alert_rules (name, rule_condition, enabled) VALUES (?, ?, ?)', [name || 'Untitled Rule', condition || '', enabled ?? true]);
    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.patch('/api/rules/list', async (req, res) => {
  try {
    const { id, enabled, name, condition } = req.body;
    const sets = [];
    const vals = [];
    if (enabled !== undefined) { sets.push('enabled = ?'); vals.push(enabled); }
    if (name !== undefined) { sets.push('name = ?'); vals.push(name); }
    if (condition !== undefined) { sets.push('rule_condition = ?'); vals.push(condition); }
    if (!sets.length) return res.status(400).json({ ok: false, error: 'No fields' });
    vals.push(id);
    await getPool().execute(`UPDATE alert_rules SET ${sets.join(', ')} WHERE id = ?`, vals);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/whatsapp/primary', async (req, res) => {
  try {
    const { phone, text } = req.body;
    if (!phone || !text) return res.status(400).json({ ok: false, error: 'phone and text required' });

    const apiKey = process.env.PACE_SEND_API_KEY;
    if (!apiKey) return res.status(500).json({ ok: false, error: 'Server missing PACE_SEND_API_KEY' });

    const response = await fetch('https://whatsapp.pacewisp.co.ke/send/primary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ phone, text }),
    });
    const data = await response.text().catch(() => null);
    if (!response.ok) return res.status(502).json({ ok: false, error: 'Upstream error', status: response.status, data });
    res.json({ ok: true, status: response.status, data });
  } catch (err) {
    console.error('[API] whatsapp/primary error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/reports/send', async (req, res) => {
  try {
    const { domains, reportType = 'summary', recipientPhone } = req.body;
    if (!domains || !Array.isArray(domains) || domains.length === 0) return res.status(400).json({ success: false, error: 'No domains provided' });
    if (!['summary', 'detailed', 'critical'].includes(reportType)) return res.status(400).json({ success: false, error: 'Invalid report type' });

    const result = await sendDomainReport(domains, reportType, recipientPhone);
    if (result.success) return res.json({ success: true, message: result.message });
    res.status(500).json({ success: false, error: result.error });
  } catch (err) {
    console.error('[API] reports/send error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = parseInt(process.env.PORT || '4000', 10);
app.listen(PORT, async () => {
  console.log(`Backend server listening on port ${PORT}`);
  try {
    await runDuePings();
  } catch (err) {
    console.error('[Scheduler] initial run-due failure:', err);
  }
  setInterval(() => {
    runDuePings().catch((err) => console.error('[Scheduler] run-due failed:', err));
  }, RUN_DUE_INTERVAL_SECONDS * 1000);
});

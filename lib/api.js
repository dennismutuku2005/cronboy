// CronBoy API Client
// All API calls go through this module — directly to the configured API base.
const BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) {
      console.warn(`[API] ${url} returned ${res.status}:`, data?.error);
      return { ok: false, error: data?.error || `HTTP ${res.status}` };
    }
    return data;
  } catch (err) {
    console.error(`[API] Network error for ${url}:`, err.message);
    return { ok: false, error: err.message };
  }
}

// --- Auth ---

export async function login(username, password) {
  return await fetchJSON(`${BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

// --- Subdomains ---
export async function fetchSubdomains(filters = {}) {
  const params = new URLSearchParams();
  if (filters.env && filters.env !== 'All') params.set('env', filters.env);
  if (filters.status && filters.status !== 'All') params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);
  const qs = params.toString();
  const res = await fetchJSON(`${BASE}/subdomains/list${qs ? '?' + qs : ''}`);
  return res?.data || [];
}

export async function fetchSubdomainStats() {
  const res = await fetchJSON(`${BASE}/subdomains/stats`);
  return res?.stats || null;
}

export async function createSubdomain(data) {
  return await fetchJSON(`${BASE}/subdomains/create`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSubdomain(id, data) {
  return await fetchJSON(`${BASE}/subdomains/update`, {
    method: 'PATCH',
    body: JSON.stringify({ id, ...data }),
  });
}

export async function deleteSubdomains(ids) {
  return await fetchJSON(`${BASE}/subdomains/delete`, {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

export async function togglePauseSubdomain(id) {
  return await fetchJSON(`${BASE}/subdomains/toggle-pause`, {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

export async function triggerCheck(id) {
  return await fetchJSON(`${BASE}/subdomains/trigger-check`, {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

// --- Incidents ---

export async function fetchIncidents() {
  const res = await fetchJSON(`${BASE}/incidents/list`);
  return res?.data || [];
}

// --- Rules ---

export async function fetchRules() {
  const res = await fetchJSON(`${BASE}/rules/list`);
  return res?.data || [];
}

export async function createRule(data) {
  return await fetchJSON(`${BASE}/rules/list`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function toggleRule(id, enabled) {
  return await fetchJSON(`${BASE}/rules/list`, {
    method: 'PATCH',
    body: JSON.stringify({ id, enabled }),
  });
}

// --- Cron Jobs ---

export async function fetchCronJobs() {
  const res = await fetchJSON(`${BASE}/cronjobs/list`);
  return res?.data || [];
}

export async function fetchLogs(filters = {}) {
  const params = new URLSearchParams();
  if (filters.env && filters.env !== 'All') params.set('env', filters.env);
  if (filters.search) params.set('search', filters.search);
  const qs = params.toString();
  return await fetchJSON(`${BASE}/logs/list${qs ? '?' + qs : ''}`);
}

// --- Database ---

export async function initDatabase() {
  return await fetchJSON(`${BASE}/db/init`, { method: 'POST' });
}

export async function checkDBHealth() {
  return await fetchJSON(`${BASE}/db/health`);
}

// --- Reports & WhatsApp ---

export async function sendReport(domains, reportType, recipientPhone) {
  return await fetchJSON(`${BASE}/reports/send`, {
    method: 'POST',
    body: JSON.stringify({ domains, reportType, recipientPhone }),
  });
}

export async function sendWhatsApp(phone, text) {
  return await fetchJSON(`${BASE}/whatsapp/primary`, {
    method: 'POST',
    body: JSON.stringify({ phone, text }),
  });
}

// --- Users ---

export async function fetchUsers() {
  const res = await fetchJSON(`${BASE}/users/list`);
  return res?.data || [];
}

export async function registerUser(data) {
  return await fetchJSON(`${BASE}/users/register`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}


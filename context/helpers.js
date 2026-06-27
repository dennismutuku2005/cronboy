"use client";

function parseHistory(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return [0,0,0,0,0,0,0]; }
  }
  return [0,0,0,0,0,0,0];
}

export function translateCron(expression) {
  if (!expression) return "No linked cron job";
  const trimmed = expression.trim().replace(/\s+/g, " ");
  if (trimmed === "0 0 * * *") return "Runs daily at 00:00 UTC";
  if (trimmed === "0 8 * * *") return "Runs daily at 08:00 UTC";
  if (trimmed === "* * * * *") return "Runs every minute";
  if (trimmed === "*/5 * * * *") return "Runs every 5 minutes";
  if (trimmed === "*/15 * * * *") return "Runs every 15 minutes";
  if (trimmed === "*/30 * * * *") return "Runs every 30 minutes";
  if (trimmed === "0 * * * *") return "Runs every hour";
  if (trimmed === "0 */2 * * *") return "Runs every 2 hours";
  if (trimmed === "0 0 * * 0") return "Runs weekly on Sunday";
  if (trimmed === "0 0 1 * *") return "Runs monthly on the 1st";
  const parts = trimmed.split(" ");
  if (parts.length === 5) {
    const [min, hour, dom, month, dow] = parts;
    if (min.startsWith("*/") && hour === "*" && dom === "*" && month === "*" && dow === "*") return `Runs every ${min.slice(2)} minutes`;
    if (min === "0" && hour.startsWith("*/") && dom === "*" && month === "*" && dow === "*") return `Runs every ${hour.slice(2)} hours`;
  }
  return `Runs on schedule: ${expression}`;
}

export const AVAILABLE_POLICIES = [
  "Manage users", "Manage monitors", "View dashboards", "Create jobs", "Edit alerts"
];

export function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Never';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function mapSubdomain(db) {
  if (!db) return null;
  return {
    id: db.id,
    subdomain: db.subdomain,
    env: db.env,
    status: db.status,
    lastChecked: db.last_checked ? formatTimeAgo(db.last_checked) : 'Never',
    responseTime: db.response_time || 0,
    uptime: parseFloat(db.uptime || 100),
    sslIssuer: db.ssl_issuer || 'Unknown',
    sslExpiryDays: db.ssl_expiry_days ?? 90,
    linkedCron: db.linked_cron || '',
    cronSchedule: db.cron_schedule || '',
    checkInterval: db.check_interval || '5m',
    sslAutoRenew: db.ssl_auto_renew ?? true,
    history: parseHistory(db.history),
    logs: Array.isArray(db.logs) ? db.logs.map(log => ({
      timestamp: log.timestamp ? new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19) : 'Just now',
      status: log.status,
      duration: log.duration,
      message: log.message
    })) : [],
  };
}

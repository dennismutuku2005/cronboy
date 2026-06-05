"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

// --- INITIAL MOCK DATA ---
const INITIAL_SUBDOMAINS = [
  { id: "sub-1", subdomain: "api.cronboy.io", env: "Production", status: "healthy", lastChecked: "Just now", responseTime: 142, uptime: 99.98, sslIssuer: "Let's Encrypt Authority X3", sslExpiryDays: 28, linkedCron: "DB Backup Run", cronSchedule: "0 0 * * *", checkInterval: "10s", sslAutoRenew: true, logs: [{ timestamp: "2026-06-03 20:05:01", status: "healthy", duration: "142ms", message: "api.cronboy.io responded 200 OK" }], history: [142, 138, 145, 140, 139, 141, 143] },
  { id: "sub-2", subdomain: "auth.cronboy.io", env: "Production", status: "healthy", lastChecked: "2 mins ago", responseTime: 85, uptime: 99.95, sslIssuer: "DigiCert TLS RSA SHA256", sslExpiryDays: 14, linkedCron: "Session Cleaner", cronSchedule: "*/15 * * * *", checkInterval: "5m", sslAutoRenew: true, logs: [{ timestamp: "2026-06-03 20:00:00", status: "healthy", duration: "85ms", message: "auth.cronboy.io responded 200 OK" }], history: [85, 82, 88, 84, 80, 83, 86] },
  { id: "sub-3", subdomain: "dashboard.cronboy.io", env: "Production", status: "healthy", lastChecked: "5 mins ago", responseTime: 182, uptime: 99.90, sslIssuer: "Sectigo Demo CA", sslExpiryDays: 45, linkedCron: "Uptime Sync", cronSchedule: "*/5 * * * *", checkInterval: "1m", sslAutoRenew: true, logs: [{ timestamp: "2026-06-03 20:01:00", status: "healthy", duration: "182ms", message: "dashboard.cronboy.io responded 200 OK" }], history: [182, 179, 190, 185, 177, 180, 188] },
  { id: "sub-4", subdomain: "worker-1.cronboy.io", env: "Production", status: "degraded", lastChecked: "1 min ago", responseTime: 480, uptime: 98.42, sslIssuer: "Let's Encrypt Authority X3", sslExpiryDays: 3, linkedCron: "Queue Poller", cronSchedule: "* * * * *", checkInterval: "30s", sslAutoRenew: false, logs: [{ timestamp: "2026-06-03 20:05:30", status: "degraded", duration: "480ms", message: "worker-1.cronboy.io responded 200 OK (Slow Response)" }], history: [480, 510, 460, 490, 520, 440, 410] },
  { id: "sub-5", subdomain: "billing.cronboy.io", env: "Production", status: "down", lastChecked: "Just now", responseTime: 0, uptime: 94.20, sslIssuer: "Expired Let's Encrypt CA", sslExpiryDays: -2, linkedCron: "Subscription Re-bill", cronSchedule: "0 8 * * *", checkInterval: "15m", sslAutoRenew: true, logs: [{ timestamp: "2026-06-03 20:06:00", status: "down", duration: "—", message: "Timeout after 10s — no response" }], history: [0, 0, 190, 192, 185, 188, 190] },
  { id: "sub-6", subdomain: "staging-api.cronboy.io", env: "Staging", status: "healthy", lastChecked: "3 mins ago", responseTime: 110, uptime: 99.85, sslIssuer: "Let's Encrypt Staging CA", sslExpiryDays: 50, linkedCron: "Staging DB Sync", cronSchedule: "0 */2 * * *", checkInterval: "5m", sslAutoRenew: true, logs: [{ timestamp: "2026-06-03 20:03:00", status: "healthy", duration: "110ms", message: "staging-api.cronboy.io responded 200 OK" }], history: [110, 115, 108, 112, 105, 110, 114] },
  { id: "sub-7", subdomain: "staging-client.cronboy.io", env: "Staging", status: "paused", lastChecked: "1 hour ago", responseTime: 0, uptime: 100.0, sslIssuer: "Let's Encrypt Staging CA", sslExpiryDays: 80, linkedCron: "Assets Prefetch", cronSchedule: "0 0 * * 0", checkInterval: "1h", sslAutoRenew: false, logs: [{ timestamp: "2026-06-03 19:00:00", status: "paused", duration: "—", message: "Monitoring Paused by User" }], history: [0, 0, 0, 0, 0, 0, 0] },
  { id: "sub-8", subdomain: "dev-api.cronboy.io", env: "Dev", status: "degraded", lastChecked: "4 mins ago", responseTime: 310, uptime: 97.50, sslIssuer: "Self-Signed localhost", sslExpiryDays: 120, linkedCron: "Dev Logs Clear", cronSchedule: "0 0 * * *", checkInterval: "15m", sslAutoRenew: false, logs: [{ timestamp: "2026-06-03 20:02:00", status: "degraded", duration: "310ms", message: "dev-api.cronboy.io responded 200 OK (Latency Warning)" }], history: [310, 290, 320, 280, 240, 260, 305] },
  { id: "sub-9", subdomain: "dev-sandbox.cronboy.io", env: "Dev", status: "down", lastChecked: "Just now", responseTime: 0, uptime: 88.10, sslIssuer: "Self-Signed localhost", sslExpiryDays: 90, linkedCron: "Sandbox Reset", cronSchedule: "*/30 * * * *", checkInterval: "10m", sslAutoRenew: true, logs: [{ timestamp: "2026-06-03 20:06:10", status: "down", duration: "—", message: "Connection refused on port 443" }], history: [0, 0, 110, 115, 120, 0, 105] },
  { id: "sub-10", subdomain: "postgres.cronboy.io", env: "Production", status: "healthy", lastChecked: "Just now", responseTime: 45, uptime: 99.99, sslIssuer: "DigiCert TLS RSA SHA256", sslExpiryDays: 60, linkedCron: "Postgres Vacuum", cronSchedule: "0 2 * * *", checkInterval: "5m", sslAutoRenew: true, logs: [{ timestamp: "2026-06-03 20:05:00", status: "healthy", duration: "45ms", message: "postgres.cronboy.io responded 200 OK" }], history: [45, 42, 48, 44, 40, 43, 46] },
  { id: "sub-11", subdomain: "redis.cronboy.io", env: "Production", status: "healthy", lastChecked: "4 mins ago", responseTime: 30, uptime: 99.99, sslIssuer: "DigiCert TLS RSA SHA256", sslExpiryDays: 60, linkedCron: "Cache Eviction Trigger", cronSchedule: "*/10 * * * *", checkInterval: "1m", sslAutoRenew: true, logs: [{ timestamp: "2026-06-03 20:01:00", status: "healthy", duration: "30ms", message: "redis.cronboy.io responded 200 OK" }], history: [30, 28, 35, 32, 29, 31, 33] },
  { id: "sub-12", subdomain: "graphql.cronboy.io", env: "Production", status: "healthy", lastChecked: "3 mins ago", responseTime: 195, uptime: 99.78, sslIssuer: "Sectigo Demo CA", sslExpiryDays: 12, linkedCron: "Schema Sync Checker", cronSchedule: "0 */12 * * *", checkInterval: "5m", sslAutoRenew: true, logs: [{ timestamp: "2026-06-03 20:02:00", status: "healthy", duration: "195ms", message: "graphql.cronboy.io responded 200 OK" }], history: [195, 180, 210, 199, 188, 192, 201] },
  { id: "sub-13", subdomain: "mailer.cronboy.io", env: "Production", status: "degraded", lastChecked: "2 mins ago", responseTime: 420, uptime: 98.90, sslIssuer: "Let's Encrypt Authority X3", sslExpiryDays: 5, linkedCron: "Queue Bounce Cleaner", cronSchedule: "0 0 * * *", checkInterval: "5m", sslAutoRenew: false, logs: [{ timestamp: "2026-06-03 20:03:00", status: "degraded", duration: "420ms", message: "mailer.cronboy.io high latency detected" }], history: [420, 390, 440, 410, 380, 430, 450] },
  { id: "sub-14", subdomain: "cdn.cronboy.io", env: "Production", status: "healthy", lastChecked: "Just now", responseTime: 55, uptime: 99.99, sslIssuer: "GlobalSign CA", sslExpiryDays: 150, linkedCron: "Cache Purge Cron", cronSchedule: "0 4 * * *", checkInterval: "15m", sslAutoRenew: true, logs: [{ timestamp: "2026-06-03 20:05:00", status: "healthy", duration: "55ms", message: "cdn.cronboy.io responded 200 OK" }], history: [55, 52, 58, 54, 50, 53, 56] },
  { id: "sub-15", subdomain: "search-api.cronboy.io", env: "Production", status: "healthy", lastChecked: "5 mins ago", responseTime: 230, uptime: 99.80, sslIssuer: "Let's Encrypt Authority X3", sslExpiryDays: 40, linkedCron: "Index Rebuilder", cronSchedule: "0 1 * * *", checkInterval: "10m", sslAutoRenew: true, logs: [{ timestamp: "2026-06-03 20:00:00", status: "healthy", duration: "230ms", message: "search-api.cronboy.io responded 200 OK" }], history: [230, 210, 250, 240, 220, 235, 242] },
  { id: "sub-16", subdomain: "staging-auth.cronboy.io", env: "Staging", status: "healthy", lastChecked: "4 mins ago", responseTime: 120, uptime: 99.90, sslIssuer: "Let's Encrypt Staging CA", sslExpiryDays: 50, linkedCron: "Staging Session Reset", cronSchedule: "0 0 * * *", checkInterval: "5m", sslAutoRenew: true, logs: [{ timestamp: "2026-06-03 20:01:00", status: "healthy", duration: "120ms", message: "staging-auth.cronboy.io responded 200 OK" }], history: [120, 115, 125, 118, 110, 122, 128] },
  { id: "sub-17", subdomain: "staging-worker.cronboy.io", env: "Staging", status: "healthy", lastChecked: "Just now", responseTime: 160, uptime: 99.40, sslIssuer: "Let's Encrypt Staging CA", sslExpiryDays: 50, linkedCron: "Staging Queue Reset", cronSchedule: "*/30 * * * *", checkInterval: "2m", sslAutoRenew: true, logs: [{ timestamp: "2026-06-03 20:05:00", status: "healthy", duration: "160ms", message: "staging-worker.cronboy.io responded 200 OK" }], history: [160, 155, 170, 165, 150, 162, 168] },
  { id: "sub-18", subdomain: "dev-db.cronboy.io", env: "Dev", status: "healthy", lastChecked: "Just now", responseTime: 65, uptime: 99.99, sslIssuer: "Self-Signed localhost", sslExpiryDays: 90, linkedCron: "Dev DB Vacuum", cronSchedule: "0 0 * * *", checkInterval: "15m", sslAutoRenew: false, logs: [{ timestamp: "2026-06-03 20:05:00", status: "healthy", duration: "65ms", message: "dev-db.cronboy.io responded 200 OK" }], history: [65, 62, 68, 64, 60, 63, 66] },
  { id: "sub-19", subdomain: "dev-cache.cronboy.io", env: "Dev", status: "paused", lastChecked: "3 hours ago", responseTime: 0, uptime: 100.0, sslIssuer: "Self-Signed localhost", sslExpiryDays: 90, linkedCron: "Cache Flusher", cronSchedule: "*/5 * * * *", checkInterval: "5m", sslAutoRenew: false, logs: [{ timestamp: "2026-06-03 17:00:00", status: "paused", duration: "—", message: "Monitoring Paused by User" }], history: [0, 0, 0, 0, 0, 0, 0] },
  { id: "sub-20", subdomain: "analytics.cronboy.io", env: "Production", status: "healthy", lastChecked: "Just now", responseTime: 290, uptime: 99.70, sslIssuer: "GlobalSign CA", sslExpiryDays: 120, linkedCron: "Report Aggregator", cronSchedule: "0 5 * * *", checkInterval: "15m", sslAutoRenew: true, logs: [{ timestamp: "2026-06-03 20:05:00", status: "healthy", duration: "290ms", message: "analytics.cronboy.io responded 200 OK" }], history: [290, 270, 310, 295, 280, 285, 300] },
  { id: "sub-21", subdomain: "admin.cronboy.io", env: "Production", status: "healthy", lastChecked: "1 min ago", responseTime: 110, uptime: 99.95, sslIssuer: "DigiCert TLS RSA SHA256", sslExpiryDays: 80, linkedCron: "Audit Logs Archiver", cronSchedule: "0 0 1 * *", checkInterval: "5m", sslAutoRenew: true, logs: [{ timestamp: "2026-06-03 20:04:00", status: "healthy", duration: "110ms", message: "admin.cronboy.io responded 200 OK" }], history: [110, 105, 115, 108, 107, 112, 114] },
  { id: "sub-22", subdomain: "webhooks.cronboy.io", env: "Production", status: "healthy", lastChecked: "Just now", responseTime: 130, uptime: 99.85, sslIssuer: "Let's Encrypt Authority X3", sslExpiryDays: 45, linkedCron: "Webhook Retries Handler", cronSchedule: "*/5 * * * *", checkInterval: "1m", sslAutoRenew: true, logs: [{ timestamp: "2026-06-03 20:05:00", status: "healthy", duration: "130ms", message: "webhooks.cronboy.io responded 200 OK" }], history: [130, 125, 135, 128, 122, 131, 133] },
  { id: "sub-23", subdomain: "staging-cdn.cronboy.io", env: "Staging", status: "healthy", lastChecked: "5 mins ago", responseTime: 95, uptime: 99.95, sslIssuer: "Let's Encrypt Staging CA", sslExpiryDays: 50, linkedCron: "Staging Cache Purge", cronSchedule: "0 0 * * *", checkInterval: "10m", sslAutoRenew: true, logs: [{ timestamp: "2026-06-03 20:00:00", status: "healthy", duration: "95ms", message: "staging-cdn.cronboy.io responded 200 OK" }], history: [95, 90, 100, 93, 88, 92, 98] },
  { id: "sub-24", subdomain: "dev-search.cronboy.io", env: "Dev", status: "healthy", lastChecked: "Just now", responseTime: 180, uptime: 99.50, sslIssuer: "Self-Signed localhost", sslExpiryDays: 90, linkedCron: "Dev Index Rebuild", cronSchedule: "0 0 * * *", checkInterval: "10m", sslAutoRenew: false, logs: [{ timestamp: "2026-06-03 20:05:00", status: "healthy", duration: "180ms", message: "dev-search.cronboy.io responded 200 OK" }], history: [180, 170, 190, 185, 175, 178, 182] }
];

const INITIAL_RULES = [
  { id: "rule-1", name: "Uptime Degraded Alert", condition: "Uptime drops below 99.0%", channels: ["Email", "Webhook"], enabled: true },
  { id: "rule-2", name: "SSL Certificate Expiry Warning", condition: "SSL Expiry is less than 7 days", channels: ["Email", "SMS"], enabled: true },
  { id: "rule-3", name: "Down Service Notification", condition: "Subdomain health status changes to DOWN", channels: ["Email", "Webhook", "SMS"], enabled: true },
  { id: "rule-4", name: "Latency Spike Monitor", condition: "Response time exceeds 400ms for 3 checks", channels: ["Webhook"], enabled: false }
];

const INITIAL_CHANNELS = [
  { id: "chan-1", name: "Email Alert Routing", type: "Email", config: "alerts@cronboy.io, devops-team@cronboy.io", active: true },
  { id: "chan-2", name: "Slack Systems Webhook", type: "Webhook", config: "https://hooks.slack.com/services/T00/B00/X00", active: true },
  { id: "chan-3", name: "Twilio On-Call SMS", type: "SMS", config: "+1 (555) 902-1234, +1 (555) 338-9871", active: false }
];

const INITIAL_INCIDENTS = [
  { id: "inc-1", subdomain: "billing.cronboy.io", type: "DOWN", time: "2026-06-03 19:51:00", details: "SSL Certificate has Expired. DNS check passed but TLS handshake failed." },
  { id: "inc-2", subdomain: "worker-1.cronboy.io", type: "LATENCY", time: "2026-06-03 18:40:12", details: "Response time peaked at 520ms. Check interval flagged degraded." },
  { id: "inc-3", subdomain: "dev-sandbox.cronboy.io", type: "DOWN", time: "2026-06-03 16:30:10", details: "Connection refused on port 443. localhost target offline." },
  { id: "inc-4", subdomain: "mailer.cronboy.io", type: "LATENCY", time: "2026-06-03 15:20:00", details: "SMTP queue latency exceeded 400ms threshold for 3 consecutive checks." },
  { id: "inc-5", subdomain: "billing.cronboy.io", type: "DOWN", time: "2026-06-02 11:15:22", details: "Billing webhook returned 502 Bad Gateway from payment gateway responder." },
  { id: "inc-6", subdomain: "staging-client.cronboy.io", type: "DOWN", time: "2026-06-01 09:12:00", details: "Staging deployment pipeline locked. Client page unresolvable." },
  { id: "inc-7", subdomain: "worker-1.cronboy.io", type: "LATENCY", time: "2026-05-30 22:45:00", details: "Queue Poller latency peaked at 610ms during weekly migration run." },
  { id: "inc-8", subdomain: "api.cronboy.io", type: "DOWN", time: "2026-05-28 04:30:00", details: "API Gateway gateway-timeout. DNS check healthy but HTTP resolves 504." }
];

const INITIAL_USERS = [
  {
    id: "user-1",
    name: "Super Admin",
    email: "admin",
    password: "admin123",
    role: "Superadmin",
    policies: ["Manage users", "Manage monitors", "View dashboards", "Create jobs", "Edit alerts"]
  }
];

const AVAILABLE_POLICIES = [
  "Manage users",
  "Manage monitors",
  "View dashboards",
  "Create jobs",
  "Edit alerts"
];

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

// --- CONTEXT DEFINITION ---
const CronBoyContext = createContext(null);

export function CronBoyProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [subdomains, setSubdomains] = useState(INITIAL_SUBDOMAINS);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [activeEnv, setActiveEnv] = useState("Production");
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [themeMsg, setThemeMsg] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState("add");
  const [panelData, setPanelData] = useState({ id: "", subdomain: "", env: "Production", checkInterval: "5m", customIntervalVal: "10", customIntervalUnit: "s", sslAutoRenew: true, linkedCron: "", cronSchedule: "*/15 * * * *" });
  const [settingsData, setSettingsData] = useState({ siteName: "Cron Boy Operations", alertEmail: "alerts@cronboy.io", slackWebhook: "https://hooks.slack.com/services/T00/B00/X00", twilioSid: "AC1928374829384729384", autoRefresh: true });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, subdomain: "", isBatch: false });
  const [unlinkConfirm, setUnlinkConfirm] = useState({ isOpen: false, id: null, subdomain: "", cron: "" });
  const [addRuleModal, setAddRuleModal] = useState({ isOpen: false, name: "", condition: "", channels: [] });
  const [addChannelModal, setAddChannelModal] = useState({ isOpen: false, name: "", type: "Email", config: "" });
  const [linkChannelModal, setLinkChannelModal] = useState({ isOpen: false, ruleId: null, ruleName: "", selectedChan: "" });
  const [detailModal, setDetailModal] = useState({ isOpen: false, sub: null });
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(null);

  // --- AUTH GATE ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsers = localStorage.getItem("cb_users");
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        localStorage.setItem("cb_users", JSON.stringify(INITIAL_USERS));
      }

      const storedCurrent = localStorage.getItem("cb_current_user");
      let current = null;
      if (storedCurrent) {
        try {
          current = JSON.parse(storedCurrent);
          setCurrentUser(current);
        } catch {
          localStorage.removeItem("cb_current_user");
        }
      }

      const logged = localStorage.getItem("cb_logged_in");
      if (logged === "true" && !current) {
        const storedUsers = localStorage.getItem("cb_users");
        if (storedUsers) {
          try {
            const parsedUsers = JSON.parse(storedUsers);
            const maybeCurrent = parsedUsers.find((user) => user.role === "Superadmin") || parsedUsers[0];
            if (maybeCurrent) {
              current = maybeCurrent;
              setCurrentUserState(maybeCurrent);
            }
          } catch {
            // ignore malformed users data
          }
        }
      }

      if (logged !== "true") {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        } else {
          setIsLoading(false);
        }
      } else {
        if (window.location.pathname === "/login") {
          window.location.href = "/dashboard";
        } else {
          setIsAuthenticated(true);
          const timer = setTimeout(() => setIsLoading(false), 1200);
          return () => clearTimeout(timer);
        }
      }
    }
  }, []);

  // --- LOCALSTORAGE PERSISTENCE ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("cb_subdomains");
      const r = localStorage.getItem("cb_rules");
      const c = localStorage.getItem("cb_channels");
      const i = localStorage.getItem("cb_incidents");
      const st = localStorage.getItem("cb_settings");
      if (s) setSubdomains(JSON.parse(s));
      if (r) setRules(JSON.parse(r));
      if (c) setChannels(JSON.parse(c));
      if (i) setIncidents(JSON.parse(i));
      if (st) setSettingsData(JSON.parse(st));
    }
  }, []);

  const saveToStorage = (key, data) => {
    if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(data));
  };

  const updateSubdomainsState = (v) => { setSubdomains(v); saveToStorage("cb_subdomains", v); };
  const updateRulesState = (v) => { setRules(v); saveToStorage("cb_rules", v); };
  const updateChannelsState = (v) => { setChannels(v); saveToStorage("cb_channels", v); };
  const updateIncidentsState = (v) => { setIncidents(v); saveToStorage("cb_incidents", v); };
  const updateSettingsState = (v) => { setSettingsData(v); saveToStorage("cb_settings", v); };
  const updateUsersState = (v) => { setUsers(v); saveToStorage("cb_users", v); };
  const setCurrentUserState = (user) => {
    setCurrentUser(user);
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("cb_current_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("cb_current_user");
      }
    }
  };

  const loginUser = (username, password) => {
    const lowerName = username.trim().toLowerCase();
    const usersToCheck = users.length ? users : INITIAL_USERS;
    const foundUser = usersToCheck.find((user) => {
      return (user.email.toLowerCase() === lowerName || user.name.toLowerCase() === lowerName) && user.password === password;
    });

    if (!foundUser) {
      return { success: false, message: "Invalid username or password." };
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("cb_logged_in", "true");
    }
    setCurrentUserState(foundUser);
    setIsAuthenticated(true);
    return { success: true, user: foundUser };
  };

  const createUser = (newUser) => {
    const nextUsers = [...users, newUser];
    updateUsersState(nextUsers);
  };

  const deleteUser = (userId) => {
    const nextUsers = users.filter((user) => user.id !== userId);
    updateUsersState(nextUsers);
  };

  const updateUser = (updatedUser) => {
    const nextUsers = users.map((user) => user.id === updatedUser.id ? updatedUser : user);
    updateUsersState(nextUsers);
  };

  const isSuperAdmin = currentUser?.role === "Superadmin";

  // --- TOAST ---
  const triggerToast = (title, message, type = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // --- OUTAGE SIMULATOR ---
  useEffect(() => {
    if (!settingsData.autoRefresh || !isAuthenticated) return;
    const interval = setInterval(() => {
      setSubdomains(currentSubs => {
        const idx = Math.floor(Math.random() * currentSubs.length);
        const target = currentSubs[idx];
        if (target.status === "paused") return currentSubs;
        const newSubs = [...currentSubs];
        const updated = { ...target, lastChecked: "Just now" };
        if (updated.status === "healthy") {
          const roll = Math.random();
          if (roll < 0.08) {
            updated.status = "degraded";
            updated.responseTime = Math.floor(Math.random() * 200) + 380;
            updated.logs = [{ timestamp: new Date().toISOString().replace("T", " ").substring(0, 19), status: "degraded", duration: `${updated.responseTime}ms`, message: `${updated.subdomain} latency spiked` }, ...updated.logs.slice(0, 9)];
          } else if (roll < 0.12) {
            updated.status = "down";
            updated.responseTime = 0;
            updated.logs = [{ timestamp: new Date().toISOString().replace("T", " ").substring(0, 19), status: "down", duration: "—", message: "TCP handshake timeout after 10s." }, ...updated.logs.slice(0, 9)];
          } else {
            updated.responseTime = Math.floor(Math.random() * 30) + 60;
            updated.logs = [{ timestamp: new Date().toISOString().replace("T", " ").substring(0, 19), status: "healthy", duration: `${updated.responseTime}ms`, message: `${updated.subdomain} responded 200 OK` }, ...updated.logs.slice(0, 9)];
          }
        } else if (updated.status === "degraded" || updated.status === "down") {
          if (Math.random() < 0.45) {
            updated.status = "healthy";
            updated.responseTime = Math.floor(Math.random() * 40) + 90;
            updated.logs = [{ timestamp: new Date().toISOString().replace("T", " ").substring(0, 19), status: "healthy", duration: `${updated.responseTime}ms`, message: `${updated.subdomain} health recovered.` }, ...updated.logs.slice(0, 9)];
          }
        }
        updated.history = [...updated.history.slice(1), updated.responseTime];
        newSubs[idx] = updated;
        return newSubs;
      });
    }, 12000);
    return () => clearInterval(interval);
  }, [settingsData.autoRefresh, isAuthenticated]);

  // --- COMPUTED ---
  const envFiltered = useMemo(() => activeEnv === "All" ? subdomains : subdomains.filter(s => s.env === activeEnv), [subdomains, activeEnv]);

  const tabFiltered = useMemo(() => {
    switch (activeTab) {
      case "Healthy": return envFiltered.filter(s => s.status === "healthy");
      case "Degraded": return envFiltered.filter(s => s.status === "degraded");
      case "Down": return envFiltered.filter(s => s.status === "down");
      case "Expiring SSL": return envFiltered.filter(s => s.sslExpiryDays <= 7 && s.status !== "paused");
      case "Paused": return envFiltered.filter(s => s.status === "paused");
      default: return envFiltered;
    }
  }, [envFiltered, activeTab]);

  const finalFilteredSubdomains = useMemo(() => {
    if (!searchQuery.trim()) return tabFiltered;
    const q = searchQuery.toLowerCase();
    return tabFiltered.filter(s => s.subdomain.toLowerCase().includes(q) || (s.linkedCron && s.linkedCron.toLowerCase().includes(q)));
  }, [tabFiltered, searchQuery]);

  const stats = useMemo(() => ({
    total: envFiltered.length,
    healthy: envFiltered.filter(s => s.status === "healthy").length,
    degraded: envFiltered.filter(s => s.status === "degraded").length,
    activeCrons: envFiltered.filter(s => s.linkedCron && s.status !== "paused").length,
    failures24h: envFiltered.filter(s => s.status === "down").length
  }), [envFiltered]);

  const donutPercentages = useMemo(() => {
    const total = envFiltered.length || 1;
    const healthy = envFiltered.filter(s => s.status === "healthy").length;
    const degraded = envFiltered.filter(s => s.status === "degraded").length;
    const down = envFiltered.filter(s => s.status === "down").length;
    const paused = envFiltered.filter(s => s.status === "paused").length;
    return {
      healthyPct: Math.round((healthy / total) * 100),
      degradedPct: Math.round((degraded / total) * 100),
      downPct: Math.round((down / total) * 100),
      pausedPct: Math.round((paused / total) * 100),
      overallUptime: Math.round(((healthy + degraded * 0.5 + paused * 1.0) / total) * 1000) / 10
    };
  }, [envFiltered]);

  const cronActivityStats = useMemo(() => {
    const active = envFiltered.filter(s => s.linkedCron);
    return {
      totalRuns: active.length * 48,
      successRate: active.length > 0 ? Math.round((active.filter(s => s.status !== "down").length / active.length) * 1000) / 10 : 100,
      avgDuration: active.length > 0 ? Math.round(active.reduce((a, c) => a + (c.responseTime || 0), 0) / active.length) : 0
    };
  }, [envFiltered]);

  // --- HANDLERS ---
  const handleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    const ids = finalFilteredSubdomains.map(s => s.id);
    const allSelected = ids.every(id => selectedRows.includes(id));
    setSelectedRows(allSelected ? selectedRows.filter(id => !ids.includes(id)) : Array.from(new Set([...selectedRows, ...ids])));
  };

  const handleTriggerCheck = (id, e) => {
    e?.stopPropagation();
    const updated = subdomains.map(sub => {
      if (sub.id !== id) return sub;
      if (sub.status === "paused") return sub;
      const ping = sub.status === "down" ? 0 : Math.floor(Math.random() * 25) + 75;
      const status = sub.status === "down" ? "down" : ping > 400 ? "degraded" : "healthy";
      return { ...sub, lastChecked: "Just now", responseTime: ping, history: [...sub.history.slice(1), ping], logs: [{ timestamp: new Date().toISOString().replace("T", " ").substring(0, 19), status, duration: ping > 0 ? `${ping}ms` : "—", message: `Manual trigger: Ping response ${ping > 0 ? 200 : 503}` }, ...sub.logs] };
    });
    updateSubdomainsState(updated);
    triggerToast("Healthcheck Executed", "Ping check completed.", "info");
  };

  const handleTogglePause = (id, e) => {
    e?.stopPropagation();
    const sub = subdomains.find(s => s.id === id);
    const wasPaused = sub?.status === "paused";
    const updated = subdomains.map(s => {
      if (s.id !== id) return s;
      return { ...s, status: wasPaused ? "healthy" : "paused", responseTime: wasPaused ? 115 : 0, logs: [{ timestamp: new Date().toISOString().replace("T", " ").substring(0, 19), status: wasPaused ? "healthy" : "paused", duration: "—", message: wasPaused ? "Monitoring Resumed." : "Monitoring Paused." }, ...s.logs] };
    });
    updateSubdomainsState(updated);
    triggerToast(wasPaused ? "Monitor Resumed" : "Monitor Paused", `${sub?.subdomain} checks ${wasPaused ? "activated" : "deactivated"}.`, "info");
  };

  const confirmDeleteAction = () => {
    const { id, isBatch } = deleteConfirm;
    if (isBatch) {
      updateSubdomainsState(subdomains.filter(s => !selectedRows.includes(s.id)));
      setSelectedRows([]);
      triggerToast("Batch Removed", "Selected monitors deleted.", "success");
    } else {
      updateSubdomainsState(subdomains.filter(s => s.id !== id));
      setSelectedRows(prev => prev.filter(r => r !== id));
      triggerToast("Monitor Removed", "Subdomain monitor deleted.", "success");
    }
    setDeleteConfirm({ isOpen: false, id: null, subdomain: "", isBatch: false });
  };

  const confirmUnlinkAction = () => {
    const updated = subdomains.map(s => s.id !== unlinkConfirm.id ? s : { ...s, linkedCron: "", cronSchedule: "", logs: [{ timestamp: new Date().toISOString().replace("T", " ").substring(0, 19), status: s.status, duration: "—", message: "Cron link removed." }, ...s.logs] });
    updateSubdomainsState(updated);
    triggerToast("Cron Unlinked", "Schedule removed.", "success");
    setUnlinkConfirm({ isOpen: false, id: null, subdomain: "", cron: "" });
  };

  const addRuleAction = (e) => {
    e.preventDefault();
    const newRule = { id: `rule-${Date.now()}`, name: addRuleModal.name, condition: addRuleModal.condition, channels: addRuleModal.channels.length > 0 ? addRuleModal.channels : ["Email"], enabled: true };
    updateRulesState([...rules, newRule]);
    triggerToast("Rule Added", `"${addRuleModal.name}" is now active.`, "success");
    setAddRuleModal({ isOpen: false, name: "", condition: "", channels: [] });
  };

  const addChannelAction = (e) => {
    e.preventDefault();
    const newChan = { id: `chan-${Date.now()}`, name: addChannelModal.name, type: addChannelModal.type, config: addChannelModal.config, active: true };
    updateChannelsState([...channels, newChan]);
    triggerToast("Channel Added", `"${addChannelModal.name}" saved.`, "success");
    setAddChannelModal({ isOpen: false, name: "", type: "Email", config: "" });
  };

  const linkChannelSubmit = (e) => {
    e.preventDefault();
    if (!linkChannelModal.selectedChan) return;
    const updated = rules.map(r => r.id !== linkChannelModal.ruleId ? r : { ...r, channels: [...new Set([...r.channels, linkChannelModal.selectedChan])] });
    updateRulesState(updated);
    triggerToast("Channel Linked", `Linked to ${linkChannelModal.ruleName}.`, "success");
    setLinkChannelModal({ isOpen: false, ruleId: null, ruleName: "", selectedChan: "" });
  };

  const handleOpenAddPanel = () => {
    setPanelMode("add");
    setPanelData({ id: "", subdomain: "", env: activeEnv === "All" ? "Production" : activeEnv, checkInterval: "5m", customIntervalVal: "10", customIntervalUnit: "s", sslAutoRenew: true, linkedCron: "", cronSchedule: "*/15 * * * *" });
    setIsPanelOpen(true);
  };

  const handleOpenEditPanel = (sub, e) => {
    e?.stopPropagation();
    const isCustom = !["10s","30s","1m","5m","10m","15m","30m","1h"].includes(sub.checkInterval || "5m");
    let checkInterval = sub.checkInterval || "5m";
    let customVal = "10", customUnit = "s";
    if (isCustom) {
      const m = checkInterval.match(/^(\d+)([smh])$/);
      if (m) { customVal = m[1]; customUnit = m[2]; }
      checkInterval = "custom";
    }
    setPanelMode("edit");
    setPanelData({ id: sub.id, subdomain: sub.subdomain, env: sub.env, checkInterval, customIntervalVal: customVal, customIntervalUnit: customUnit, sslAutoRenew: sub.sslAutoRenew, linkedCron: sub.linkedCron || "", cronSchedule: sub.cronSchedule || "*/15 * * * *" });
    setIsPanelOpen(true);
  };

  const handlePanelSubmit = (e) => {
    e.preventDefault();
    if (!panelData.subdomain.trim()) return;
    let finalInterval = panelData.checkInterval;
    if (panelData.checkInterval === "custom") {
      const val = parseInt(panelData.customIntervalVal, 10);
      if (isNaN(val) || val <= 0) { alert("Invalid interval!"); return; }
      if (panelData.customIntervalUnit === "s" && val < 10) { alert("Minimum 10 seconds!"); return; }
      finalInterval = `${val}${panelData.customIntervalUnit}`;
    }
    if (panelMode === "add") {
      const newSub = { id: `sub-${Date.now()}`, subdomain: panelData.subdomain, env: panelData.env, status: "healthy", lastChecked: "Never", responseTime: 115, uptime: 100.0, sslIssuer: "Let's Encrypt Authority X3", sslExpiryDays: 90, linkedCron: panelData.linkedCron || "", cronSchedule: panelData.linkedCron ? panelData.cronSchedule : "", checkInterval: finalInterval, sslAutoRenew: panelData.sslAutoRenew, logs: [{ timestamp: new Date().toISOString().replace("T", " ").substring(0, 19), status: "healthy", duration: "—", message: `${panelData.subdomain} registered.` }], history: [115, 120, 110, 130, 125, 118, 122] };
      updateSubdomainsState([...subdomains, newSub]);
      triggerToast("Domain Registered", `${panelData.subdomain} added to monitoring.`, "success");
    } else {
      const updated = subdomains.map(sub => sub.id !== panelData.id ? sub : { ...sub, subdomain: panelData.subdomain, env: panelData.env, checkInterval: finalInterval, sslAutoRenew: panelData.sslAutoRenew, linkedCron: panelData.linkedCron, cronSchedule: panelData.linkedCron ? panelData.cronSchedule : "", logs: [{ timestamp: new Date().toISOString().replace("T", " ").substring(0, 19), status: sub.status, duration: "—", message: "Settings updated." }, ...sub.logs] });
      updateSubdomainsState(updated);
      triggerToast("Monitor Updated", `Config saved for ${panelData.subdomain}.`, "success");
    }
    setIsPanelOpen(false);
  };

  const handleBatchDelete = () => {
    if (selectedRows.length === 0) return;
    setDeleteConfirm({ isOpen: true, id: null, subdomain: `${selectedRows.length} items`, isBatch: true });
  };

  const handleBatchPause = () => {
    if (selectedRows.length === 0) return;
    const targets = subdomains.filter(s => selectedRows.includes(s.id));
    const allPaused = targets.every(s => s.status === "paused");
    const updated = subdomains.map(s => selectedRows.includes(s.id) ? { ...s, status: allPaused ? "healthy" : "paused", responseTime: allPaused ? 110 : 0 } : s);
    updateSubdomainsState(updated);
    triggerToast(allPaused ? "Monitors Resumed" : "Monitors Paused", "Selected monitors state toggled.", "success");
  };

  // --- WHATSAPP REPORTING ---
  const buildReportText = (ids) => {
    const selected = subdomains.filter(s => ids.includes(s.id));
    const lines = [];
    const now = new Date();
    lines.push(`CronBoy Report - ${now.toISOString().replace('T', ' ').substring(0, 19)}`);
    lines.push(`Selected domains: ${selected.length}`);
    lines.push("");
    selected.forEach((s) => {
      lines.push(`${s.subdomain}`);
      lines.push(` Status: ${s.status}`);
      lines.push(` Last checked: ${s.lastChecked}`);
      lines.push(` Response time: ${s.responseTime && s.responseTime > 0 ? `${s.responseTime}ms` : '—'}`);
      lines.push(` Uptime: ${s.uptime}%`);
      lines.push(` SSL expiry days: ${s.sslExpiryDays}`);
      lines.push("");
    });
    lines.push("-- End of report --");
    return lines.join("\n");
  };

  const sendWhatsAppReport = async (phone, ids) => {
    if (!phone) {
      triggerToast("Missing phone", "Phone number is required.", "error");
      return;
    }
    const text = buildReportText(ids);
    try {
      const res = await fetch('/api/whatsapp/primary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, text })
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        triggerToast('Report sent', `WhatsApp report queued to ${phone}`, 'success');
      } else {
        triggerToast('Failed to send', json?.error || `Status ${res.status}`, 'error');
      }
    } catch (err) {
      triggerToast('Failed to send', err.message || 'Network error', 'error');
    }
  };

  const sendWhatsAppReportPrompt = (ids) => {
    if (typeof window === 'undefined') return;
    const phone = window.prompt('Enter recipient phone number (include country code, e.g. 2547...)');
    if (!phone) return;
    sendWhatsAppReport(phone.trim(), ids);
  };

  const handleToggleRule = (ruleId) => {
    const updated = rules.map(r => r.id !== ruleId ? r : { ...r, enabled: !r.enabled });
    updateRulesState(updated);
    const rule = rules.find(r => r.id === ruleId);
    triggerToast(!rule?.enabled ? "Rule Enabled" : "Rule Disabled", `"${rule?.name}" toggled.`, "info");
  };

  const handleToggleChannel = (chanId) => {
    const updated = channels.map(c => c.id !== chanId ? c : { ...c, active: !c.active });
    updateChannelsState(updated);
    const chan = channels.find(c => c.id === chanId);
    triggerToast(!chan?.active ? "Channel Active" : "Channel Paused", `"${chan?.name}" state updated.`, "info");
  };

  const handleSSLRefresh = (id) => {
    const updated = subdomains.map(s => s.id !== id ? s : { ...s, lastChecked: "Just now", sslExpiryDays: s.sslExpiryDays <= 0 ? -1 : Math.min(90, s.sslExpiryDays + 15) });
    updateSubdomainsState(updated);
    triggerToast("SSL Checked", "ACME renewal validation pinged.", "success");
  };

  const handleSSLRenew = (id) => {
    const updated = subdomains.map(s => s.id !== id ? s : { ...s, sslExpiryDays: 90, sslIssuer: "Let's Encrypt Authority X3", logs: [{ timestamp: new Date().toISOString().replace("T", " ").substring(0, 19), status: "healthy", duration: "—", message: "SSL Certificate re-issued for 90 days." }, ...s.logs] });
    updateSubdomainsState(updated);
    triggerToast("SSL Renewed", "Validity set to 90 days.", "success");
  };

  const handleThemeClick = () => { setThemeMsg("Locked: Light theme only."); setTimeout(() => setThemeMsg(""), 3000); };
  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cb_logged_in");
      localStorage.removeItem("cb_current_user");
      setCurrentUserState(null);
      window.location.href = "/login";
    }
  };
  const handleLogoError = (e) => { e.target.src = "/cron.png"; };

  const value = {
    isAuthenticated, isLoading, toasts, triggerToast,
    subdomains, rules, channels, incidents,
    activeEnv, setActiveEnv, activeTab, setActiveTab,
    searchQuery, setSearchQuery, selectedRows, setSelectedRows,
    themeMsg, isPanelOpen, setIsPanelOpen, panelMode, panelData, setPanelData,
    settingsData, updateSettingsState,
    deleteConfirm, setDeleteConfirm, unlinkConfirm, setUnlinkConfirm,
    addRuleModal, setAddRuleModal, addChannelModal, setAddChannelModal,
    linkChannelModal, setLinkChannelModal, detailModal, setDetailModal,
    envFiltered, tabFiltered, finalFilteredSubdomains, stats, donutPercentages, cronActivityStats,
    handleSelectRow, handleSelectAll, handleTriggerCheck, handleTogglePause,
    confirmDeleteAction, confirmUnlinkAction, addRuleAction, addChannelAction,
    linkChannelSubmit, handleOpenAddPanel, handleOpenEditPanel, handlePanelSubmit,
    handleBatchDelete, handleBatchPause, handleToggleRule, handleToggleChannel,
    handleSSLRefresh, handleSSLRenew, handleThemeClick, handleSignOut, handleLogoError,
    users, currentUser, loginUser, createUser, deleteUser, updateUser, isSuperAdmin,
    translateCron,
    sendWhatsAppReport, sendWhatsAppReportPrompt,
  };

  return <CronBoyContext.Provider value={value}>{children}</CronBoyContext.Provider>;
}

export function useCronBoy() {
  const ctx = useContext(CronBoyContext);
  if (!ctx) throw new Error("useCronBoy must be used within CronBoyProvider");
  return ctx;
}

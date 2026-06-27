"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import * as api from '@/lib/api';
import { mapSubdomain } from './helpers';
import { useToast } from './toast';
import { useAuth } from './auth';

const SubdomainContext = createContext(null);

export function SubdomainProvider({ children }) {
  const [subdomains, setSubdomains] = useState([]);
  const [activeEnv, setActiveEnv] = useState("All");
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState("add");
  const [panelData, setPanelData] = useState({
    id: "", subdomain: "", env: "Production", checkInterval: "5m",
    customIntervalVal: "10", customIntervalUnit: "s", sslAutoRenew: true,
    linkedCron: "", cronSchedule: "*/15 * * * *"
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, subdomain: "", isBatch: false });
  const [unlinkConfirm, setUnlinkConfirm] = useState({ isOpen: false, id: null, subdomain: "", cron: "" });
  const [detailModal, setDetailModal] = useState({ isOpen: false, sub: null });
  const [sendReportModal, setSendReportModal] = useState({ isOpen: false, phone: "", reportType: "detailed", domainCount: 0 });

  const { triggerToast } = useToast();
  const { isAuthenticated } = useAuth();

  // --- DATA ---
  const loadSubdomains = useCallback(async () => {
    const subs = await api.fetchSubdomains();
    if (subs) setSubdomains(subs.map(mapSubdomain).filter(Boolean));
  }, []);

  const refreshSubdomains = useCallback(async () => {
    await loadSubdomains();
  }, [loadSubdomains]);

  // --- COMPUTED ---
  const envFiltered = useMemo(() =>
    activeEnv === "All" ? subdomains : subdomains.filter(s => s.env === activeEnv),
  [subdomains, activeEnv]);

  const tabFiltered = useMemo(() => {
    switch (activeTab) {
      case "Healthy": return envFiltered.filter(s => s.status === "healthy");
      case "Degraded": return envFiltered.filter(s => s.status === "degraded");
      case "Down": return envFiltered.filter(s => s.status === "down");
      case "Paused": return envFiltered.filter(s => s.status === "paused");
      default: return envFiltered;
    }
  }, [envFiltered, activeTab]);

  const finalFilteredSubdomains = useMemo(() => {
    if (!searchQuery.trim()) return tabFiltered;
    const q = searchQuery.toLowerCase();
    return tabFiltered.filter(s => s.subdomain.toLowerCase().includes(q) || (s.linkedCron && s.linkedCron.toLowerCase().includes(q)));
  }, [tabFiltered, searchQuery]);

  const finalFilteredDomains = useMemo(() => {
    if (!searchQuery.trim()) return envFiltered;
    const q = searchQuery.toLowerCase();
    return envFiltered.filter(s => s.subdomain.toLowerCase().includes(q) || (s.linkedCron && s.linkedCron.toLowerCase().includes(q)));
  }, [envFiltered, searchQuery]);

  const stats = useMemo(() => ({
    total: envFiltered.length,
    healthy: envFiltered.filter(s => s.status === "healthy").length,
    degraded: envFiltered.filter(s => s.status === "degraded").length,
    down: envFiltered.filter(s => s.status === "down").length,
    paused: envFiltered.filter(s => s.status === "paused").length,
    activeCrons: envFiltered.filter(s => s.linkedCron && s.status !== "paused").length,
    failures24h: envFiltered.filter(s => s.status === "down").length,
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
      overallUptime: Math.round(((healthy + degraded * 0.5) / ((total - paused) || 1)) * 1000) / 10
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

  const handleSelectAll = (customList) => {
    const list = Array.isArray(customList) ? customList : finalFilteredSubdomains;
    const ids = list.map(s => s.id);
    const allSelected = ids.every(id => selectedRows.includes(id));
    setSelectedRows(allSelected ? selectedRows.filter(id => !ids.includes(id)) : Array.from(new Set([...selectedRows, ...ids])));
  };

  const handleTriggerCheck = async (id, e) => {
    e?.stopPropagation();
    const res = await api.triggerCheck(id);
    if (res?.ok) { await refreshSubdomains(); triggerToast("Healthcheck", "Ping completed.", "info"); }
  };

  const handleTogglePause = async (id, e) => {
    e?.stopPropagation();
    const sub = subdomains.find(s => s.id === id);
    const res = await api.togglePauseSubdomain(id);
    if (res?.ok) {
      await refreshSubdomains();
      triggerToast(res.wasPaused ? "Resumed" : "Paused", `${sub?.subdomain} ${res.wasPaused ? 'activated' : 'deactivated'}.`, "info");
    }
  };

  const confirmDeleteAction = async () => {
    const { id, isBatch } = deleteConfirm;
    const idsToDelete = isBatch ? selectedRows : [id];
    const res = await api.deleteSubdomains(idsToDelete);
    if (res?.ok) {
      if (isBatch) { setSubdomains(prev => prev.filter(s => !selectedRows.includes(s.id))); setSelectedRows([]); }
      else { setSubdomains(prev => prev.filter(s => s.id !== id)); setSelectedRows(prev => prev.filter(r => r !== id)); }
      triggerToast(isBatch ? "Batch Removed" : "Monitor Removed", "Deleted.", "success");
    }
    setDeleteConfirm({ isOpen: false, id: null, subdomain: "", isBatch: false });
  };

  const confirmUnlinkAction = () => {
    setSubdomains(prev => prev.map(s => s.id !== unlinkConfirm.id ? s : { ...s, linkedCron: "", cronSchedule: "" }));
    triggerToast("Cron Unlinked", "Schedule removed.", "success");
    setUnlinkConfirm({ isOpen: false, id: null, subdomain: "", cron: "" });
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

  const handlePanelSubmit = async (e) => {
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
      const res = await api.createSubdomain({ subdomain: panelData.subdomain, env: panelData.env, checkInterval: finalInterval, sslAutoRenew: panelData.sslAutoRenew });
      if (res?.ok) { await refreshSubdomains(); triggerToast("Added", `${panelData.subdomain} added.`, "success"); }
    } else {
      const res = await api.updateSubdomain(panelData.id, { subdomain: panelData.subdomain, env: panelData.env, check_interval: finalInterval, ssl_auto_renew: panelData.sslAutoRenew });
      if (res?.ok) { await refreshSubdomains(); triggerToast("Updated", `Config saved.`, "success"); }
    }
    setIsPanelOpen(false);
  };

  const handleBatchDelete = () => {
    if (selectedRows.length === 0) return;
    setDeleteConfirm({ isOpen: true, id: null, subdomain: `${selectedRows.length} items`, isBatch: true });
  };

  const handleBatchPause = async () => {
    if (selectedRows.length === 0) return;
    for (const sub of subdomains.filter(s => selectedRows.includes(s.id))) {
      await api.togglePauseSubdomain(sub.id);
    }
    await refreshSubdomains();
    triggerToast("Toggled", "Selected monitors state changed.", "success");
  };

  const handleSSLRefresh = (id) => setSubdomains(prev => prev.map(s => s.id !== id ? s : { ...s, lastChecked: "Just now", sslExpiryDays: Math.min(90, (s.sslExpiryDays || 0) + 15) }));
  const handleSSLRenew = (id) => setSubdomains(prev => prev.map(s => s.id !== id ? s : { ...s, sslExpiryDays: 90, sslIssuer: "Let's Encrypt Authority X3" }));

  const sendWhatsAppReport = async (phone, ids, reportType = 'detailed') => {
    if (!phone) { triggerToast("Missing phone", "Phone number required.", "error"); return; }
    const selected = subdomains.filter(s => ids.includes(s.id));
    const res = await api.sendReport(selected, reportType, phone);
    if (res?.ok) triggerToast('Sent', `Report sent to ${phone}`, 'success');
    else triggerToast('Failed', res?.error || 'Error', 'error');
  };
  const handleSendWhatsAppReport = (phone, reportType) => sendWhatsAppReport(phone, selectedRows, reportType);
  const sendWhatsAppReportPrompt = (ids) => setSendReportModal({ isOpen: true, phone: '', reportType: 'detailed', domainCount: ids.length });

  return (
    <SubdomainContext.Provider value={{
      subdomains, setSubdomains, loadSubdomains, refreshSubdomains,
      activeEnv, setActiveEnv, activeTab, setActiveTab,
      searchQuery, setSearchQuery, selectedRows, setSelectedRows,
      isPanelOpen, setIsPanelOpen, panelMode, setPanelMode, panelData, setPanelData,
      deleteConfirm, setDeleteConfirm, unlinkConfirm, setUnlinkConfirm,
      detailModal, setDetailModal, sendReportModal, setSendReportModal,
      envFiltered, tabFiltered, finalFilteredSubdomains, finalFilteredDomains, stats, donutPercentages, cronActivityStats,
      handleSelectRow, handleSelectAll, handleTriggerCheck, handleTogglePause,
      confirmDeleteAction, confirmUnlinkAction, handleOpenAddPanel, handleOpenEditPanel, handlePanelSubmit,
      handleBatchDelete, handleBatchPause, handleSSLRefresh, handleSSLRenew,
      sendWhatsAppReport, sendWhatsAppReportPrompt, handleSendWhatsAppReport,
    }}>
      {children}
    </SubdomainContext.Provider>
  );
}

export function useSubdomains() {
  const ctx = useContext(SubdomainContext);
  if (!ctx) throw new Error("useSubdomains must be used within SubdomainProvider");
  return ctx;
}

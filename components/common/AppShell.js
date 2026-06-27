"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCronBoy } from "@/context/CronBoyContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RightPanel from "./RightPanel";
import Toaster from "./Toaster";
import DialogModals from "./DialogModals";
import DetailModal from "./DetailModal";
import SlidePanel from "./SlidePanel";
import { renderTrendChart } from "../utils";

export default function AppShell({ children }) {
  const ctx = useCronBoy();
  const pathname = usePathname();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileRightPanelOpen, setMobileRightPanelOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
    setMobileRightPanelOpen(false);
  }, [pathname]);

  const {
    isAuthenticated,
    isLoading,
    activeEnv,
    toasts,
    isPanelOpen,
    setIsPanelOpen,
    panelMode,
    panelData,
    setPanelData,
    handlePanelSubmit,
    translateCron,
    detailModal,
    setDetailModal,
    subdomains,
    handleTogglePause,
    handleTriggerCheck,
    handleOpenEditPanel,
    setDeleteConfirm,
    envFiltered,
    incidents,
    cronActivityStats,
    stats,
    donutPercentages,
    deleteConfirm,
    confirmDeleteAction,
    unlinkConfirm,
    setUnlinkConfirm,
    confirmUnlinkAction,
    addRuleModal,
    setAddRuleModal,
    addRuleAction,
    handleOpenAddPanel,
    themeMsg,
    handleThemeClick,
    handleSignOut,
    handleLogoError
  } = ctx;

  // Donut Arc rendering (circumference 163.3)
  const renderDonutChart = () => {
    const total = envFiltered.length || 1;
    const healthy = envFiltered.filter(s => s.status === "healthy").length;
    const degraded = envFiltered.filter(s => s.status === "degraded").length;
    const down = envFiltered.filter(s => s.status === "down").length;
    const paused = envFiltered.filter(s => s.status === "paused").length;

    const r = 26;
    const circ = 2 * Math.PI * r;

    const gap = 3;
    const numSegments = (healthy > 0 ? 1 : 0) + (degraded > 0 ? 1 : 0) + (down > 0 ? 1 : 0) + (paused > 0 ? 1 : 0);
    const totalGaps = numSegments * gap;
    const activeCirc = circ - totalGaps;

    const healthyLen = healthy > 0 ? (healthy / total) * activeCirc : 0;
    const degradedLen = degraded > 0 ? (degraded / total) * activeCirc : 0;
    const downLen = down > 0 ? (down / total) * activeCirc : 0;
    const pausedLen = paused > 0 ? (paused / total) * activeCirc : 0;

    let offset = 0;

    const segments = [];
    if (healthyLen > 0) {
      segments.push({
        stroke: "#22C55E",
        dash: `${healthyLen} ${circ - healthyLen}`,
        offset: -offset
      });
      offset += healthyLen + gap;
    }
    if (degradedLen > 0) {
      segments.push({
        stroke: "#F59E0B",
        dash: `${degradedLen} ${circ - degradedLen}`,
        offset: -offset
      });
      offset += degradedLen + gap;
    }
    if (downLen > 0) {
      segments.push({
        stroke: "#EF4444",
        dash: `${downLen} ${circ - downLen}`,
        offset: -offset
      });
      offset += downLen + gap;
    }
    if (pausedLen > 0) {
      segments.push({
        stroke: "#A1A1AA",
        dash: `${pausedLen} ${circ - pausedLen}`,
        offset: -offset
      });
    }

    return (
      <svg width="68" height="68" viewBox="0 0 68 68" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="34" cy="34" r="26" fill="transparent" stroke="var(--border)" strokeWidth="4.5" />
        {segments.map((seg, idx) => (
          <circle
            key={idx}
            cx="34"
            cy="34"
            r="26"
            fill="transparent"
            stroke={seg.stroke}
            strokeWidth="4.5"
            strokeDasharray={seg.dash}
            strokeDashoffset={seg.offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.3s ease, stroke-dashoffset 0.3s ease" }}
          />
        ))}
      </svg>
    );
  };

  if (pathname === "/login") {
    return children;
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div style={{
        position: "fixed", inset: 0,
        background: "var(--background)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999
      }}>
        <div style={{
          width: "40px", height: "40px",
          border: "3px solid var(--border)",
          borderTopColor: "var(--primary-accent)",
          borderRadius: "50%",
          animation: "cb-spin 700ms linear infinite"
        }} />

        <style>{`@keyframes cb-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Map route pathnames to Header-compatible activeView names
  const getViewName = (path) => {
    switch (path) {
      case "/dashboard": return "Dashboard";
      case "/domains": return "Domains";
      case "/dns": return "DNS Health";
      case "/jobs": return "Job Overview";
      case "/logs": return "Execution Logs";
      case "/alerts": return "Alert Rules";
      case "/channels": return "Channels";
      case "/incidents": return "Incident History";
      case "/users": return "User Management";
      case "/settings": return "Settings";
      default: return "Dashboard";
    }
  };

  const activeView = getViewName(pathname);

  return (
    <div className="app-container">
      {/* Backdrop overlay for mobile */}
      {(mobileSidebarOpen || mobileRightPanelOpen) && (
        <div
          className="mobile-overlay-backdrop"
          onClick={() => {
            setMobileSidebarOpen(false);
            setMobileRightPanelOpen(false);
          }}
        />
      )}

      {/* 1. SIDEBAR NAVIGATION */}
      <Sidebar
        activeEnv={activeEnv}
        setActiveEnv={ctx.setActiveEnv}
        searchQuery={ctx.searchQuery}
        setSearchQuery={ctx.setSearchQuery}
        themeMsg={themeMsg}
        handleThemeClick={handleThemeClick}
        handleSignOut={handleSignOut}
        handleLogoError={handleLogoError}
        mobileOpen={mobileSidebarOpen}
      />

      {/* 2. CENTER PANEL */}
      <main className="center-panel">
        <Header
          activeView={activeView}
          activeEnv={activeEnv}
          handleOpenAddPanel={handleOpenAddPanel}
          toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          toggleMobileRightPanel={() => setMobileRightPanelOpen(!mobileRightPanelOpen)}
        />
        {children}
      </main>

      {/* 3. RIGHT PANEL */}
      <RightPanel
        activeView={activeView}
        envFiltered={envFiltered}
        incidents={incidents}
        cronActivityStats={cronActivityStats}
        stats={stats}
        donutPercentages={donutPercentages}
        renderDonutChart={renderDonutChart}
        mobileOpen={mobileRightPanelOpen}
      />

      {/* 4. SLIDE OVER REGISTRATION PANEL */}
      <SlidePanel
        isPanelOpen={isPanelOpen}
        setIsPanelOpen={setIsPanelOpen}
        panelMode={panelMode}
        panelData={panelData}
        setPanelData={setPanelData}
        handlePanelSubmit={handlePanelSubmit}
        activeEnv={activeEnv}
        translateCron={translateCron}
      />

      {/* 5. DIALOG CONFIRMATION MODALS */}
      <DialogModals
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        confirmDeleteAction={confirmDeleteAction}
        unlinkConfirm={unlinkConfirm}
        setUnlinkConfirm={setUnlinkConfirm}
        confirmUnlinkAction={confirmUnlinkAction}
        addRuleModal={addRuleModal}
        setAddRuleModal={setAddRuleModal}
        addRuleAction={addRuleAction}
        sendReportModal={ctx.sendReportModal}
        setSendReportModal={ctx.setSendReportModal}
        handleSendWhatsAppReport={ctx.handleSendWhatsAppReport}
      />

      {/* 6. SUBDOMAIN DETAIL INFO MODAL */}
      <DetailModal
        detailModal={detailModal}
        setDetailModal={setDetailModal}
        subdomains={subdomains}
        renderTrendChart={renderTrendChart}
        translateCron={translateCron}
        handleTogglePause={handleTogglePause}
        handleTriggerCheck={handleTriggerCheck}
        handleOpenEditPanel={handleOpenEditPanel}
        setDeleteConfirm={setDeleteConfirm}
      />

      {/* 7. TOAST NOTIFICATION CONTAINER */}
      <Toaster toasts={toasts} />
    </div>
  );
}

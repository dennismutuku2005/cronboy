"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCronBoy } from "@/context/CronBoyContext";

export default function Sidebar({
  activeEnv,
  setActiveEnv,
  searchQuery,
  setSearchQuery,
  themeMsg,
  handleThemeClick,
  handleSignOut,
  handleLogoError,
  mobileOpen
}) {
  const { currentUser } = useCronBoy();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const openConfirm = () => setConfirmOpen(true);
  const closeConfirm = () => setConfirmOpen(false);
  const confirmSignOut = () => {
    closeConfirm();
    handleSignOut();
  };
  const pathname = usePathname();

  const isRouteActive = (route) => {
    return pathname === route;
  };

  return (
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-top">
        <div className="sidebar-logo-area" style={{ display: "flex", justifyContent: "center", width: "100%", padding: "8px 0" }}>
          <img 
            src="/logo.png" 
            alt="Cron Boy" 
            onError={handleLogoError}
            className="logo-image" 
            style={{ height: "30px", width: "auto" }}
          />
        </div>

        <input
          type="text"
          className="sidebar-search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <nav className="sidebar-nav">
          <div className="nav-group">
            <span className="nav-section-label">Monitoring</span>
            <Link
              href="/dashboard"
              className={`nav-item ${isRouteActive("/dashboard") ? "active" : ""}`}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
              Dashboard
            </Link>
            <Link
              href="/domains"
              className={`nav-item ${isRouteActive("/domains") ? "active" : ""}`}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3.157 7.582A8.959 8.959 0 003 12c0 .778.099 1.533.284 2.253" /></svg>
              Domains
            </Link>
            <Link
              href="/dns"
              className={`nav-item ${isRouteActive("/dns") ? "active" : ""}`}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" /></svg>
              DNS Health
            </Link>
          </div>

          <div className="nav-group">
            <span className="nav-section-label">Cron Jobs</span>
            <Link
              href="/jobs"
              className={`nav-item ${isRouteActive("/jobs") ? "active" : ""}`}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Job Overview
            </Link>
            <Link
              href="/logs"
              className={`nav-item ${isRouteActive("/logs") ? "active" : ""}`}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              Execution Logs
            </Link>
          </div>

          <div className="nav-group">
            <span className="nav-section-label">Alerts</span>
            <Link
              href="/alerts"
              className={`nav-item ${isRouteActive("/alerts") ? "active" : ""}`}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
              Alert Rules
            </Link>
            <Link
              href="/channels"
              className={`nav-item ${isRouteActive("/channels") ? "active" : ""}`}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
              Channels
            </Link>
            <Link
              href="/incidents"
              className={`nav-item ${isRouteActive("/incidents") ? "active" : ""}`}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
              Incidents
            </Link>
          </div>

          <div className="nav-group">
            <span className="nav-section-label">System</span>
            {currentUser?.role === "Superadmin" && (
              <Link
                href="/users"
                className={`nav-item ${isRouteActive("/users") ? "active" : ""}`}
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.368A4.99 4.99 0 0013 15H11a4.99 4.99 0 00-4.982 3.368M12 3a4 4 0 110 8 4 4 0 010-8zm7.5 17.25v-1.125a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25V20.25" /></svg>
                Users
              </Link>
            )}
          </div>
        </nav>


      </div>

      <div className="sidebar-bottom">
        <button className="sidebar-logout-btn" onClick={openConfirm}>
          Logout
        </button>
      </div>

      {confirmOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.65)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          padding: "16px"
        }}>
          <div style={{
            background: "var(--background)",
            borderRadius: "18px",
            padding: "24px",
            width: "100%",
            maxWidth: "360px",
            boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
            display: "flex",
            flexDirection: "column",
            gap: "18px"
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "16px", color: "var(--primary-text)" }}>Confirm Logout</h2>
              <p style={{ margin: "8px 0 0", fontSize: "13px", color: "var(--secondary-text)", lineHeight: 1.6 }}>
                Are you sure you want to sign out? You can log back in anytime.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", width: "100%" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={closeConfirm}>
                Cancel
              </button>
              <button className="btn-destructive" style={{ flex: 1 }} onClick={confirmSignOut}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

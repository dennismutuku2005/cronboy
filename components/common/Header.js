import React from "react";

export default function Header({
  activeView,
  activeEnv,
  handleOpenAddPanel,
  toggleMobileSidebar,
  toggleMobileRightPanel
}) {
  return (
    <header className="page-header" style={{ display: "flex", alignItems: "center", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Hamburger Menu Icon */}
        <button 
          className="mobile-toggle-btn"
          onClick={toggleMobileSidebar}
          style={{ background: "transparent", border: "none", cursor: "pointer", display: "none" }}
          title="Open Navigation"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div>
          <h1 className="page-title" style={{ fontSize: "18px", margin: "0" }}>
            {activeView === "Dashboard" ? "Dashboard" :
             activeView === "Domains" ? "Domains" :
                activeView === "DNS Health" ? "DNS Health" :
             activeView === "Job Overview" || activeView === "Schedules" ? "Job Overview" :
             activeView === "Execution Logs" ? "Execution Logs" :
             activeView === "Alert Rules" ? "Alert Rules" :
             activeView === "Channels" ? "Channels" :
             activeView === "Incident History" ? "Incident History" :
             activeView === "Settings" ? "Settings" : activeView}
          </h1>
          <span className="mono-text header-subtitle" style={{ fontSize: "11px", color: "var(--muted-text)" }}>
            Environment: {activeEnv} &nbsp;·&nbsp; {new Date().toLocaleDateString("en-GB", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {(activeView === "Dashboard" || activeView === "Domains") && (
          <button className="btn-primary header-add-btn" onClick={handleOpenAddPanel}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="btn-text">Register Domain</span>
          </button>
        )}

        {/* Right Panel Toggle Icon (Activity / Info) */}
        {(activeView === "Dashboard" || activeView === "Domains") && (
          <button 
            className="mobile-toggle-btn right-toggle"
            onClick={toggleMobileRightPanel}
            style={{ background: "transparent", border: "none", cursor: "pointer", display: "none" }}
            title="Open Activity Details"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}

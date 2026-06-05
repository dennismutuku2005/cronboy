import React from "react";

export default function SlidePanel({
  isPanelOpen,
  setIsPanelOpen,
  panelMode,
  panelData,
  setPanelData,
  handlePanelSubmit,
  activeEnv,
  translateCron
}) {
  if (!isPanelOpen) return null;

  return (
    <div className="panel-backdrop" onClick={() => setIsPanelOpen(false)}>
      <div className={`slide-panel ${isPanelOpen ? "open" : ""}`} onClick={(e) => e.stopPropagation()}>
        
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "500" }}>
            {panelMode === "add" ? "Register Subdomain Monitor" : "Edit Monitor Configuration"}
          </h2>
          <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--secondary-text)" }} onClick={() => setIsPanelOpen(false)}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form onSubmit={handlePanelSubmit} style={{ display: "flex", flexDirection: "column", flex: "1", minHeight: "0", justifyContent: "space-between" }}>
          
          <div className="custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", flex: "1", minHeight: "0", paddingRight: "4px" }}>
            
            <div className="form-group">
              <label className="form-label">Subdomain URL / Hostname</label>
              <input
                type="text"
                required
                placeholder="e.g. staging-api.cronboy.io"
                className="form-input"
                value={panelData.subdomain}
                onChange={(e) => setPanelData({ ...panelData, subdomain: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Workspace Environment</label>
              <select
                className="form-input"
                value={panelData.env}
                onChange={(e) => setPanelData({ ...panelData, env: e.target.value })}
              >
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="Dev">Development</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Ping Interval</label>
              <select
                className="form-input"
                value={panelData.checkInterval}
                onChange={(e) => setPanelData({ ...panelData, checkInterval: e.target.value })}
              >
                <option value="10s">10 Seconds (Minimum)</option>
                <option value="30s">30 Seconds</option>
                <option value="1m">1 Minute</option>
                <option value="5m">5 Minutes</option>
                <option value="10m">10 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="30m">30 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="custom">Custom interval...</option>
              </select>
            </div>

            {panelData.checkInterval === "custom" && (
              <div className="form-group" style={{ flexDirection: "row", gap: "8px" }}>
                <div style={{ flex: 2 }}>
                  <label className="form-label">Interval Value</label>
                  <input
                    type="number"
                    className="form-input"
                    value={panelData.customIntervalVal}
                    onChange={(e) => setPanelData({ ...panelData, customIntervalVal: e.target.value })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Unit</label>
                  <select
                    className="form-input"
                    value={panelData.customIntervalUnit}
                    onChange={(e) => setPanelData({ ...panelData, customIntervalUnit: e.target.value })}
                  >
                    <option value="s">Seconds</option>
                    <option value="m">Minutes</option>
                    <option value="h">Hours</option>
                  </select>
                </div>
              </div>
            )}

            <div className="form-group" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "10px", marginTop: "4px" }}>
              <div>
                <label className="form-label" style={{ color: "var(--primary-text)", margin: 0 }}>SSL Expiry Monitor</label>
                <span style={{ fontSize: "10px", color: "var(--muted-text)", display: "block" }}>
                  Automatic check validity alert
                </span>
              </div>
              <label className="toggle-container">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={panelData.sslAutoRenew}
                  onChange={(e) => setPanelData({ ...panelData, sslAutoRenew: e.target.checked })}
                />
                <span className="toggle-switch"></span>
              </label>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px", marginTop: "4px" }}>
              <h4 style={{ fontSize: "11px", fontWeight: "500", color: "var(--secondary-text)", marginBottom: "8px" }}>
                Cron Job Link (Optional)
              </h4>
              
              <div className="form-group">
                <label className="form-label">Cron Job Identifier Name</label>
                <input
                  type="text"
                  placeholder="e.g. Database Backup Script"
                  className="form-input"
                  value={panelData.linkedCron}
                  onChange={(e) => setPanelData({ ...panelData, linkedCron: e.target.value })}
                />
              </div>

              {panelData.linkedCron && (
                <div className="form-group">
                  <label className="form-label">Cron Expression Schedule</label>
                  <input
                    type="text"
                    className="form-input mono"
                    value={panelData.cronSchedule}
                    onChange={(e) => setPanelData({ ...panelData, cronSchedule: e.target.value })}
                  />
                  <span className="form-sub-preview">
                    Preview: {translateCron(panelData.cronSchedule)}
                  </span>
                </div>
              )}
            </div>

          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "10px" }}>
              {panelMode === "add" ? "Start Monitoring Subdomain" : "Save Monitor Config"}
            </button>
            <button type="button" className="btn-secondary" style={{ width: "100%", border: "none" }} onClick={() => setIsPanelOpen(false)}>
              Cancel changes
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

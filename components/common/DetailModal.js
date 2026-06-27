import React from "react";

export default function DetailModal({
  detailModal,
  setDetailModal,
  subdomains,
  renderTrendChart,
  translateCron,
  handleTogglePause,
  handleTriggerCheck,
  handleOpenEditPanel,
  setDeleteConfirm
}) {
  if (!detailModal.isOpen || !detailModal.sub) return null;

  const sub = subdomains.find(s => s.id === detailModal.sub.id) || detailModal.sub;

  return (
    <div className="dialog-backdrop" onClick={() => setDetailModal({ isOpen: false, sub: null })}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ width: "650px", maxWidth: "95vw" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className={`status-dot ${sub.status}`} style={{ width: "9px", height: "9px" }} />
            <h3 className="dialog-title" style={{ margin: 0, fontSize: "16px" }}>
              {sub.subdomain}
            </h3>
          </div>
          <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--secondary-text)" }} onClick={() => setDetailModal({ isOpen: false, sub: null })}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "70vh", overflowY: "auto", paddingRight: "4px" }}>
          
          {/* Stats Summary Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginTop: "4px" }}>
            <div style={{ background: "var(--hover-background)", padding: "10px", borderRadius: "6px" }}>
              <div style={{ fontSize: "10px", color: "var(--secondary-text)" }}>Status</div>
              <div className="mono-text" style={{ fontSize: "13px", color: "var(--primary-text)", textTransform: "uppercase" }}>{sub.status}</div>
            </div>
            <div style={{ background: "var(--hover-background)", padding: "10px", borderRadius: "6px" }}>
              <div style={{ fontSize: "10px", color: "var(--secondary-text)" }}>Environment</div>
              <div className="mono-text" style={{ fontSize: "13px", color: "var(--primary-text)" }}>{sub.env}</div>
            </div>
            <div style={{ background: "var(--hover-background)", padding: "10px", borderRadius: "6px" }}>
              <div style={{ fontSize: "10px", color: "var(--secondary-text)" }}>Uptime (7d)</div>
              <div className="mono-text" style={{ fontSize: "13px", color: "var(--success-green-text)", fontWeight: "500" }}>{sub.uptime}%</div>
            </div>
            <div style={{ background: "var(--hover-background)", padding: "10px", borderRadius: "6px" }}>
              <div style={{ fontSize: "10px", color: "var(--secondary-text)" }}>Ping Interval</div>
              <div className="mono-text" style={{ fontSize: "13px", color: "var(--primary-text)" }}>{sub.checkInterval}</div>
            </div>
          </div>

          {/* Latency Trend Area */}
          <div>
            <h4 style={{ fontSize: "11px", fontWeight: "500", color: "var(--secondary-text)", marginBottom: "6px" }}>
              Response Latency History (7-Day Check Trend)
            </h4>
            <div style={{ height: "130px", border: "1px solid var(--border)", borderRadius: "6px", background: "#FFFFFF", padding: "8px" }}>
              {renderTrendChart(sub.history, sub.status)}
            </div>
          </div>

          {/* Linked Cron Jobs details */}
          {sub.linkedCron && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid var(--border)", padding: "12px", borderRadius: "8px" }}>
              <h4 style={{ fontSize: "11px", fontWeight: "500", color: "var(--primary-text)" }}>Linked Cron Scheduler</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "var(--secondary-text)" }}>Job Identifier:</span> <strong className="mono-text">{sub.linkedCron}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--secondary-text)" }}>Cron Expression:</span> <span className="mono-text">{sub.cronSchedule}</span>
                </div>
                <div style={{ gridColumn: "1/-1", fontSize: "11px", color: "var(--muted-text)", borderTop: "1px solid var(--border)", paddingTop: "6px" }}>
                  Schedule Translation: {translateCron(sub.cronSchedule)}
                </div>
              </div>
            </div>
          )}

          {/* Full Execution Check Logs */}
          <div>
            <h4 style={{ fontSize: "11px", fontWeight: "500", color: "var(--secondary-text)", marginBottom: "6px" }}>
              Real-time Executions Logs
            </h4>
            <div className="log-container custom-scrollbar" style={{ maxHeight: "150px" }}>
              {sub.logs && sub.logs.map((log, index) => (
                <div key={index} className={`log-line ${log.status}`} style={{ fontSize: "10.5px" }}>
                  <span className="log-timestamp">[{log.timestamp}]</span>
                  <span className={`log-status-bullet ${log.status}`}>●</span>
                  <span className="mono-text log-status-text" style={{
                    color: log.status === "healthy" ? "var(--success-green-text)" :
                           log.status === "degraded" ? "var(--warning-amber-text)" : "var(--error-red-text)",
                    textTransform: "uppercase",
                    width: "55px",
                    display: "inline-block"
                  }}>{log.status}</span>
                  <span className="log-duration">{log.duration}</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="dialog-footer" style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "4px" }}>
          <button className="btn-secondary" onClick={(e) => { handleTogglePause(sub.id, e); }}>
            {sub.status === "paused" ? "Resume Checks" : "Pause Monitor"}
          </button>
          <button className="btn-secondary" onClick={(e) => { handleTriggerCheck(sub.id, e); }}>
            Ping Check
          </button>
          <button className="btn-secondary" onClick={(e) => { setDetailModal({ isOpen: false, sub: null }); handleOpenEditPanel(sub, e); }}>
            Edit Config
          </button>
          <button className="btn-destructive" onClick={(e) => { setDetailModal({ isOpen: false, sub: null }); setDeleteConfirm({ isOpen: true, id: sub.id, subdomain: sub.subdomain, isBatch: false }); }}>
            Delete Monitor
          </button>
        </div>

      </div>
    </div>
  );
}

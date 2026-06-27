import React from "react";

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Unknown';
  const then = new Date(timestamp);
  const diffMs = Date.now() - then.getTime();
  if (diffMs < 0) return 'Just now';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export default function RightPanel({
  activeView,
  envFiltered,
  incidents,
  cronActivityStats,
  stats,
  donutPercentages,
  renderDonutChart,
  mobileOpen
}) {
  if (activeView !== "Dashboard" && activeView !== "Subdomains") {
    return null;
  }

  const latestIncident = incidents?.[0] || null;
  const lastFailure = incidents?.find((item) => item.status?.toLowerCase() === 'down');

  return (
    <aside className={`right-panel ${mobileOpen ? "mobile-open" : ""}`}>
      {/* Card 1 — Uptime Overview */}
      <div className="card-panel flex flex-col gap-12" style={{ padding: "16px" }}>
        <h3 className="right-panel-title">Uptime Overview</h3>
        
        <div className="donut-widget">
          <div className="donut-chart-container">
            {renderDonutChart()}
            <div className="donut-chart-text">
              <span className="donut-chart-value">{donutPercentages.overallUptime}%</span>
              <span className="donut-chart-label">Uptime</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#22C55E" }}></span>
              <span className="mono-text" style={{ fontSize: "10px", color: "var(--secondary-text)" }}>{donutPercentages.healthyPct}% Healthy</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#F59E0B" }}></span>
              <span className="mono-text" style={{ fontSize: "10px", color: "var(--secondary-text)" }}>{donutPercentages.degradedPct}% Slow</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#EF4444" }}></span>
              <span className="mono-text" style={{ fontSize: "10px", color: "var(--secondary-text)" }}>{donutPercentages.downPct}% Down</span>
            </div>
          </div>
        </div>

        <div className="right-stat-list">
          <div className="right-stat-row">
            <span className="right-stat-label">Total Monitored</span>
            <span className="right-stat-val">{envFiltered.length} domains</span>
          </div>
          <div className="right-stat-row">
            <span className="right-stat-label">Avg Response</span>
            <span className="right-stat-val">
              {envFiltered.length > 0 ? `${Math.round(envFiltered.reduce((acc, curr) => acc + (curr.responseTime || 0), 0) / envFiltered.length)}ms` : "—"}
            </span>
          </div>
          <div className="right-stat-row" style={{ borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "4px" }}>
            <span className="right-stat-label">Last Incident</span>
            <span className="right-stat-val" style={{ color: latestIncident ? "var(--error-red-text)" : "var(--success-green-text)", fontSize: "11px" }}>
              {latestIncident ? `${latestIncident.subdomain || 'Unknown'} (${latestIncident.status})` : "None active"}
            </span>
          </div>
        </div>
      </div>

      {/* Card 2 — Cron Activity */}
      <div className="card-panel flex flex-col gap-12" style={{ padding: "16px" }}>
        <h3 className="right-panel-title">Cron Jobs Activity</h3>

        <div className="bar-chart-container">
          <div className="bar-column">
            <div className="bar-wrapper">
              <div className="bar-fill success" style={{ height: "85%" }}></div>
            </div>
            <span className="bar-label">M</span>
          </div>
          <div className="bar-column">
            <div className="bar-wrapper">
              <div className="bar-fill success" style={{ height: "92%" }}></div>
            </div>
            <span className="bar-label">T</span>
          </div>
          <div className="bar-column">
            <div className="bar-wrapper">
              <div className="bar-fill failed" style={{ height: "70%" }}></div>
            </div>
            <span className="bar-label">W</span>
          </div>
          <div className="bar-column">
            <div className="bar-wrapper">
              <div className="bar-fill success" style={{ height: "100%" }}></div>
            </div>
            <span className="bar-label">T</span>
          </div>
          <div className="bar-column">
            <div className="bar-wrapper">
              <div className="bar-fill success" style={{ height: "88%" }}></div>
            </div>
            <span className="bar-label">F</span>
          </div>
          <div className="bar-column">
            <div className="bar-wrapper">
              <div className="bar-fill success" style={{ height: "60%" }}></div>
            </div>
            <span className="bar-label">S</span>
          </div>
          <div className="bar-column">
            <div className="bar-wrapper">
              <div className="bar-fill success" style={{ 
                height: stats.failures24h > 0 ? "72%" : "95%",
                backgroundColor: stats.failures24h > 0 ? "rgba(239,68,68,0.20)" : "rgba(34,197,94,0.25)",
                borderTopColor: stats.failures24h > 0 ? "var(--error-red)" : "var(--success-green)"
              }}></div>
            </div>
            <span className="bar-label">S</span>
          </div>
        </div>

        <div className="right-stat-list">
          <div className="right-stat-row">
            <span className="right-stat-label">runs scheduled (24h)</span>
            <span className="right-stat-val">{cronActivityStats.totalRuns}</span>
          </div>
          <div className="right-stat-row">
            <span className="right-stat-label">Success Rate</span>
            <span className="right-stat-val" style={{ color: cronActivityStats.successRate > 98 ? "var(--success-green-text)" : "var(--warning-amber-text)" }}>
              {stats.failures24h > 0 ? "92.4%" : "99.8%"}
            </span>
          </div>
          <div className="right-stat-row">
            <span className="right-stat-label">Avg Execution</span>
            <span className="right-stat-val">{cronActivityStats.avgDuration}ms</span>
          </div>
          <div className="right-stat-row" style={{ borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "4px" }}>
            <span className="right-stat-label">Last failure</span>
            <span className="right-stat-val" style={{ fontSize: "11px", color: lastFailure ? "var(--error-red-text)" : "var(--muted-text)" }}>
              {lastFailure ? formatTimeAgo(lastFailure.timestamp) : "No recent failure"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

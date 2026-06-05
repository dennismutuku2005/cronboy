"use client";

import React from "react";
import { useCronBoy } from "@/context/CronBoyContext";

export default function LogsPage() {
  const {
    subdomains,
    activeEnv,
    searchQuery,
    updateSubdomainsState,
    triggerToast
  } = useCronBoy();

  const allLogs = [];
  subdomains.forEach(sub => {
    if (sub.env === activeEnv || activeEnv === "All") {
      sub.logs.forEach(log => {
        allLogs.push({
          ...log,
          subdomain: sub.subdomain,
          env: sub.env
        });
      });
    }
  });

  allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filteredLogs = searchQuery.trim()
    ? allLogs.filter(l => l.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) || l.message.toLowerCase().includes(searchQuery.toLowerCase()))
    : allLogs;

  return (
    <div className="view-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="view-description" style={{ margin: 0 }}>
          Global monitoring logs across all active domains in the {activeEnv} workspace.
        </span>
        <button className="btn-secondary" style={{ padding: "4px 10px", fontSize: "11px" }} onClick={() => {
          const cleared = subdomains.map(s => ({ ...s, logs: [] }));
          updateSubdomainsState(cleared);
          triggerToast("Logs Database Cleared", "Outage logs truncated.", "info");
        }}>
          Clear Logs Database
        </button>
      </div>

      <div className="card-panel custom-scrollbar" style={{ maxHeight: "500px", overflowY: "auto", padding: "12px", backgroundColor: "#0A0A0B", border: "1px solid #1F1F23" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {filteredLogs.length === 0 ? (
            <div className="mono-text" style={{ color: "#71717A", fontSize: "12px", textAlign: "center", padding: "40px" }}>
              -- No execution logs available --
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={index} style={{
                display: "flex",
                alignItems: "baseline",
                gap: "10px",
                fontFamily: "DM Mono, monospace",
                fontSize: "11px",
                color: "#E4E4E7",
                lineHeight: "1.4",
                padding: "3px 8px",
                borderBottom: "1px solid #18181B"
              }}>
                <span style={{ color: "#71717A" }}>[{log.timestamp}]</span>
                <span style={{
                  color: log.status === "healthy" ? "#22C55E" :
                         log.status === "degraded" ? "#F59E0B" : "#EF4444",
                  textTransform: "uppercase",
                  width: "70px",
                  display: "inline-block"
                }}>{log.status}</span>
                <span style={{ color: "#A1A1AA", width: "160px", display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {log.subdomain}
                </span>
                <span style={{ color: "#71717A", width: "45px", display: "inline-block" }}>{log.duration}</span>
                <span style={{ color: "#FFFFFF" }}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

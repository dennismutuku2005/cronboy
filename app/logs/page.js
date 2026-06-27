"use client";

import React, { useEffect, useState } from "react";
import { useCronBoy } from "@/context/CronBoyContext";
import { fetchLogs } from "@/lib/api";
import { useInfiniteScroll, InfiniteScrollTrigger, SkeletonRow } from "@/components/common/InfiniteScroll";

export default function LogsPage() {
  const { activeEnv, searchQuery, triggerToast } = useCronBoy();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    fetchLogs({ env: activeEnv, search: searchQuery })
      .then((res) => {
        if (!active) return;
        if (res?.ok) {
          setLogs(res.data || []);
        } else {
          setLogs([]);
          setError(res?.error || "Unable to load logs");
        }
      })
      .catch((err) => {
        if (!active) return;
        setLogs([]);
        setError(err?.message || "Unable to load logs");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeEnv, searchQuery, refreshKey]);

  const {
    displayedItems: displayedLogs,
    isLoadingMore,
    hasMore,
    loadMore
  } = useInfiniteScroll(logs, 20, 20);

  return (
    <div className="view-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
        <div>
          <h2 className="page-title" style={{ margin: 0, fontSize: "18px" }}>Execution Logs</h2>
          <p className="view-description" style={{ margin: "6px 0 0" }}>
            All cron execution history across {activeEnv}.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn-secondary" onClick={() => setRefreshKey(prev => prev + 1)} style={{ padding: "8px 12px" }}>
            Refresh Logs
          </button>
          <button className="btn-secondary" onClick={() => triggerToast("Logs Refreshed", "Log list is up to date.", "success")} style={{ padding: "8px 12px" }}>
            Show Status
          </button>
        </div>
      </div>

      <div className="table-container" style={{ marginTop: "16px" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "180px" }}>Timestamp</th>
              <th style={{ width: "160px" }}>Cron Job</th>
              <th>Target Subdomain</th>
              <th style={{ width: "92px" }}>Status</th>
              <th style={{ width: "92px" }}>Duration</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <SkeletonRow key={index} colSpan={6} />
              ))
            ) : error ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "var(--error-red-text)", padding: "28px 0" }}>
                  {error}
                </td>
              </tr>
            ) : displayedLogs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "var(--muted-text)", padding: "28px 0" }}>
                  No execution logs matched the current filter.
                </td>
              </tr>
            ) : (
              displayedLogs.map((log) => (
                <tr key={log.id}>
                  <td className="mono-text" style={{ fontSize: "12px", color: "var(--secondary-text)" }}>
                    {log.timestamp}
                  </td>
                  <td className="mono-text" style={{ fontSize: "12px", color: "var(--primary-text)" }}>
                    {log.linked_cron || "Unlinked job"}
                  </td>
                  <td className="mono-text" style={{ fontSize: "12px", color: "var(--primary-text)" }}>
                    {log.subdomain || "Unknown target"}
                  </td>
                  <td>
                    <span className={`badge ${log.status === "healthy" ? "badge-healthy" : log.status === "degraded" ? "badge-degraded" : "badge-down"}`}>
                      {log.status?.toUpperCase() || "UNKNOWN"}
                    </span>
                  </td>
                  <td className="mono-text" style={{ fontSize: "12px", color: "var(--secondary-text)" }}>
                    {log.duration || "—"}
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--primary-text)" }}>
                    {log.message || "No details available."}
                  </td>
                </tr>
              ))
            )}
            {hasMore && !isLoading && (
              <InfiniteScrollTrigger hasMore={hasMore} loadMore={loadMore} colSpan={6} />
            )}
            {isLoadingMore && (
              <>
                <SkeletonRow colSpan={6} />
                <SkeletonRow colSpan={6} />
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { useCronBoy } from "@/context/CronBoyContext";
import { renderSparkline } from "@/components/utils";
import { useInfiniteScroll, InfiniteScrollTrigger, SkeletonRow } from "@/components/common/InfiniteScroll";

export default function DashboardPage() {
  const ctx = useCronBoy();

  const {
    stats,
    envFiltered,
    activeTab,
    setActiveTab,
    selectedRows,
    finalFilteredSubdomains,
    handleSelectAll,
    handleSelectRow,
    handleBatchPause,
    handleBatchDelete,
    handleTriggerCheck,
    handleOpenEditPanel,
    setDeleteConfirm,
    setDetailModal,
    sendWhatsAppReportPrompt
  } = ctx;

  const {
    displayedItems: displayedSubdomains,
    isLoadingMore,
    hasMore,
    loadMore
  } = useInfiniteScroll(finalFilteredSubdomains, 6, 6);

  if (!stats) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="view-container">
      {/* Metrics Cards */}
      <section className="stats-bar">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Monitored</span>
            <span className="stat-delta delta-neutral">—</span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-value">{stats.total}</span>
            {renderSparkline([stats.total, stats.total, stats.total, stats.total], "healthy")}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Healthy States</span>
            <span className="stat-delta delta-up">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              100%
            </span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-value">{stats.healthy}</span>
            {renderSparkline([stats.healthy-1, stats.healthy, stats.healthy, stats.healthy], "healthy")}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Degraded</span>
            <span className="stat-delta delta-down">
              {stats.degraded > 0 ? (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  +1
                </>
              ) : "0"}
            </span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-value">{stats.degraded}</span>
            {renderSparkline([0, stats.degraded, stats.degraded, stats.degraded], "degraded")}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Cron Jobs Active</span>
            <span className="stat-delta delta-neutral">Live</span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-value">{stats.activeCrons}</span>
            {renderSparkline([stats.activeCrons, stats.activeCrons, stats.activeCrons, stats.activeCrons], "healthy")}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Failures (24h)</span>
            <span className="stat-delta delta-down" style={{ display: stats.failures24h > 0 ? "inline-flex" : "none" }}>
              Active
            </span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-value" style={{ color: stats.failures24h > 0 ? "var(--error-red-text)" : "inherit" }}>
              {stats.failures24h}
            </span>
            {renderSparkline([0, 0, stats.failures24h, stats.failures24h], "down")}
          </div>
        </div>
      </section>

      {/* Filter Tab strip */}
      <div className="tab-strip">
        {["All", "Healthy", "Degraded", "Down", "Expiring SSL", "Paused"].map((tab) => {
          const count = 
            tab === "All" ? envFiltered.length :
            tab === "Healthy" ? envFiltered.filter(s => s.status === "healthy").length :
            tab === "Degraded" ? envFiltered.filter(s => s.status === "degraded").length :
            tab === "Down" ? envFiltered.filter(s => s.status === "down").length :
            tab === "Expiring SSL" ? envFiltered.filter(s => s.sslExpiryDays <= 7 && s.status !== "paused").length :
            envFiltered.filter(s => s.status === "paused").length;

          return (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Batch operation panel */}
      {selectedRows.length > 0 && (
        <div className="card-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", marginBottom: "12px", border: "1px solid var(--primary-accent)", background: "var(--primary-accent-bg)" }}>
          <span className="mono-text" style={{ fontSize: "11px", color: "var(--primary-accent)" }}>
            {selectedRows.length} items selected
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-secondary" onClick={handleBatchPause} style={{ padding: "4px 8px", fontSize: "11px" }}>
              Toggle Pause/Monitor
            </button>
            <button className="btn-destructive" onClick={handleBatchDelete} style={{ padding: "4px 8px", fontSize: "11px" }}>
              Batch Delete
            </button>
            <button className="btn-primary" onClick={() => sendWhatsAppReportPrompt(selectedRows)} style={{ padding: "6px 10px", fontSize: "12px" }}>
              Send report (WhatsApp)
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <section className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "40px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={finalFilteredSubdomains.length > 0 && finalFilteredSubdomains.every(sub => selectedRows.includes(sub.id))}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ width: "60px", textAlign: "center" }}>Status</th>
                <th style={{ width: "240px" }}>Subdomain</th>
                <th style={{ width: "130px" }}>Last Checked</th>
                <th style={{ width: "110px" }}>Latency</th>
                <th style={{ width: "90px" }}>Uptime</th>
                <th style={{ width: "150px" }}>SSL Expiry</th>
                <th style={{ width: "120px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {finalFilteredSubdomains.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", color: "var(--muted-text)", padding: "30px 0" }}>
                    No subdomain monitors match query variables.
                  </td>
                </tr>
              ) : (
                displayedSubdomains.map((sub) => {
                  const isSelected = selectedRows.includes(sub.id);
                  return (
                    <React.Fragment key={sub.id}>
                      <tr className="table-row" onClick={() => setDetailModal({ isOpen: true, sub })}>
                        <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(sub.id, e)}
                          />
                        </td>
                        <td>
                          <div className="status-dot-container">
                            <span className={`status-dot ${
                              sub.status === "healthy" ? "healthy" :
                              sub.status === "degraded" ? "degraded" :
                              sub.status === "down" ? "down pulse-down-dot" : "paused"
                            }`} />
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", maxWidth: "220px", overflow: "hidden" }}>
                            <span className="mono-text" style={{ fontSize: "13px", color: "var(--primary-text)", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }} title={sub.subdomain}>{sub.subdomain}</span>
                            <span style={{ fontSize: "11px", color: "var(--muted-text)" }}>Env: {sub.env} · Poll: {sub.checkInterval}</span>
                          </div>
                        </td>
                        <td className="mono-text" style={{ fontSize: "12px", color: "var(--secondary-text)" }}>
                          {sub.lastChecked}
                        </td>
                        <td className="mono-text" style={{ fontSize: "12px", color: "var(--secondary-text)" }}>
                          {sub.status === "down" || sub.status === "paused" ? "—" : `${sub.responseTime}ms`}
                        </td>
                        <td className="mono-text" style={{ fontSize: "12px", color: "var(--secondary-text)" }}>
                          {sub.uptime}%
                        </td>
                        <td>
                          {sub.status === "paused" ? (
                            <span className="badge badge-paused">PAUSED</span>
                          ) : sub.sslExpiryDays <= 0 ? (
                            <span className="badge badge-down">EXPIRED ({Math.abs(sub.sslExpiryDays)}d ago)</span>
                          ) : sub.sslExpiryDays <= 7 ? (
                            <span className="badge badge-degraded">CRITICAL ({sub.sslExpiryDays}d)</span>
                          ) : sub.sslExpiryDays <= 30 ? (
                            <span className="badge badge-expiring">EXPIRING ({sub.sslExpiryDays}d)</span>
                          ) : (
                            <span className="badge badge-healthy">SECURE ({sub.sslExpiryDays}d)</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            <button className="btn-secondary" style={{ padding: "4px 6px" }} onClick={(e) => handleTriggerCheck(sub.id, e)} title="Test healthcheck now">
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                              </svg>
                            </button>
                            <button className="btn-secondary" style={{ padding: "4px 6px" }} onClick={(e) => handleOpenEditPanel(sub, e)} title="Edit configuration">
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button className="btn-destructive" style={{ padding: "4px 6px" }} onClick={(e) => setDeleteConfirm({ isOpen: true, id: sub.id, subdomain: sub.subdomain, isBatch: false })} title="Delete monitor">
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
              {isLoadingMore && (
                <>
                  <SkeletonRow colSpan={8} />
                  <SkeletonRow colSpan={8} />
                </>
              )}
              <InfiniteScrollTrigger
                hasMore={hasMore}
                loadMore={loadMore}
                colSpan={8}
              />
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

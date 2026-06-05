"use client";

import React from "react";
import { useCronBoy } from "@/context/CronBoyContext";
import { useInfiniteScroll, InfiniteScrollTrigger, SkeletonRow } from "@/components/common/InfiniteScroll";

export default function DomainsPage() {
  const {
    envFiltered,
    selectedRows,
    setSelectedRows,
    finalFilteredSubdomains,
    handleSelectAll,
    handleSelectRow,
    handleBatchPause,
    handleBatchDelete,
    handleTriggerCheck,
    handleOpenEditPanel,
    setDeleteConfirm,
    setDetailModal
  } = useCronBoy();

  const {
    displayedItems: displayedSubdomains,
    isLoadingMore,
    hasMore,
    loadMore
  } = useInfiniteScroll(finalFilteredSubdomains, 6, 6);

  return (
    <div className="view-container">
      <span className="view-description">
        Manage and inspect status of active subdomains, API routes, and downstream services.
      </span>

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
          </div>
        </div>
      )}

      <div className="table-container">
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
              <th>Subdomain URL / Hostname</th>
              <th>Workspace</th>
              <th>Ping Interval</th>
              <th>Uptime (7d)</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {finalFilteredSubdomains.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", color: "var(--muted-text)", padding: "40px" }}>
                  No subdomain monitors match target query parameters.
                </td>
              </tr>
            ) : (
              displayedSubdomains.map(sub => {
                const isSelected = selectedRows.includes(sub.id);
                return (
                  <tr key={sub.id} className="table-row" onClick={() => setDetailModal({ isOpen: true, sub })}>
                    <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(sub.id, e)}
                      />
                    </td>
                    <td>
                      <div className="status-dot-container">
                        <span className={`status-dot ${sub.status}`} />
                      </div>
                    </td>
                    <td className="mono-text" style={{ fontWeight: "500" }}>{sub.subdomain}</td>
                    <td>
                      <span className="mono-text" style={{ fontSize: "11px" }}>{sub.env}</span>
                    </td>
                    <td className="mono-text" style={{ fontSize: "12px" }}>{sub.checkInterval}</td>
                    <td className="mono-text" style={{ fontSize: "12px" }}>{sub.uptime}%</td>
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
                );
              })
            )}
            {isLoadingMore && (
              <>
                <SkeletonRow colSpan={7} />
                <SkeletonRow colSpan={7} />
              </>
            )}
            <InfiniteScrollTrigger
              hasMore={hasMore}
              loadMore={loadMore}
              colSpan={7}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

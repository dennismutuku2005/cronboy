"use client";

import React from "react";
import { useCronBoy } from "@/context/CronBoyContext";
import { useInfiniteScroll, InfiniteScrollTrigger, SkeletonRow } from "@/components/common/InfiniteScroll";

export default function SSLPage() {
  const {
    envFiltered,
    handleSSLRefresh,
    handleSSLRenew
  } = useCronBoy();

  const {
    displayedItems: displayedSubdomains,
    isLoadingMore,
    hasMore,
    loadMore
  } = useInfiniteScroll(envFiltered, 6, 6);

  return (
    <div className="view-container">
      <span className="view-description">
        Track SSL/TLS expiry status and trigger manual renewal processes.
      </span>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Subdomain</th>
              <th>SSL Issuer CA</th>
              <th>Auto-Renew</th>
              <th>Expiry Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedSubdomains.map(sub => (
              <tr key={sub.id}>
                <td className="mono-text" style={{ fontWeight: "500" }}>{sub.subdomain}</td>
                <td className="mono-text" style={{ fontSize: "11px", color: "var(--secondary-text)" }}>{sub.sslIssuer}</td>
                <td>
                  <span className={`badge ${sub.sslAutoRenew ? "badge-healthy" : "badge-paused"}`}>
                    {sub.sslAutoRenew ? "Enabled" : "Disabled"}
                  </span>
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
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button className="btn-secondary" style={{ padding: "4px 8px" }} onClick={() => handleSSLRefresh(sub.id)}>
                      Check Status
                    </button>
                    {sub.sslExpiryDays <= 30 && (
                      <button className="btn-primary" style={{ padding: "4px 8px" }} onClick={() => handleSSLRenew(sub.id)}>
                        Renew (ACME)
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {isLoadingMore && (
              <>
                <SkeletonRow colSpan={5} />
                <SkeletonRow colSpan={5} />
              </>
            )}
            <InfiniteScrollTrigger
              hasMore={hasMore}
              loadMore={loadMore}
              colSpan={5}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

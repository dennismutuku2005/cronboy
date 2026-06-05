"use client";

import React from "react";
import { useCronBoy } from "@/context/CronBoyContext";
import { useInfiniteScroll, InfiniteScrollTrigger, SkeletonRow } from "@/components/common/InfiniteScroll";

export default function DNSPage() {
  const { envFiltered } = useCronBoy();

  const {
    displayedItems: displayedSubdomains,
    isLoadingMore,
    hasMore,
    loadMore
  } = useInfiniteScroll(envFiltered, 4, 4);

  return (
    <div className="view-container">
      <span className="view-description">
        DNS health check resolves records against global nameservers.
      </span>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Subdomain</th>
              <th>Record Type</th>
              <th>Resolved Target</th>
              <th>TTL</th>
              <th>Nameservers Check</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {displayedSubdomains.map((sub, idx) => (
              <React.Fragment key={sub.id}>
                <tr>
                  <td className="mono-text" rowSpan="2">{sub.subdomain}</td>
                  <td className="mono-text" style={{ fontSize: "11px", color: "var(--secondary-text)" }}>A</td>
                  <td className="mono-text">142.250.190.{46 + idx}</td>
                  <td className="mono-text">3600</td>
                  <td>Google DNS / Cloudflare</td>
                  <td><span className="badge badge-healthy">RESOLVED</span></td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="mono-text" style={{ fontSize: "11px", color: "var(--secondary-text)" }}>TXT</td>
                  <td className="mono-text" style={{ fontSize: "11px" }}>"v=spf1 include:_spf.google.com ~all"</td>
                  <td className="mono-text">3600</td>
                  <td>Google DNS / Cloudflare</td>
                  <td><span className="badge badge-healthy">RESOLVED</span></td>
                </tr>
              </React.Fragment>
            ))}
            {isLoadingMore && (
              <>
                <SkeletonRow colSpan={6} />
                <SkeletonRow colSpan={6} />
              </>
            )}
            <InfiniteScrollTrigger
              hasMore={hasMore}
              loadMore={loadMore}
              colSpan={6}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

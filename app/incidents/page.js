"use client";

import React from "react";
import { useCronBoy } from "@/context/CronBoyContext";
import { useInfiniteScroll, InfiniteScrollTrigger, SkeletonRow } from "@/components/common/InfiniteScroll";

export default function IncidentsPage() {
  const { incidents } = useCronBoy();

  const {
    displayedItems: displayedIncidents,
    isLoadingMore,
    hasMore,
    loadMore
  } = useInfiniteScroll(incidents, 4, 4);

  return (
    <div className="view-container">
      <span className="view-description">
        Historical log of degraded and critical health check outages.
      </span>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Outage Domain</th>
              <th>Type</th>
              <th>Resolved Time</th>
              <th>Duration / Context</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {incidents.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "var(--muted-text)", padding: "40px" }}>
                  No logged system incidents in database.
                </td>
              </tr>
            ) : (
              displayedIncidents.map(inc => (
                <tr key={inc.id}>
                  <td className="mono-text">{inc.subdomain}</td>
                  <td>
                    <span className={`badge ${inc.type === "DOWN" ? "badge-down" : "badge-degraded"}`}>
                      {inc.type}
                    </span>
                  </td>
                  <td className="mono-text" style={{ fontSize: "12px" }}>{inc.time}</td>
                  <td style={{ fontSize: "12px", color: "var(--secondary-text)" }}>{inc.details}</td>
                  <td>
                    <span className="badge badge-healthy">RESOLVED</span>
                  </td>
                </tr>
              ))
            )}
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

"use client";

import React from "react";
import { useCronBoy } from "@/context/CronBoyContext";
import { useInfiniteScroll, InfiniteScrollTrigger, SkeletonRow } from "@/components/common/InfiniteScroll";

export default function JobsPage() {
  const {
    envFiltered,
    translateCron,
    handleTogglePause,
    setUnlinkConfirm
  } = useCronBoy();

  const cronJobs = envFiltered.filter(s => s.linkedCron);

  const {
    displayedItems: displayedJobs,
    isLoadingMore,
    hasMore,
    loadMore
  } = useInfiniteScroll(cronJobs, 6, 6);

  return (
    <div className="view-container">
      <span className="view-description">
        List of orchestrated cron schedules, linked domain triggers, and execution stats.
      </span>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Job Name</th>
              <th>Trigger Target</th>
              <th>Cron Expression</th>
              <th>Schedule</th>
              <th>Total Runs</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cronJobs.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", color: "var(--muted-text)", padding: "40px" }}>
                  No active cron jobs linked in this environment. Link a cron job by registering a subdomain.
                </td>
              </tr>
            ) : (
              displayedJobs.map(sub => (
                <tr key={sub.id}>
                  <td className="mono-text">{sub.linkedCron}</td>
                  <td>{sub.subdomain}</td>
                  <td className="mono-text" style={{ color: "var(--primary-accent)" }}>{sub.cronSchedule}</td>
                  <td style={{ fontSize: "12px", color: "var(--secondary-text)" }}>
                    {translateCron(sub.cronSchedule)}
                  </td>
                  <td className="mono-text">248 runs</td>
                  <td>
                    <span className={`badge ${sub.status === "paused" ? "badge-paused" : "badge-healthy"}`}>
                      {sub.status === "paused" ? "PAUSED" : "ACTIVE"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button className="btn-secondary" style={{ padding: "4px 8px" }} onClick={(e) => handleTogglePause(sub.id, e)}>
                        {sub.status === "paused" ? "Activate" : "Pause"}
                      </button>
                      <button className="btn-destructive" style={{ padding: "4px 8px" }} onClick={(e) => setUnlinkConfirm({ isOpen: true, id: sub.id, subdomain: sub.subdomain, cron: sub.linkedCron })}>
                        Unlink
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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

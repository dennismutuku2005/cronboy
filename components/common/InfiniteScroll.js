"use client";

import React, { useState, useEffect, useRef } from "react";

/**
 * Custom hook for simulating infinite scrolling.
 * Slices the initial item array and exposes a function to load the next chunk.
 */
export function useInfiniteScroll(items, initialCount = 6, increment = 6) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset pagination if the source list changes (e.g., when switching filters/tabs)
  useEffect(() => {
    setVisibleCount(initialCount);
  }, [items, initialCount]);

  const displayedItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const loadMore = () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);

    // Simulate network delay to let the shimmering skeletons display
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + increment, items.length));
      setIsLoadingMore(false);
    }, 700);
  };

  return {
    displayedItems,
    isLoadingMore,
    hasMore,
    loadMore,
  };
}

/**
 * Trigger component placed at the bottom of the table body.
 * Leverages IntersectionObserver to automatically invoke loadMore when it enters the viewport.
 */
export function InfiniteScrollTrigger({ hasMore, loadMore, colSpan }) {
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        root: null, // relative to the viewport
        rootMargin: "80px", // pre-fetch slightly before reaching the absolute bottom
        threshold: 0.1,
      }
    );

    const currentTrigger = triggerRef.current;
    if (currentTrigger) {
      observer.observe(currentTrigger);
    }

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }
    };
  }, [hasMore, loadMore]);

  if (!hasMore) return null;

  return (
    <tr ref={triggerRef}>
      <td colSpan={colSpan} style={{ padding: "0", border: "none" }}>
        <div style={{ height: "1px" }} />
      </td>
    </tr>
  );
}

/**
 * A table row containing shimmering skeleton placeholders.
 * Adapts to columns via the specified colSpan.
 */
export function SkeletonRow({ colSpan }) {
  return (
    <tr className="skeleton-row" style={{ pointerEvents: "none" }}>
      {Array.from({ length: colSpan }).map((_, idx) => (
        <td key={idx} style={{ padding: "12px 14px" }}>
          <div
            className="skeleton"
            style={{
              height: "14px",
              width: idx === 0 ? "50%" : idx === 1 ? "30px" : idx === 2 ? "70%" : "60px",
              opacity: 0.5 + (idx % 3) * 0.2,
            }}
          />
        </td>
      ))}
    </tr>
  );
}

"use client";

import React from "react";
import styles from "./channels.module.css";

export default function ChannelsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.channelsList}>
        <div className={styles.channelCard}>
          <div className={styles.cardLeft}>
            <div className={styles.iconWrapper}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0-5.385 3.898-9.75 9.75-9.75s9.75 4.365 9.75 9.75m0 0c0 5.385-3.898 9.75-9.75 9.75S2.25 17.385 2.25 12m19.5 0a9.75 9.75 0 11-19.5 0" />
              </svg>
            </div>
            <div className={styles.channelInfo}>
              <h3>WhatsApp API</h3>
              <span className="mono-text">Pace-Send — Primary Channel</span>
            </div>
          </div>
          <div className={styles.statusBadge}>ACTIVE</div>
        </div>
      </div>

      <div className={styles.infoBox}>
        <div className={styles.infoSection}>
          <strong>Integration</strong>
          <p>Domain health reports are sent to your WhatsApp number via the Pace-Send API.</p>
        </div>
        <div className={styles.infoSection}>
          <strong>Setup</strong>
          <p>Go to Dashboard → Send Report to set your recipient number and select which domains to monitor.</p>
        </div>
        <div className={styles.infoSection}>
          <strong>Endpoint</strong>
          <p className="mono-text" style={{ fontSize: "12px", color: "var(--secondary-text)" }}>https://whatsapp.pacewisp.co.ke/send/primary</p>
        </div>
      </div>
    </div>
  );
}

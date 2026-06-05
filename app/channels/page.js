"use client";

import React from "react";

export default function ChannelsPage() {
  return (
    <div className="view-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <span className="view-description" style={{ margin: 0 }}>
          Reporting channels for WhatsApp notifications.
        </span>
      </div>

      <div className="channels-list">
        <div className="channel-card">
          <div className="channel-info">
            <div className="channel-icon-wrapper">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0-5.385 3.898-9.75 9.75-9.75s9.75 4.365 9.75 9.75m0 0c0 5.385-3.898 9.75-9.75 9.75S2.25 17.385 2.25 12m19.5 0a9.75 9.75 0 11-19.5 0" />
              </svg>
            </div>
            <div className="channel-details">
              <span className="channel-name">WhatsApp API (Pace-Send)</span>
              <span className="channel-config mono-text">Primary reporting channel</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#0ea5e9", fontWeight: "500" }}>ACTIVE</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "32px", padding: "16px", backgroundColor: "#f3f4f6", borderRadius: "8px", fontSize: "14px", color: "#374151" }}>
        <p style={{ margin: "0 0 8px 0" }}>
          <strong>WhatsApp Integration:</strong> Domain reports are sent via WhatsApp using the Pace-Send API.
        </p>
        <p style={{ margin: "0 0 8px 0" }}>
          <strong>Configuration:</strong> Set your recipient phone number and select domains when sending reports from the dashboard.
        </p>
        <p style={{ margin: "0" }}>
          <strong>API Status:</strong> Connected to https://whatsapp.pacewisp.co.ke/send/primary
        </p>
      </div>
    </div>
  );
}

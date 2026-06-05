"use client";

import React from "react";
import { useCronBoy } from "@/context/CronBoyContext";

export default function ChannelsPage() {
  const {
    channels,
    setAddChannelModal,
    handleToggleChannel
  } = useCronBoy();

  return (
    <div className="view-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="view-description" style={{ margin: 0 }}>
          Configure downstream targets for event routing.
        </span>
        <button className="btn-primary" onClick={() => setAddChannelModal({ isOpen: true, name: "", type: "Email", config: "" })}>
          Add Channel
        </button>
      </div>

      <div className="channels-list">
        {channels.map(chan => (
          <div key={chan.id} className="channel-card">
            <div className="channel-info">
              <div className="channel-icon-wrapper">
                {chan.type === "Email" && (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                )}
                {chan.type === "Webhook" && (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                )}
                {chan.type === "SMS" && (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                )}
              </div>
              <div className="channel-details">
                <span className="channel-name">{chan.name}</span>
                <span className="channel-config mono-text">{chan.config}</span>
              </div>
            </div>

            <label className="toggle-container">
              <input
                type="checkbox"
                className="toggle-input"
                checked={chan.active}
                onChange={() => handleToggleChannel(chan.id)}
              />
              <span className="toggle-switch"></span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { useCronBoy } from "@/context/CronBoyContext";

export default function SettingsPage() {
  const {
    settingsData,
    updateSettingsState,
    triggerToast
  } = useCronBoy();

  return (
    <div className="view-container">
      <span className="view-description">
        Configure Cron Boy operational variables and API configurations.
      </span>

      <div className="settings-grid">
        <div className="settings-group">
          <div className="settings-card card-panel">
            <h3 className="settings-title">General Variables</h3>
            <div className="form-group">
              <label className="form-label">Default Monitor Site Name</label>
              <input
                type="text"
                className="form-input"
                value={settingsData.siteName}
                onChange={(e) => updateSettingsState({ ...settingsData, siteName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fail-safe Alert Routing Mailbox</label>
              <input
                type="email"
                className="form-input"
                value={settingsData.alertEmail}
                onChange={(e) => updateSettingsState({ ...settingsData, alertEmail: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
              <div>
                <label className="form-label" style={{ color: "var(--primary-text)" }}>Simulate Real-time Outages</label>
                <span style={{ fontSize: "11px", color: "var(--muted-text)", display: "block" }}>
                  Background monitoring runs mock checks and updates every 12 seconds
                </span>
              </div>
              <label className="toggle-container">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={settingsData.autoRefresh}
                  onChange={(e) => updateSettingsState({ ...settingsData, autoRefresh: e.target.checked })}
                />
                <span className="toggle-switch"></span>
              </label>
            </div>
          </div>

          <div className="settings-card card-panel">
            <h3 className="settings-title">Integration Credentials</h3>
            <div className="form-group">
              <label className="form-label">Slack Integration Inbound Webhook URL</label>
              <input
                type="password"
                className="form-input mono"
                value={settingsData.slackWebhook}
                onChange={(e) => updateSettingsState({ ...settingsData, slackWebhook: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Twilio SMS Account SID</label>
              <input
                type="password"
                className="form-input mono"
                value={settingsData.twilioSid}
                onChange={(e) => updateSettingsState({ ...settingsData, twilioSid: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-card card-panel">
            <h3 className="settings-title">Team Configuration</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="user-avatar" style={{ width: "28px", height: "28px", fontSize: "10px" }}>DM</div>
                <div>
                  <span style={{ fontSize: "12px", display: "block", color: "var(--primary-text)" }}>Dennis Mutuku</span>
                  <span style={{ fontSize: "10px", color: "var(--muted-text)" }}>Owner / Lead</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="user-avatar" style={{ width: "28px", height: "28px", fontSize: "10px" }}>AG</div>
                <div>
                  <span style={{ fontSize: "12px", display: "block", color: "var(--primary-text)" }}>Antigravity Agent</span>
                  <span style={{ fontSize: "10px", color: "var(--muted-text)" }}>Operator Agent</span>
                </div>
              </div>
              <button className="btn-secondary" style={{ width: "100%", padding: "6px", fontSize: "11px", marginTop: "8px" }} onClick={() => triggerToast("Invite Link Copied", "Share with your team to grant workspace access.", "info")}>
                Invite Member
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

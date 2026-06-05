"use client";

import React from "react";
import { useCronBoy } from "@/context/CronBoyContext";

export default function AlertsPage() {
  const {
    rules,
    setAddRuleModal,
    handleToggleRule,
    setLinkChannelModal
  } = useCronBoy();

  return (
    <div className="view-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="view-description" style={{ margin: 0 }}>
          Configure trigger threshold rules that route alerts to active notification channels.
        </span>
        <button className="btn-primary" onClick={() => setAddRuleModal({ isOpen: true, name: "", condition: "", channels: [] })}>
          Add Alert Rule
        </button>
      </div>

      <div className="alert-rules-grid">
        {rules.map(rule => (
          <div key={rule.id} className="alert-rule-card">
            <div className="alert-rule-top">
              <div>
                <h3 className="alert-rule-name">{rule.name}</h3>
                <span className="alert-rule-condition">{rule.condition}</span>
              </div>
              <label className="toggle-container alert-rule-toggle">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={rule.enabled}
                  onChange={() => handleToggleRule(rule.id)}
                />
                <span className="toggle-switch"></span>
              </label>
            </div>

            <div className="alert-channels-row">
              {rule.channels.map((chan, idx) => (
                <span key={idx} className="channel-pill">
                  <span style={{ 
                    width: "5px", 
                    height: "5px", 
                    borderRadius: "50%", 
                    backgroundColor: rule.enabled ? "var(--primary-accent)" : "var(--disabled)" 
                  }}></span>
                  {chan}
                </span>
              ))}
              <button 
                style={{ background: "transparent", border: "none", color: "var(--secondary-text)", fontSize: "10px", cursor: "pointer", textDecoration: "underline" }} 
                onClick={() => setLinkChannelModal({ isOpen: true, ruleId: rule.id, ruleName: rule.name, selectedChan: "" })}
              >
                + Link
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

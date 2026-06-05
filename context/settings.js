"use client";

import React, { createContext, useContext, useState } from "react";

const DEFAULT_SETTINGS = {
  siteName: "Cron Boy Operations",
  alertEmail: "alerts@cronboy.io",
  whatsappPhone: "+254793527494",
  slackWebhook: "",
  twilioSid: "",
  autoRefresh: true,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settingsData, setSettingsData] = useState(DEFAULT_SETTINGS);

  const updateSettingsState = (data) => setSettingsData(data);

  return (
    <SettingsContext.Provider value={{ settingsData, updateSettingsState, defaultSettings: DEFAULT_SETTINGS }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

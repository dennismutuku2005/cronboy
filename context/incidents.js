"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import * as api from '@/lib/api';

const IncidentContext = createContext(null);

export function IncidentProvider({ children }) {
  const [incidents, setIncidents] = useState([]);

  const loadIncidents = useCallback(async () => {
    const data = await api.fetchIncidents();
    if (data) setIncidents(data);
  }, []);

  return (
    <IncidentContext.Provider value={{ incidents, setIncidents, loadIncidents }}>
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidents() {
  const ctx = useContext(IncidentContext);
  if (!ctx) throw new Error("useIncidents must be used within IncidentProvider");
  return ctx;
}

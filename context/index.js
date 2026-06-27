"use client";

import React, { useEffect } from "react";
import { ToastProvider } from './toast';
import { AuthProvider, useAuth } from './auth';
import { SubdomainProvider, useSubdomains } from './subdomains';
import { IncidentProvider, useIncidents } from './incidents';
import { RuleProvider, useRules } from './rules';
import { UserProvider, useUsers } from './users';
import { SettingsProvider } from './settings';

// Combined data loader — loads all data from API once authenticated
function DataLoader({ children }) {
  const { isAuthenticated } = useAuth();
  const { loadSubdomains } = useSubdomains();
  const { loadIncidents } = useIncidents();
  const { loadRules } = useRules();
  const { loadUsers } = useUsers();

  useEffect(() => {
    if (!isAuthenticated) return;
    console.log('[CronBoy] Auth ready — loading all data from API');
    loadSubdomains();
    loadIncidents();
    loadRules();
    loadUsers();

    const intervalId = setInterval(() => {
      loadSubdomains();
      loadIncidents();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, loadSubdomains, loadIncidents, loadRules, loadUsers]);
  return <>{children}</>;
}

export function CronBoyProvider({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <SettingsProvider>
          <SubdomainProvider>
            <IncidentProvider>
              <RuleProvider>
                <UserProvider>
                  <DataLoader>
                    {children}
                  </DataLoader>
                </UserProvider>
              </RuleProvider>
            </IncidentProvider>
          </SubdomainProvider>
        </SettingsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

// Re-export all hooks
export { useToast } from './toast';
export { useAuth } from './auth';
export { useSubdomains } from './subdomains';
export { useIncidents } from './incidents';
export { useRules } from './rules';
export { useUsers } from './users';
export { useSettings } from './settings';
export { translateCron, AVAILABLE_POLICIES } from './helpers';


"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import * as api from '@/lib/api';
import { useToast } from './toast';

const RuleContext = createContext(null);

export function RuleProvider({ children }) {
  const [rules, setRules] = useState([]);
  const [addRuleModal, setAddRuleModal] = useState({ isOpen: false, name: "", condition: "" });
  const { triggerToast } = useToast();

  const loadRules = useCallback(async () => {
    const data = await api.fetchRules();
    if (data) {
      setRules(data.map(r => ({
        id: r.id,
        name: r.name,
        condition: r.rule_condition || '',
        enabled: r.enabled ?? true,
        channels: r.channels || []
      })));
    }
  }, []);

  const addRuleAction = async (e) => {
    e.preventDefault();
    const res = await api.createRule({ name: addRuleModal.name, condition: addRuleModal.condition });
    if (res?.ok) { await loadRules(); triggerToast("Rule Added", `"${addRuleModal.name}" is active.`, "success"); }
    setAddRuleModal({ isOpen: false, name: "", condition: "" });
  };

  const handleToggleRule = async (ruleId) => {
    const rule = rules.find(r => r.id === ruleId);
    const enabled = !rule?.enabled;
    const res = await api.toggleRule(ruleId, enabled);
    if (res?.ok) { await loadRules(); triggerToast(enabled ? "Enabled" : "Disabled", `"${rule?.name}" toggled.`, "info"); }
  };

  return (
    <RuleContext.Provider value={{ rules, setRules, loadRules, addRuleModal, setAddRuleModal, addRuleAction, handleToggleRule }}>
      {children}
    </RuleContext.Provider>
  );
}

export function useRules() {
  const ctx = useContext(RuleContext);
  if (!ctx) throw new Error("useRules must be used within RuleProvider");
  return ctx;
}

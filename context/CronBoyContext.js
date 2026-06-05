"use client";

// Backward compatibility re-export — delegates to the new split modules
import { useAuth } from './auth';
import { useSubdomains } from './subdomains';
import { useIncidents } from './incidents';
import { useRules } from './rules';
import { useUsers } from './users';
import { useToast } from './toast';
import { useSettings } from './settings';
import { translateCron, AVAILABLE_POLICIES } from './helpers';

export function useCronBoy() {
  const auth = useAuth();
  const sub = useSubdomains();
  const inc = useIncidents();
  const rls = useRules();
  const usr = useUsers();
  const toast = useToast();
  const sett = useSettings();

  return {
    // --- Auth ---
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    currentUser: auth.currentUser,
    loginUser: auth.loginUser,
    handleSignOut: auth.handleSignOut,
    isSuperAdmin: auth.isSuperAdmin,

    // --- Toast ---
    toasts: toast.toasts,
    triggerToast: toast.triggerToast,

    // --- Subdomains ---
    subdomains: sub.subdomains,
    setSubdomains: sub.setSubdomains,
    loadSubdomains: sub.loadSubdomains,
    activeEnv: sub.activeEnv,
    setActiveEnv: sub.setActiveEnv,
    activeTab: sub.activeTab,
    setActiveTab: sub.setActiveTab,
    searchQuery: sub.searchQuery,
    setSearchQuery: sub.setSearchQuery,
    selectedRows: sub.selectedRows,
    setSelectedRows: sub.setSelectedRows,
    isPanelOpen: sub.isPanelOpen,
    setIsPanelOpen: sub.setIsPanelOpen,
    panelMode: sub.panelMode,
    panelData: sub.panelData,
    setPanelData: sub.setPanelData,
    deleteConfirm: sub.deleteConfirm,
    setDeleteConfirm: sub.setDeleteConfirm,
    unlinkConfirm: sub.unlinkConfirm,
    setUnlinkConfirm: sub.setUnlinkConfirm,
    detailModal: sub.detailModal,
    setDetailModal: sub.setDetailModal,
    sendReportModal: sub.sendReportModal,
    setSendReportModal: sub.setSendReportModal,
    envFiltered: sub.envFiltered,
    tabFiltered: sub.tabFiltered,
    finalFilteredSubdomains: sub.finalFilteredSubdomains,
    stats: sub.stats,
    donutPercentages: sub.donutPercentages,
    cronActivityStats: sub.cronActivityStats,
    handleSelectRow: sub.handleSelectRow,
    handleSelectAll: sub.handleSelectAll,
    handleTriggerCheck: sub.handleTriggerCheck,
    handleTogglePause: sub.handleTogglePause,
    confirmDeleteAction: sub.confirmDeleteAction,
    confirmUnlinkAction: sub.confirmUnlinkAction,
    handleOpenAddPanel: sub.handleOpenAddPanel,
    handleOpenEditPanel: sub.handleOpenEditPanel,
    handlePanelSubmit: sub.handlePanelSubmit,
    handleBatchDelete: sub.handleBatchDelete,
    handleBatchPause: sub.handleBatchPause,
    handleSSLRefresh: sub.handleSSLRefresh,
    handleSSLRenew: sub.handleSSLRenew,
    sendWhatsAppReport: sub.sendWhatsAppReport,
    sendWhatsAppReportPrompt: sub.sendWhatsAppReportPrompt,
    handleSendWhatsAppReport: sub.handleSendWhatsAppReport,

    // --- Incidents ---
    incidents: inc.incidents,
    setIncidents: inc.setIncidents,

    // --- Rules ---
    rules: rls.rules,
    setRules: rls.setRules,
    addRuleModal: rls.addRuleModal,
    setAddRuleModal: rls.setAddRuleModal,
    addRuleAction: rls.addRuleAction,
    handleToggleRule: rls.handleToggleRule,

    // --- Users ---
    users: usr.users,
    setUsers: usr.setUsers,
    createUser: usr.createUser,
    deleteUser: usr.deleteUser,
    updateUser: usr.updateUser,

    // --- Settings ---
    settingsData: sett.settingsData,
    updateSettingsState: sett.updateSettingsState,
    themeMsg: '',
    handleThemeClick: () => {},
    handleLogoError: (e) => { e.target.src = '/cron.png'; },

    // Const exports
    translateCron,
    AVAILABLE_POLICIES,
  };
}

import React from "react";

export default function DialogModals({
  deleteConfirm,
  setDeleteConfirm,
  confirmDeleteAction,
  unlinkConfirm,
  setUnlinkConfirm,
  confirmUnlinkAction,
  addRuleModal,
  setAddRuleModal,
  addRuleAction,
  sendReportModal,
  setSendReportModal,
  handleSendWhatsAppReport
}) {
  return (
    <>
      {/* 1. Delete Confirm Modal */}
      {deleteConfirm.isOpen && (
        <div className="dialog-backdrop" onClick={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="dialog-title">
              Delete {deleteConfirm.isBatch ? "Batch Monitors" : "Subdomain Monitor"}
            </h3>
            <p className="dialog-body">
              Are you sure you want to delete the monitoring for <strong>{deleteConfirm.subdomain}</strong>? This action cannot be undone.
            </p>
            <div className="dialog-footer">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}>
                Cancel
              </button>
              <button className="btn-destructive" onClick={confirmDeleteAction}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Unlink Confirm Modal */}
      {unlinkConfirm.isOpen && (
        <div className="dialog-backdrop" onClick={() => setUnlinkConfirm(prev => ({ ...prev, isOpen: false }))}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="dialog-title">Unlink Cron Orchestration</h3>
            <p className="dialog-body">
              Are you sure you want to unlink the cron schedule <strong>{unlinkConfirm.cron}</strong> from service <strong>{unlinkConfirm.subdomain}</strong>?
            </p>
            <div className="dialog-footer">
              <button className="btn-secondary" onClick={() => setUnlinkConfirm(prev => ({ ...prev, isOpen: false }))}>
                Cancel
              </button>
              <button className="btn-primary" onClick={confirmUnlinkAction}>
                Confirm Unlink
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Add Alert Rule Modal */}
      {addRuleModal.isOpen && (
        <div className="dialog-backdrop" onClick={() => setAddRuleModal(prev => ({ ...prev, isOpen: false }))}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="dialog-title">Add Alert Routing Rule</h3>
            <form onSubmit={addRuleAction} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Rule Identifier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SSL Expiry Warnings"
                  className="form-input"
                  value={addRuleModal.name}
                  onChange={(e) => setAddRuleModal(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Outage Metric Trigger Condition</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Uptime falls below 99.5%"
                  className="form-input"
                  value={addRuleModal.condition}
                  onChange={(e) => setAddRuleModal(prev => ({ ...prev, condition: e.target.value }))}
                />
              </div>
              <div className="dialog-footer" style={{ padding: 0 }}>
                <button type="button" className="btn-secondary" onClick={() => setAddRuleModal(prev => ({ ...prev, isOpen: false }))}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Send WhatsApp Report Modal */}
      {sendReportModal.isOpen && (
        <div className="dialog-backdrop" onClick={() => setSendReportModal(prev => ({ ...prev, isOpen: false }))}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="dialog-title">Send WhatsApp Report</h3>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendWhatsAppReport(sendReportModal.phone, sendReportModal.reportType);
                setSendReportModal(prev => ({ ...prev, isOpen: false, phone: '', reportType: 'detailed' }));
              }} 
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div className="form-group">
                <label className="form-label">Recipient Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+254712345678"
                  className="form-input"
                  value={sendReportModal.phone}
                  onChange={(e) => setSendReportModal(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Report Type</label>
                <select 
                  className="form-input"
                  value={sendReportModal.reportType}
                  onChange={(e) => setSendReportModal(prev => ({ ...prev, reportType: e.target.value }))}
                >
                  <option value="summary">Summary (Total, Healthy, Degraded, Down)</option>
                  <option value="detailed">Detailed (Full status for each domain)</option>
                  <option value="critical">Critical Only (Problems and expiring certs)</option>
                </select>
              </div>
              <p style={{ fontSize: "12px", color: "var(--secondary-text)", margin: "0" }}>
                Sending report for {sendReportModal.domainCount} selected domain{sendReportModal.domainCount !== 1 ? 's' : ''}
              </p>
              <div className="dialog-footer" style={{ padding: 0 }}>
                <button type="button" className="btn-secondary" onClick={() => setSendReportModal(prev => ({ ...prev, isOpen: false }))}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Send Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

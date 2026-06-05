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
  addChannelModal,
  setAddChannelModal,
  addChannelAction,
  linkChannelModal,
  setLinkChannelModal,
  linkChannelSubmit,
  channels
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
              <div className="form-group">
                <label className="form-label">Linked Channels</label>
                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  {["Email", "Webhook", "SMS"].map((ch) => {
                    const hasCh = addRuleModal.channels.includes(ch);
                    return (
                      <label key={ch} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={hasCh}
                          style={{ accentColor: "var(--primary-accent)" }}
                          onChange={() => {
                            const newChans = hasCh 
                              ? addRuleModal.channels.filter(c => c !== ch)
                              : [...addRuleModal.channels, ch];
                            setAddRuleModal(prev => ({ ...prev, channels: newChans }));
                          }}
                        />
                        {ch}
                      </label>
                    );
                  })}
                </div>
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

      {/* 4. Add Channel Modal */}
      {addChannelModal.isOpen && (
        <div className="dialog-backdrop" onClick={() => setAddChannelModal(prev => ({ ...prev, isOpen: false }))}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="dialog-title">Add Integration Routing Channel</h3>
            <form onSubmit={addChannelAction} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Integration Channel Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operations Slack Group"
                  className="form-input"
                  value={addChannelModal.name}
                  onChange={(e) => setAddChannelModal(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Downstream System Type</label>
                <select
                  className="form-input"
                  value={addChannelModal.type}
                  onChange={(e) => setAddChannelModal(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="Email">SMTP Mail Servers</option>
                  <option value="Webhook">HTTP Inbound Webhook</option>
                  <option value="SMS">Twilio SMS Trunk</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Endpoint Address Details</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mailto:alerts@site.com or webhook URL"
                  className="form-input"
                  value={addChannelModal.config}
                  onChange={(e) => setAddChannelModal(prev => ({ ...prev, config: e.target.value }))}
                />
              </div>
              <div className="dialog-footer" style={{ padding: 0 }}>
                <button type="button" className="btn-secondary" onClick={() => setAddChannelModal(prev => ({ ...prev, isOpen: false }))}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Link Channel Modal */}
      {linkChannelModal.isOpen && (
        <div className="dialog-backdrop" onClick={() => setLinkChannelModal(prev => ({ ...prev, isOpen: false }))}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="dialog-title">Link Channel to {linkChannelModal.ruleName}</h3>
            <form onSubmit={linkChannelSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Select Active Channel</label>
                <select
                  className="form-input"
                  required
                  value={linkChannelModal.selectedChan}
                  onChange={(e) => setLinkChannelModal(prev => ({ ...prev, selectedChan: e.target.value }))}
                >
                  <option value="">-- Choose Channel --</option>
                  {channels.map((chan) => (
                    <option key={chan.id} value={chan.name}>
                      {chan.name} ({chan.type})
                    </option>
                  ))}
                </select>
              </div>
              <div className="dialog-footer" style={{ padding: 0 }}>
                <button type="button" className="btn-secondary" onClick={() => setLinkChannelModal(prev => ({ ...prev, isOpen: false }))}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Link Integration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

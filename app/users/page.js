"use client";

import React, { useMemo, useState } from "react";
import { useCronBoy } from "@/context/CronBoyContext";

const POLICY_OPTIONS = [
  "Manage users",
  "Manage monitors",
  "View dashboards",
  "Create jobs",
  "Edit alerts"
];

const ROLE_DEFAULT_POLICIES = {
  Superadmin: [...POLICY_OPTIONS],
  Admin: ["Manage monitors", "View dashboards", "Create jobs", "Edit alerts"],
  Viewer: ["View dashboards"]
};

export default function UsersPage() {
  const {
    currentUser,
    users,
    createUser,
    deleteUser,
    isSuperAdmin,
    triggerToast
  } = useCronBoy();

  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "Admin",
    policies: ROLE_DEFAULT_POLICIES.Admin
  });

  const visibleUsers = useMemo(() => users || [], [users]);

  const openCreate = () => {
    setError("");
    setCreateOpen(true);
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setError("");
  };

  const resetForm = () => {
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "Admin",
      policies: ROLE_DEFAULT_POLICIES.Admin
    });
  };

  const handleRoleChange = (value) => {
    setNewUser((prev) => ({
      ...prev,
      role: value,
      policies: ROLE_DEFAULT_POLICIES[value] || []
    }));
  };

  const handlePolicyToggle = (policy) => {
    if (newUser.role === "Superadmin") return;
    setNewUser((prev) => {
      const hasPolicy = prev.policies.includes(policy);
      return {
        ...prev,
        policies: hasPolicy
          ? prev.policies.filter((item) => item !== policy)
          : [...prev.policies, policy]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      setError("Name, email and password are required.");
      return;
    }

    if (visibleUsers.some((user) => user.email.toLowerCase() === newUser.email.toLowerCase())) {
      setError("A user with that email already exists.");
      return;
    }

    setSaving(true);
    setTimeout(() => {
      const nextUser = {
        id: `user-${Date.now()}`,
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        password: newUser.password,
        role: newUser.role,
        policies: newUser.policies
      };

      createUser(nextUser);
      triggerToast("User created", `${nextUser.name} has been added.`, "success");
      resetForm();
      setSaving(false);
      setCreateOpen(false);
    }, 500);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.role === 'Superadmin') {
      triggerToast("Protected account", "Superadmin accounts cannot be deleted.", "error");
      setDeleteTarget(null);
      return;
    }
    if (currentUser?.id === deleteTarget.id) {
      triggerToast("Cannot remove self", "You cannot delete your own account.", "error");
      setDeleteTarget(null);
      return;
    }
    deleteUser(deleteTarget.id);
    triggerToast("User removed", `${deleteTarget.name} was deleted.`, "success");
    setDeleteTarget(null);
  };

  if (!isSuperAdmin) {
    return (
      <div className="view-container">
        <span className="view-description">
          Only the primary superadmin can manage users and permissions.
        </span>
        <div className="card-panel" style={{ padding: "24px", minHeight: "220px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", color: "var(--primary-text)" }}>Access denied</h3>
          <p style={{ marginTop: "8px", color: "var(--secondary-text)", fontSize: "13px" }}>
            You do not have permission to view this section. Please log in with a superadmin account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="page-action-bar">
        <div>
          <h2 style={{ margin: 0, fontSize: "20px" }}>User Management</h2>
          <p className="view-description" style={{ marginTop: "10px" }}>
            Manage users, assign roles and grant policy access for your team.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate} style={{ whiteSpace: "nowrap" }}>
          Create user
        </button>
      </div>

      <div className="card-panel" style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "18px", flexWrap: "wrap" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px" }}>Team accounts</h3>
            <p style={{ margin: "8px 0 0", color: "var(--secondary-text)", fontSize: "13px", maxWidth: "540px" }}>
              Superadmin can create, edit and remove users, and apply access policies at a team level.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ color: "var(--muted-text)", fontSize: "12px", padding: "10px 14px", background: "var(--hover-background)", borderRadius: "12px" }}>
              {visibleUsers.length} accounts
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Policies</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td><span className="user-role-badge">{user.role}</span></td>
                  <td>{user.policies.join(", ")}</td>
                  <td>
                    {user.role !== 'Superadmin' && (
                      <button
                        className="btn-secondary"
                        style={{ padding: "6px 10px", fontSize: "12px" }}
                        onClick={() => setDeleteTarget(user)}
                      >
                        Delete
                      </button>
                    )}
                    {user.role === 'Superadmin' && (
                      <span style={{ fontSize: "11px", color: "var(--muted-text)", fontStyle: "italic" }}>Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {createOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "18px" }}>Create user</h3>
                <p style={{ margin: "8px 0 0", color: "var(--secondary-text)", fontSize: "13px" }}>
                  Add a new team member and assign access policies.
                </p>
              </div>
              <button className="modal-close" onClick={closeCreate} aria-label="Close modal">×</button>
            </div>

            {error && (
              <div style={{ background: "rgba(239, 68, 68, 0.08)", color: "var(--error-red-text)", borderRadius: "12px", padding: "12px 14px", border: "1px solid rgba(239, 68, 68, 0.18)", marginBottom: "16px" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-input" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Jane Doe" />
              </div>
              <div className="form-group">
                <label className="form-label">Email / username</label>
                <input className="form-input" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="jane@cronboy.io" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-input" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={newUser.role} onChange={(e) => handleRoleChange(e.target.value)}>
                  <option value="Superadmin">Superadmin</option>
                  <option value="Admin">Admin</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Policies</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {POLICY_OPTIONS.map((policy) => {
                    const selected = newUser.role === "Superadmin" || newUser.policies.includes(policy);
                    return (
                      <button
                        key={policy}
                        type="button"
                        className={`policy-pill ${selected ? "selected" : ""}`}
                        onClick={() => handlePolicyToggle(policy)}
                        disabled={newUser.role === "Superadmin"}
                      >
                        {policy}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                <button className="btn-secondary" type="button" onClick={closeCreate} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button className="btn-primary" type="submit" style={{ flex: 1 }} disabled={saving}>
                  {saving ? <span className="button-spinner" aria-label="Saving user"></span> : "Save user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "420px" }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "18px" }}>Confirm removal</h3>
                <p style={{ margin: "8px 0 0", color: "var(--secondary-text)", fontSize: "13px" }}>
                  Delete {deleteTarget.name}&apos;s account? This action cannot be undone.
                </p>
              </div>
              <button className="modal-close" onClick={() => setDeleteTarget(null)} aria-label="Close modal">×</button>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="btn-destructive" style={{ flex: 1 }} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

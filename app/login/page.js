"use client";

import React, { useState } from "react";
import { useCronBoy } from "@/context/CronBoyContext";

export default function Login() {
  const { loginUser } = useCronBoy();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser(username, password);
      if (result.success) {
        if (typeof window !== "undefined") {
          window.location.href = "/dashboard";
        }
      } else {
        setError(result.message || "Invalid credentials.");
        setLoading(false);
      }
    } catch (err) {
      setError("Login failed. Is the database running?");
      setLoading(false);
    }
  };

  const handleLogoError = (e) => {
    e.target.src = "/cron.png";
  };

  return (
    <div className="login-container">
      {/* Left Column: Form */}
      <div className="login-left">
        <div className="login-form-box">
          <div className="login-logo-box">
            <img
              src="/logo.png"
              alt="Cron Boy"
              onError={handleLogoError}
              className="logo-image"
              style={{ height: "52px", width: "auto", marginBottom: "4px" }}
            />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ textAlign: "center", marginBottom: "8px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "500", color: "var(--primary-text)", marginBottom: "4px" }}>
                Sign in to your workspace
              </h2>
              <p style={{ fontSize: "12px", color: "var(--secondary-text)" }}>
                Monitor infrastructure. Orchestrate cron jobs.
              </p>
            </div>

            {error && (
              <div style={{
                background: "var(--error-red-bg)",
                color: "var(--error-red-text)",
                fontSize: "12px",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid rgba(239, 68, 68, 0.15)"
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                disabled={loading}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
                autoComplete="current-password"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "2px 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--secondary-text)", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked style={{ accentColor: "var(--primary-accent)" }} />
                Keep me signed in
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); }} style={{ fontSize: "11px", color: "var(--primary-accent)", textDecoration: "none" }}>
                Forgot password?
              </a>
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "11px", marginTop: "4px", display: "inline-flex", justifyContent: "center", alignItems: "center" }} disabled={loading}>
              {loading ? (
                <span className="button-spinner" aria-label="Signing in"></span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <footer style={{ marginTop: "28px", textAlign: "center" }}>
            <p style={{ fontSize: "11px", color: "var(--muted-text)" }}>
              Cron Boy — quiet infrastructure, sharp visibility.
            </p>
          </footer>
        </div>
      </div>

      {/* Right Column: Graphic Hero */}
      <div className="login-right">
        <img
          src="/sideimage.png"
          alt="Cron Boy Operations"
          className="login-side-img"
        />
      </div>
    </div>
  );
}

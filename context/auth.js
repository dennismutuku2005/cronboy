"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import * as api from '@/lib/api';
import { useToast } from './toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { triggerToast } = useToast();

  // --- INIT ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("cb_token");
      const storedUser = localStorage.getItem("cb_user");

      if (storedToken && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setSessionToken(storedToken);
          setIsAuthenticated(true);
          setIsLoading(false);
        } catch {
          localStorage.removeItem("cb_token");
          localStorage.removeItem("cb_user");
          setIsLoading(false);
        }
      } else {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        } else {
          setIsLoading(false);
        }
      }
    }
  }, []);

  const loginUser = async (username, password) => {
    try {
      const res = await api.login(username, password);
      if (res?.ok && res?.user) {
        localStorage.setItem("cb_token", res.sessionToken);
        localStorage.setItem("cb_user", JSON.stringify(res.user));
        setSessionToken(res.sessionToken);
        setCurrentUser(res.user);
        setIsAuthenticated(true);
        return { success: true, user: res.user };
      }
      return { success: false, message: res?.error || "Invalid username or password" };
    } catch (err) {
      return { success: false, message: err.message || "Login failed" };
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("cb_token");
    localStorage.removeItem("cb_user");
    setCurrentUser(null);
    setSessionToken(null);
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  const isSuperAdmin = currentUser?.role === "Superadmin";

  return (
    <AuthContext.Provider value={{
      currentUser, sessionToken, isAuthenticated, isLoading,
      loginUser, handleSignOut, isSuperAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

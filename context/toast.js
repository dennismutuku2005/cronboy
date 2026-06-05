"use client";

import React, { createContext, useContext, useState } from "react";
import { toast as sonnerToast } from "sonner";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const triggerToast = (title, message, type = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);

    // Also fire a Sonner toast
    const content = message ? `${title}: ${message}` : title;
    switch (type) {
      case "success":
        sonnerToast.success(title, { description: message });
        break;
      case "error":
        sonnerToast.error(title, { description: message });
        break;
      case "warning":
        sonnerToast.warning(title, { description: message });
        break;
      case "info":
        sonnerToast.info(title, { description: message });
        break;
      default:
        sonnerToast(title, { description: message });
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, triggerToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

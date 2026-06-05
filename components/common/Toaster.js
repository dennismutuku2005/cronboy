import React from "react";

export default function Toaster({ toasts }) {
  return (
    <div className="toaster-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <div className="toast-icon-wrapper">
            {toast.type === "success" && (
              <svg width="14" height="14" fill="none" stroke="#22C55E" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
            {toast.type === "error" && (
              <svg width="14" height="14" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            )}
            {toast.type === "warning" && (
              <svg width="14" height="14" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {toast.type === "info" && (
              <svg width="14" height="14" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.083.985l-.5 1.5a.75.75 0 00.941.941l1.5-.5a.75.75 0 11.583 1.384l-1.5.5a2.25 2.25 0 01-2.83-2.83l.5-1.5zM12 7.5h.008v.008H12V7.5z" />
              </svg>
            )}
          </div>
          <div className="toast-content">
            <span className="toast-title">{toast.title}</span>
            <span className="toast-msg">{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

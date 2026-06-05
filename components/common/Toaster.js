import { Toaster as SonnerToaster } from "sonner";
export default function Toaster({ toasts }) {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#FFFFFF",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "13px",
          color: "var(--primary-text)",
          padding: "12px 16px",
        },
        className: "sonner-toast",
      }}
      richColors
      closeButton
    />
  );
}


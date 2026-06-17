"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastStyles: Record<ToastType, React.CSSProperties> = {
  success: {
    backgroundColor: "var(--success-bg)",
    color: "var(--success-text)",
    border: "0.5px solid var(--success-border)",
  },
  error: {
    backgroundColor: "var(--danger-bg)",
    color: "var(--danger-text)",
    border: "0.5px solid var(--danger-border)",
  },
  info: {
    backgroundColor: "var(--bg-raised)",
    color: "var(--text-primary)",
    border: "0.5px solid var(--border)",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 14px",
              borderRadius: 8,
              minWidth: 280,
              maxWidth: 380,
              ...toastStyles[t.type],
            }}
          >
            {t.type === "success" && <CheckCircle size={16} style={{ flexShrink: 0 }} />}
            {t.type === "error" && <XCircle size={16} style={{ flexShrink: 0 }} />}
            {t.type === "info" && <Info size={16} style={{ flexShrink: 0, color: "var(--accent-text)" }} />}

            <span style={{ fontSize: "0.8125rem", fontWeight: 400, flex: 1 }}>{t.message}</span>

            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
                opacity: 0.5,
                color: "inherit",
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.5"; }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

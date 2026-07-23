import React, { createContext, useContext, useState, useEffect } from "react";
import { AlertCircle, CheckCircle, HelpCircle, X, Info, AlertTriangle } from "lucide-react";

interface DialogOptions {
  title?: string;
  message: string;
  type?: "alert" | "confirm" | "success" | "error" | "danger";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ToastOptions {
  id: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
}

interface DialogContextType {
  showAlert: (message: string, title?: string, type?: "alert" | "success" | "error") => void;
  showConfirm: (
    message: string,
    onConfirm: () => void,
    title?: string,
    options?: { type?: "confirm" | "danger"; confirmText?: string; cancelText?: string }
  ) => void;
  showToast: (message: string, type?: "success" | "warning" | "error" | "info") => void;
  confirm: (options: {
    message: string;
    onConfirm: () => void;
    title?: string;
    type?: "confirm" | "danger";
    confirmText?: string;
    cancelText?: string;
  }) => void;
  toast: (type: "success" | "warning" | "error" | "info", message: string) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions | null>(null);
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const showAlert = (message: string, title: string = "Informasi", type: "alert" | "success" | "error" = "success") => {
    setOptions({ title, message, type });
    setIsOpen(true);
  };

  const showConfirm = (
    message: string,
    onConfirm: () => void,
    title: string = "Konfirmasi",
    confirmOptions?: { type?: "confirm" | "danger"; confirmText?: string; cancelText?: string }
  ) => {
    setOptions({
      title,
      message,
      type: confirmOptions?.type || "confirm",
      confirmText: confirmOptions?.confirmText || "Setuju",
      cancelText: confirmOptions?.cancelText || "Batal",
      onConfirm: () => {
        setIsOpen(false);
        onConfirm();
      }
    });
    setIsOpen(true);
  };

  const showToast = (message: string, type: "success" | "warning" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const confirm = (opts: {
    message: string;
    onConfirm: () => void;
    title?: string;
    type?: "confirm" | "danger";
    confirmText?: string;
    cancelText?: string;
  }) => {
    showConfirm(opts.message, opts.onConfirm, opts.title, {
      type: opts.type,
      confirmText: opts.confirmText,
      cancelText: opts.cancelText,
    });
  };

  const toast = (type: "success" | "warning" | "error" | "info" = "success", message: string = "") => {
    showToast(message, type);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (options?.onCancel) {
      options.onCancel();
    }
  };

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm, showToast, confirm, toast }}>
      {children}

      {/* Toast Notification Container */}
      <div style={{
        position: "fixed", top: 20, right: 20, zIndex: 999999,
        display: "flex", flexDirection: "column", gap: 10,
        pointerEvents: "none"
      }}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} setToasts={setToasts} />
        ))}
      </div>

      {/* Confirmation/Alert Modal */}
      {isOpen && options && (
        <div 
          onClick={handleClose}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 999998,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-in"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 24,
              maxWidth: 380,
              width: "100%",
              boxShadow: "var(--shadow-lg)",
              position: "relative",
              textAlign: "center",
            }}
          >
            {/* Top Icon */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              {options.type === "success" && (
                <div style={{ borderRadius: "50%", background: "var(--green-subtle)", color: "var(--green)", border: "1px solid rgba(22, 163, 74, 0.2)", display: "flex", padding: 12 }}>
                  <CheckCircle size={28} />
                </div>
              )}
              {options.type === "error" && (
                <div style={{ borderRadius: "50%", background: "var(--red-subtle)", color: "var(--red)", border: "1px solid rgba(220, 38, 38, 0.2)", display: "flex", padding: 12 }}>
                  <AlertCircle size={28} />
                </div>
              )}
              {options.type === "alert" && (
                <div style={{ borderRadius: "50%", background: "var(--blue-subtle)", color: "var(--blue)", border: "1px solid rgba(37, 99, 235, 0.2)", display: "flex", padding: 12 }}>
                  <Info size={28} />
                </div>
              )}
              {(options.type === "confirm" || options.type === "danger") && (
                <div style={{ 
                  borderRadius: "50%", 
                  background: options.type === "danger" ? "var(--red-subtle)" : "var(--orange-subtle)", 
                  color: options.type === "danger" ? "var(--red)" : "var(--orange)", 
                  border: `1px solid ${options.type === "danger" ? "rgba(220, 38, 38, 0.2)" : "rgba(234, 88, 12, 0.2)"}`, 
                  display: "flex", padding: 12 
                }}>
                  {options.type === "danger" ? <AlertTriangle size={28} /> : <HelpCircle size={28} />}
                </div>
              )}
            </div>

            {/* Title & Description */}
            <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>
              {options.title}
            </h4>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 20px" }}>
              {options.message}
            </p>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {(options.type === "confirm" || options.type === "danger") ? (
                <>
                  <button 
                    onClick={handleClose}
                    style={{
                      flex: 1, padding: "8px 16px", borderRadius: 8,
                      border: "1px solid var(--border)", background: "transparent",
                      color: "var(--text-secondary)", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-subtle)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    {options.cancelText}
                  </button>
                  <button 
                    onClick={() => {
                      if (options.onConfirm) options.onConfirm();
                    }}
                    style={{
                      flex: 1, padding: "8px 16px", borderRadius: 8,
                      border: "none", 
                      background: options.type === "danger" ? "var(--red)" : "var(--brand)", 
                      color: "#fff", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                  >
                    {options.confirmText}
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleClose}
                  style={{
                    padding: "8px 24px", borderRadius: 8,
                    border: "none", background: "var(--brand)",
                    color: "#fff", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

function ToastItem({ toast, setToasts }: { toast: ToastOptions; setToasts: React.Dispatch<React.SetStateAction<ToastOptions[]>> }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, setToasts]);

  const getToastColors = () => {
    switch (toast.type) {
      case "success":
        return { bg: "var(--green-subtle)", text: "var(--green)", border: "rgba(22, 163, 74, 0.2)" };
      case "warning":
        return { bg: "var(--orange-subtle)", text: "var(--orange)", border: "rgba(234, 88, 12, 0.2)" };
      case "error":
        return { bg: "var(--red-subtle)", text: "var(--red)", border: "rgba(220, 38, 38, 0.2)" };
      case "info":
      default:
        return { bg: "var(--blue-subtle)", text: "var(--blue)", border: "rgba(37, 99, 235, 0.2)" };
    }
  };

  const colors = getToastColors();

  return (
    <div 
      className="animate-toast-in"
      style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "var(--surface)",
        border: `1px solid var(--border)`,
        borderLeft: `4px solid ${colors.text}`,
        borderRadius: 8,
        padding: "10px 16px",
        boxShadow: "var(--shadow-md)",
        pointerEvents: "auto",
        minWidth: 260,
        maxWidth: 340,
      }}
    >
      <div style={{ color: colors.text, display: "flex", flexShrink: 0 }}>
        {toast.type === "success" && <CheckCircle size={16} />}
        {toast.type === "warning" && <AlertTriangle size={16} />}
        {toast.type === "error" && <AlertCircle size={16} />}
        {toast.type === "info" && <Info size={16} />}
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-primary)", flex: 1 }}>
        {toast.message}
      </span>
      <button 
        onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
        style={{
          background: "transparent", border: "none", cursor: "pointer",
          color: "var(--text-tertiary)", display: "flex", padding: 2
        }}
      >
        <X size={12} />
      </button>
    </div>
  );
}

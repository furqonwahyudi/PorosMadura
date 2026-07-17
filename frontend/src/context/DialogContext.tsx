import React, { createContext, useContext, useState } from "react";
import { AlertCircle, CheckCircle, HelpCircle } from "lucide-react";

interface DialogOptions {
  title?: string;
  message: string;
  type?: "alert" | "confirm" | "success" | "error";
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface DialogContextType {
  showAlert: (message: string, title?: string, type?: "alert" | "success" | "error") => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
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

  const showAlert = (message: string, title: string = "Informasi", type: "alert" | "success" | "error" = "success") => {
    setOptions({ title, message, type });
    setIsOpen(true);
  };

  const showConfirm = (message: string, onConfirm: () => void, title: string = "Konfirmasi") => {
    setOptions({
      title,
      message,
      type: "confirm",
      onConfirm: () => {
        setIsOpen(false);
        onConfirm();
      }
    });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (options?.onCancel) {
      options.onCancel();
    }
  };

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-[999999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative animate-scale-up text-center">
            <div className="flex justify-center mb-4">
              {options.type === "success" && (
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                  <CheckCircle size={28} />
                </div>
              )}
              {options.type === "error" && (
                <div className="p-3 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
                  <AlertCircle size={28} />
                </div>
              )}
              {options.type === "alert" && (
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20">
                  <AlertCircle size={28} />
                </div>
              )}
              {options.type === "confirm" && (
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
                  <HelpCircle size={28} />
                </div>
              )}
            </div>
            
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-sans">{options.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-6 font-sans">{options.message}</p>

            <div className="flex gap-3 justify-center">
              {options.type === "confirm" ? (
                <>
                  <button 
                    onClick={handleClose}
                    className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => {
                      if (options.onConfirm) options.onConfirm();
                    }}
                    className="px-5 py-2 bg-[#D71920] hover:bg-[#D71920]/90 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Setuju
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleClose}
                  className="px-6 py-2 bg-[#D71920] hover:bg-[#D71920]/90 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
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

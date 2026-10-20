"use client";

import React, { createContext, useContext, useState } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
        <ToastContext.Provider value={{ showToast }}>
          {children}

          {/* Toast Notification HUD */}
          <div className="pointer-events-none fixed bottom-6 left-4 right-4 z-[100] flex max-w-[380px] flex-col gap-3 sm:left-auto sm:right-6">
            {toasts.map((toast) => {
              const accent =
                toast.type === "success"
                  ? { icon: "check_circle", tone: "bg-success-container text-success", bar: "bg-success" }
                  : toast.type === "error"
                  ? { icon: "error", tone: "bg-error-container text-error", bar: "bg-error" }
                  : { icon: "info", tone: "bg-info-container text-info", bar: "bg-info" };

              return (
                <div
                  key={toast.id}
                  className="relative overflow-hidden flex items-start gap-3 p-4 pl-5 rounded-xl glass-panel animate-slide-up pointer-events-auto"
                >
                  <span className={`absolute inset-y-0 left-0 w-1 ${accent.bar}`} />
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${accent.tone}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{accent.icon}</span>
                  </span>
                  <p className="text-sm font-medium text-on-surface leading-snug pt-1.5">
                    {toast.message}
                  </p>
                </div>
              );
            })}
          </div>
        </ToastContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

import React from "react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children
}: DrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-scrim backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex sm:pl-10">
        <div className="w-screen max-w-xl glass-panel-strong border-l border-border flex flex-col animate-slide-left">
          <div className="px-6 py-5 border-b border-border bg-[#FFF8FB] flex items-start justify-between gap-4 flex-shrink-0">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-on-surface font-display tracking-tight truncate">
                {title}
              </h3>
              {subtitle ? (
                <p className="text-xs text-on-surface-muted mt-1 truncate">{subtitle}</p>
              ) : null}
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="flex-shrink-0 w-9 h-9 rounded-lg border border-border bg-[#FFF8FB]/80 text-on-surface-variant
                         hover:bg-[#FFF0F6] hover:text-on-surface transition-colors
                         flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

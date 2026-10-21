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
  children,
}: DrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-scrim backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 flex max-w-full sm:pl-10">
        <div className="flex w-screen max-w-xl flex-col border-l border-border bg-white/95 shadow-popover backdrop-blur-xl animate-slide-left">
          <div className="relative flex flex-shrink-0 items-start justify-between gap-4 overflow-hidden border-b border-border px-6 py-5">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 80% 120% at 0% 0%, rgba(255,229,240,0.95), transparent 55%), radial-gradient(ellipse 50% 80% at 100% 0%, rgba(241,234,255,0.7), transparent 50%)",
              }}
            />
            <div className="relative min-w-0">
              <h3 className="truncate text-base font-bold tracking-tight text-on-surface">
                {title}
              </h3>
              {subtitle ? (
                <p className="mt-1 truncate text-xs text-on-surface-muted">
                  {subtitle}
                </p>
              ) : null}
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-border bg-white/90 text-on-surface-variant transition-colors hover:bg-[#FFF0F6] hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

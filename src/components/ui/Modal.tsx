import React from "react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  variant?: "primary" | "danger";
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isConfirming = false,
  variant = "primary",
}: ModalProps) {
  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-scrim backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[440px] overflow-hidden rounded-[24px] border border-border bg-white/95 p-7 shadow-popover backdrop-blur-xl animate-zoom-in"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24"
          style={{
            backgroundImage: isDanger
              ? "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(255,240,242,0.95), transparent 70%)"
              : "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(255,229,240,0.95), transparent 70%)",
          }}
        />

        <div
          className={`relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${
            isDanger
              ? "bg-error-container text-error ring-1 ring-error/15"
              : "bg-primary-container text-primary ring-1 ring-primary/15"
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">
            {isDanger ? "warning" : "help"}
          </span>
        </div>

        <h3 className="relative mb-2 text-lg font-bold tracking-tight text-on-surface">
          {title}
        </h3>
        <p className="relative mb-7 text-sm leading-relaxed text-on-surface-variant">
          {description}
        </p>

        <div className="relative flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? "danger" : "primary"}
            isLoading={isConfirming}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

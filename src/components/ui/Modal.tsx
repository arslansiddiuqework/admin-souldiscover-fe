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
  variant = "primary"
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
        className="relative w-full max-w-[440px] glass-panel-strong rounded-2xl p-7 overflow-hidden animate-zoom-in"
      >
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
            isDanger ? "bg-error-container text-error" : "bg-primary-container text-primary"
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">
            {isDanger ? "warning" : "help"}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-on-surface mb-2 font-display tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-on-surface-variant mb-7 leading-relaxed">{description}</p>

        <div className="flex justify-end gap-3">
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

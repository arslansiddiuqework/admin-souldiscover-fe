import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({
  checked,
  onChange,
  disabled = false
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-out
                  focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring
                  disabled:opacity-50 disabled:pointer-events-none ${
        checked
          ? "bg-primary shadow-primary"
          : "bg-surface-container-highest border border-border"
      }`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm
                    transition-all duration-200 ease-out ${
          checked ? "left-[calc(100%-1.375rem)]" : "left-[0.1875rem]"
        }`}
        style={{ width: "1.125rem", height: "1.125rem" }}
      />
    </button>
  );
}

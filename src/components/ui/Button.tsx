import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-full whitespace-nowrap " +
    "transition-all duration-200 ease-out active:scale-[0.98] " +
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-[13px]",
    lg: "px-5 py-3 text-sm",
  };

  const variants = {
    primary:
      "bg-white text-[#1c1033] shadow-[rgba(255,255,255,0.7)_0px_1px_0px_0px_inset,rgba(179,132,201,0.35)_0px_10px_30px_0px] hover:brightness-105 hover:-translate-y-px active:translate-y-0",
    secondary:
      "bg-[rgba(255,255,255,0.05)] text-[#f3eefa] border border-[rgba(216,191,227,0.22)] hover:bg-[rgba(255,255,255,0.08)]",
    outline:
      "bg-white/[0.04] text-on-surface border border-[rgba(216,191,227,0.22)] backdrop-blur-md hover:border-[rgba(216,191,227,0.35)] hover:bg-white/[0.07]",
    ghost:
      "bg-transparent text-on-surface-variant hover:bg-white/[0.06] hover:text-on-surface",
    danger:
      "bg-error text-error-foreground hover:brightness-110 shadow-sm hover:-translate-y-px active:translate-y-0",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : null}
      {children}
    </button>
  );
}

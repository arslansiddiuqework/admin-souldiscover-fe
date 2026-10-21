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
      "bg-primary text-primary-foreground shadow-primary hover:bg-primary-hover hover:-translate-y-px active:translate-y-0",
    secondary:
      "bg-secondary text-secondary-foreground border border-border hover:bg-secondary-hover",
    outline:
      "bg-white/70 text-on-surface border border-border backdrop-blur-md hover:border-border-strong hover:bg-[#fff0f6]",
    ghost:
      "bg-transparent text-on-surface-variant hover:bg-[#fff0f6] hover:text-on-surface",
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

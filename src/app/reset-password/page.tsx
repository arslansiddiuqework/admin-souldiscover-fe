"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";
import { useToast } from "@/components/providers";
import { AdminBrandLogo } from "@/components/brand-logo";
import { BRAND_NAME } from "@/lib/branding";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const { showToast } = useToast();
  const router = useRouter();

  // Dynamic validation checklist
  const validations = {
    length: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
    match: password === confirmPassword && password.length > 0,
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validations.length || !validations.hasNumber || !validations.hasSpecial) {
      showToast("Password does not meet safety criteria.", "error");
      return;
    }

    if (!validations.match) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setIsResetting(true);

    try {
      // Simulate secure API call delay to update mock database
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showToast("Password updated successfully!", "success");
      setIsDone(true);

      // Auto-redirect to login screen after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch {
      showToast("Failed to reset password. Please try again.", "error");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden font-sans text-on-surface antialiased atmosphere-base">
      <div className="pastel-landscape-bg" aria-hidden />
      <div
        className="pointer-events-none absolute left-[-10%] top-[-20%] z-0 h-[800px] w-[800px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(183, 71, 131, 0.16) 0%, rgba(183, 71, 131, 0) 70%)",
          filter: "blur(80px)"
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[-20%] right-[-10%] z-0 h-[700px] w-[700px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(217, 184, 245, 0.35) 0%, rgba(217, 184, 245, 0) 70%)",
          filter: "blur(60px)"
        }}
      />

      <main className="z-10 w-full max-w-[440px] px-6">
        <div className="mb-6 flex justify-center text-center" aria-label={BRAND_NAME}>
          <AdminBrandLogo variant="stacked" size={60} />
        </div>

        <div className="glass-panel-strong relative overflow-hidden rounded-[28px] p-6 transition-all duration-300 md:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 0% 0%, rgba(255,229,240,0.55), transparent 55%), radial-gradient(ellipse 50% 50% at 100% 0%, rgba(241,234,255,0.45), transparent 50%)",
            }}
          />
          <div className="relative">
            {isDone ? (
              <div className="space-y-4 py-4 text-center">
                <div className="mx-auto flex h-12 w-12 animate-bounce items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                  <Check className="h-6 w-6" />
                </div>
                <p className="label-eyebrow text-primary">Success</p>
                <h2 className="font-display text-2xl font-bold tracking-tight text-on-surface">
                  Password Reset
                </h2>
                <p className="mx-auto max-w-[280px] text-xs leading-relaxed text-on-surface-variant">
                  Your password has been successfully configured. Redirecting you to the Sign In
                  page in a few seconds...
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="cursor-pointer rounded-full bg-primary px-6 py-2 text-xs font-bold text-primary-foreground shadow-primary transition-all hover:brightness-105"
                  >
                    Go to Login Now
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <p className="label-eyebrow mb-2 text-primary">Secure Access</p>
                  <h2 className="mb-2 font-display text-3xl font-bold tracking-tight text-on-surface">
                    Reset Password
                  </h2>
                  <p className="mx-auto max-w-[280px] text-xs leading-relaxed text-on-surface-variant">
                    Configure your new administrator credential to secure your access.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleResetPassword}>
                  <div className="space-y-1.5">
                    <label className="label-eyebrow block text-on-surface" htmlFor="password">
                      New Password
                    </label>
                    <div className="field-shell">
                      <Lock className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-primary/70" />
                      <input
                        className="field-input py-3 pl-12 pr-12 text-xs"
                        id="password"
                        name="password"
                        placeholder="Enter new password"
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/70 transition-colors hover:text-primary focus:outline-none"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      className="label-eyebrow block text-on-surface"
                      htmlFor="confirm-password"
                    >
                      Confirm Password
                    </label>
                    <div className="field-shell">
                      <Lock className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-primary/70" />
                      <input
                        className="field-input py-3 pl-12 pr-12 text-xs"
                        id="confirm-password"
                        name="confirm-password"
                        placeholder="Confirm your password"
                        required
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/70 transition-colors hover:text-primary focus:outline-none"
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 space-y-2 rounded-2xl border border-border bg-[#FFF8FB]/80 p-5">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">
                      Security Strength Checklist
                    </p>

                    <div className="flex items-center gap-2 text-xs">
                      {validations.length ? (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-error" />
                      )}
                      <span
                        className={
                          validations.length ? "text-on-surface" : "text-on-surface-variant"
                        }
                      >
                        Minimum of 8 characters
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {validations.hasNumber ? (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-error" />
                      )}
                      <span
                        className={
                          validations.hasNumber ? "text-on-surface" : "text-on-surface-variant"
                        }
                      >
                        Contains at least one number
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {validations.hasSpecial ? (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-error" />
                      )}
                      <span
                        className={
                          validations.hasSpecial ? "text-on-surface" : "text-on-surface-variant"
                        }
                      >
                        Contains at least one special symbol
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {validations.match ? (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-error" />
                      )}
                      <span
                        className={
                          validations.match ? "text-on-surface" : "text-on-surface-variant"
                        }
                      >
                        Passwords match exactly
                      </span>
                    </div>
                  </div>

                  <button
                    className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-xs font-bold tracking-wider text-primary-foreground shadow-primary transition-all hover:brightness-105 disabled:opacity-75"
                    type="submit"
                    disabled={
                      isResetting ||
                      !validations.length ||
                      !validations.hasNumber ||
                      !validations.hasSpecial ||
                      !validations.match
                    }
                  >
                    {isResetting ? "Resetting password..." : "Reset Password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="absolute bottom-6 z-10 w-full text-center">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-on-surface-muted">
          © 2026 Soul Discovery All rights reserved.
        </p>
      </footer>
    </div>
  );
}

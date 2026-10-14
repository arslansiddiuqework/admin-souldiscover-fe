"use client";

import React, { useState, useEffect } from "react";
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
    <div className="flex flex-col min-h-screen items-center justify-center font-inter antialiased atmosphere-base text-on-surface overflow-hidden relative">
      <div className="stars-layer" />
      <div
        className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full z-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(179, 132, 201, 0.22) 0%, rgba(179, 132, 201, 0) 70%)",
          filter: "blur(80px)"
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full z-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(79, 107, 255, 0.14) 0%, rgba(79, 107, 255, 0) 70%)",
          filter: "blur(60px)"
        }}
      />

      {/* Main Container */}
      <main className="w-full max-w-[440px] px-6 z-10">

        {/* Sleek logo at top */}
        <div className="text-center mb-6 flex justify-center" aria-label={BRAND_NAME}>
          <AdminBrandLogo variant="stacked" size={60} />
        </div>

        {/* Card Component */}
        <div className="glass-panel-strong rounded-[24px] p-6 md:p-8 transition-all duration-300">

          {isDone ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20 text-primary animate-bounce">
                <Check className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-primary font-display">Password Reset</h2>
              <p className="text-xs text-on-surface-variant/80 max-w-[280px] mx-auto leading-relaxed">
                Your password has been successfully configured. Redirecting you to the Sign In page in a few seconds...
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="px-6 py-2 bg-white text-[#1c1033] hover:brightness-105 text-xs font-bold rounded-full transition-all cursor-pointer shadow-[rgba(255,255,255,0.7)_0px_1px_0px_0px_inset,rgba(179,132,201,0.35)_0px_10px_30px_0px]"
                >
                  Go to Login Now
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Card Header */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold tracking-tight text-primary font-display mb-2">Reset Password</h2>
                <p className="text-xs text-on-surface-variant/80 leading-relaxed max-w-[280px] mx-auto">
                  Configure your new administrator credential to secure your access.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleResetPassword}>

                {/* New Password Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface/90 uppercase tracking-wider block" htmlFor="password">
                    New Password
                  </label>
                  <div className="relative rounded-xl border border-white/[0.08] bg-white/[0.04] transition-all focus-within:border-primary/80 focus-within:ring-1 focus-within:ring-primary/20">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 h-4.5 w-4.5" />
                    <input
                      className="w-full bg-transparent border-none py-3 pl-12 pr-12 text-on-surface placeholder:text-on-surface-muted focus:ring-0 outline-none text-xs"
                      id="password"
                      name="password"
                      placeholder="Enter new password"
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/70 hover:text-primary transition-colors focus:outline-none"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface/90 uppercase tracking-wider block" htmlFor="confirm-password">
                    Confirm Password
                  </label>
                  <div className="relative rounded-xl border border-white/[0.08] bg-white/[0.04] transition-all focus-within:border-primary/80 focus-within:ring-1 focus-within:ring-primary/20">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 h-4.5 w-4.5" />
                    <input
                      className="w-full bg-transparent border-none py-3 pl-12 pr-12 text-on-surface placeholder:text-on-surface-muted focus:ring-0 outline-none text-xs"
                      id="confirm-password"
                      name="confirm-password"
                      placeholder="Confirm your password"
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/70 hover:text-primary transition-colors focus:outline-none"
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Requirements checklist */}
                <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 space-y-2 mt-2">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/80 mb-2">
                    Security Strength Checklist
                  </p>

                  <div className="flex items-center gap-2 text-xs">
                    {validations.length ? (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-error" />
                    )}
                    <span className={validations.length ? "text-on-surface" : "text-on-surface-variant/80"}>
                      Minimum of 8 characters
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {validations.hasNumber ? (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-error" />
                    )}
                    <span className={validations.hasNumber ? "text-on-surface" : "text-on-surface-variant/80"}>
                      Contains at least one number
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {validations.hasSpecial ? (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-error" />
                    )}
                    <span className={validations.hasSpecial ? "text-on-surface" : "text-on-surface-variant/80"}>
                      Contains at least one special symbol
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {validations.match ? (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-error" />
                    )}
                    <span className={validations.match ? "text-on-surface" : "text-on-surface-variant/80"}>
                      Passwords match exactly
                    </span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  className="w-full bg-white text-[#1c1033] hover:brightness-105 font-bold py-3.5 rounded-full transition-all shadow-[rgba(255,255,255,0.7)_0px_1px_0px_0px_inset,rgba(179,132,201,0.35)_0px_10px_30px_0px] flex items-center justify-center gap-2 mt-4 disabled:opacity-75 text-xs tracking-wider cursor-pointer"
                  type="submit"
                  disabled={isResetting || !validations.length || !validations.hasNumber || !validations.hasSpecial || !validations.match}
                >
                  {isResetting ? "Resetting password..." : "Reset Password"}
                </button>

              </form>
            </>
          )}

        </div>
      </main>

      {/* Sleek bottom footer */}
      <footer className="absolute bottom-6 w-full text-center z-10">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-muted font-semibold font-inter">
          © 2025 Soul Discovery All rights reserved.
        </p>
      </footer>
    </div>
  );
}

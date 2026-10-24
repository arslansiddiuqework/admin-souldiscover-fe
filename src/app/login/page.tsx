"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/providers";
import { AdminBrandLogo } from "@/components/brand-logo";
import { BRAND_NAME } from "@/lib/branding";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");

  const { login, isLoggingIn, verifyMfa, isVerifyingMfa } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password });
      if ("mfaRequired" in result && result.mfaRequired) {
        setMfaToken(result.mfaToken);
        showToast("Enter your authenticator code to continue.", "success");
        return;
      }
      showToast("Access granted. Welcome back!", "success");
      router.push("/dashboard");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Invalid credentials.", "error");
    }
  };

  const handleMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaToken) return;
    try {
      await verifyMfa({ mfaToken, code: mfaCode.trim() });
      showToast("Access granted. Welcome back!", "success");
      router.push("/dashboard");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Invalid MFA code.", "error");
    }
  };

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      showToast("Please enter your email", "error");
      return;
    }
    setIsSendingRecovery(true);
    try {
      const { forgotPassword } = await import("@/services/authService").then(m => ({ forgotPassword: m.authService.forgotPassword }));
      await forgotPassword(recoveryEmail.trim());
      showToast(`Password recovery link sent to ${recoveryEmail.trim()}!`, "success");
      setRecoveryEmail("");
      setIsRecovering(false);
    } catch {
      showToast("Failed to send reset link", "error");
    } finally {
      setIsSendingRecovery(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden font-sans text-on-surface antialiased atmosphere-base">
      <div className="pastel-landscape-bg" aria-hidden />
      <div
        className="pointer-events-none absolute left-[-10%] top-[-20%] z-0 h-[800px] w-[800px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(120, 99, 198, 0.22) 0%, rgba(120, 99, 198, 0) 70%)",
          filter: "blur(80px)"
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[-20%] right-[-10%] z-0 h-[700px] w-[700px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(79, 127, 232, 0.2) 0%, rgba(79, 127, 232, 0) 70%)",
          filter: "blur(60px)"
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-10%] left-[10%] z-0 h-[420px] w-[420px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(196, 107, 74, 0.16) 0%, rgba(196, 107, 74, 0) 70%)",
          filter: "blur(70px)",
        }}
      />

      <main className="z-10 w-full max-w-[440px] px-6">
        <div className="mb-8 flex justify-center text-center" aria-label={BRAND_NAME}>
          <AdminBrandLogo variant="stacked" size={60} />
        </div>

        <div className="glass-panel-strong relative overflow-hidden rounded-[28px] p-6 transition-all duration-300 md:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 0% 0%, rgba(240,234,254,0.8), transparent 55%), radial-gradient(ellipse 50% 50% at 100% 0%, rgba(220,235,255,0.7), transparent 50%), radial-gradient(ellipse 40% 40% at 50% 100%, rgba(255,241,233,0.6), transparent 50%)",
            }}
          />
          <div className="relative">
            {mfaToken ? (
              <>
                <div className="mb-8 text-center">
                  <p className="label-eyebrow mb-2 !text-[#7863C6]">Multi-factor</p>
                  <h2 className="mb-2.5 font-display text-3xl font-bold tracking-tight text-on-surface">
                    Verify MFA
                  </h2>
                  <p className="mx-auto max-w-[280px] text-xs leading-relaxed text-on-surface-variant">
                    Enter the 6-digit code from your authenticator app, or a recovery code.
                  </p>
                </div>
                <form className="space-y-5" onSubmit={handleMfa}>
                  <div className="space-y-2">
                    <label className="label-eyebrow block text-on-surface" htmlFor="mfa-code">
                      Authenticator code
                    </label>
                    <div className="field-shell">
                      <Lock className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#7863C6]" />
                      <input
                        className="field-input py-3.5 pl-12 pr-4 text-xs tracking-widest"
                        id="mfa-code"
                        name="mfa-code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="123456"
                        required
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#B74783] via-[#9658B7] to-[#7863C6] py-3.5 text-xs font-bold tracking-wider text-white shadow-violet transition-all hover:brightness-105 disabled:opacity-75"
                    type="submit"
                    disabled={isVerifyingMfa}
                  >
                    {isVerifyingMfa ? "Verifying..." : "Verify & Sign In"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMfaToken(null);
                      setMfaCode("");
                    }}
                    className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 text-xs text-on-surface-variant transition-colors hover:text-[#7863C6]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </form>
              </>
            ) : isRecovering ? (
              <>
                <div className="mb-8 text-center">
                  <p className="label-eyebrow mb-2 !text-[#7863C6]">Account Recovery</p>
                  <h2 className="mb-2.5 font-display text-3xl font-bold tracking-tight text-on-surface">
                    Forgot Password
                  </h2>
                  <p className="mx-auto max-w-[280px] text-xs leading-relaxed text-on-surface-variant">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleRecoverPassword}>
                  <div className="space-y-2">
                    <label
                      className="label-eyebrow block text-on-surface"
                      htmlFor="recovery-email"
                    >
                      Email
                    </label>
                    <div className="field-shell">
                      <Mail className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#7863C6]" />
                      <input
                        className="field-input py-3.5 pl-12 pr-4 text-xs"
                        id="recovery-email"
                        name="recovery-email"
                        placeholder="Enter your registered email"
                        required
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#B74783] via-[#9658B7] to-[#7863C6] py-3.5 text-xs font-bold tracking-wider text-white shadow-violet transition-all hover:brightness-105 disabled:opacity-75"
                    type="submit"
                    disabled={isSendingRecovery}
                  >
                    {isSendingRecovery ? "Sending link..." : "Send Reset Link"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRecovering(false)}
                    className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 text-xs text-on-surface-variant transition-colors hover:text-[#7863C6]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <p className="label-eyebrow mb-2 !text-[#7863C6]">Admin Access</p>
                  <h2 className="mb-2.5 font-display text-3xl font-bold tracking-tight text-on-surface">
                    Sign In
                  </h2>
                  <p className="mx-auto max-w-[280px] text-xs leading-relaxed text-on-surface-variant">
                    Welcome back! Please sign in to continue your journey.
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <label className="label-eyebrow block text-on-surface" htmlFor="email">
                      Email
                    </label>
                    <div className="field-shell">
                      <Mail className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#7863C6]" />
                      <input
                        className="field-input py-3.5 pl-12 pr-4 text-xs"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        required
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="label-eyebrow block text-on-surface" htmlFor="password">
                      Password
                    </label>
                    <div className="field-shell">
                      <Lock className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#7863C6]" />
                      <input
                        className="field-input py-3.5 pl-12 pr-12 text-xs"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7863C6] transition-colors hover:text-[#5B3FA8] focus:outline-none"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4.5 w-4.5" />
                        ) : (
                          <Eye className="h-4.5 w-4.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#B74783] via-[#9658B7] to-[#7863C6] py-3.5 text-xs font-bold tracking-wider text-white shadow-violet transition-all hover:brightness-105 disabled:opacity-75"
                    type="submit"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? <span>Signing In...</span> : <span>Sign In</span>}
                  </button>

                  <div className="mt-6 border-t border-border pt-5 text-center font-sans text-xs text-on-surface-variant">
                    <button
                      type="button"
                      onClick={() => setIsRecovering(true)}
                      className="cursor-pointer font-semibold text-[#7863C6] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
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

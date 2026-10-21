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

  const { login, isLoggingIn } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      showToast("Access granted. Welcome back!", "success");
      router.push("/dashboard");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Invalid credentials.", "error");
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
    <div className="flex flex-col min-h-screen items-center justify-center font-sans antialiased atmosphere-base text-on-surface overflow-hidden relative">
      <div className="pastel-landscape-bg" aria-hidden />
      <div
        className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full z-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(183, 71, 131, 0.16) 0%, rgba(183, 71, 131, 0) 70%)",
          filter: "blur(80px)"
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full z-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(217, 184, 245, 0.35) 0%, rgba(217, 184, 245, 0) 70%)",
          filter: "blur(60px)"
        }}
      />

      <main className="w-full max-w-[440px] px-6 z-10">
        <div className="text-center mb-8 flex justify-center" aria-label={BRAND_NAME}>
          <AdminBrandLogo variant="stacked" size={60} />
        </div>

        <div className="glass-panel-strong rounded-[22px] p-6 md:p-8 transition-all duration-300">
          
          {isRecovering ? (
            <>
              {/* Recover Password View */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-on-surface font-display mb-2.5">Forgot Password</h2>
                <p className="text-xs text-on-surface-variant/80 leading-relaxed max-w-[280px] mx-auto">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleRecoverPassword}>
                
                {/* Recovery Email Field */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-on-surface/90 uppercase tracking-wider block" htmlFor="recovery-email">
                    Email
                  </label>
                  <div className="field-shell">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 h-4.5 w-4.5" />
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

                {/* Submit button */}
                <button 
                  className="w-full bg-primary text-primary-foreground hover:brightness-105 font-bold py-3.5 rounded-full transition-all shadow-primary flex items-center justify-center gap-2 mt-6 disabled:opacity-75 text-xs tracking-wider" 
                  type="submit"
                  disabled={isSendingRecovery}
                >
                  {isSendingRecovery ? "Sending link..." : "Send Reset Link"}
                </button>

                {/* Back Link */}
                <button
                  type="button"
                  onClick={() => setIsRecovering(false)}
                  className="w-full flex items-center justify-center gap-2 mt-6 text-xs text-on-surface-variant/80 hover:text-primary transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>

              </form>
            </>
          ) : (
            <>
              {/* Card Header (Sign In & Subtitle) */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-on-surface font-display mb-2.5">Sign In</h2>
                <p className="text-xs text-on-surface-variant/80 leading-relaxed max-w-[280px] mx-auto">
                  Welcome back! Please sign in to continue your journey.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleLogin}>
                
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-on-surface/90 uppercase tracking-wider block" htmlFor="email">
                    Email
                  </label>
                  <div className="field-shell">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 h-4.5 w-4.5" />
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

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-on-surface/90 uppercase tracking-wider block" htmlFor="password">
                    Password
                  </label>
                  <div className="field-shell">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 h-4.5 w-4.5" />
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/70 hover:text-primary transition-colors focus:outline-none" 
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

                {/* Submit Button */}
                <button 
                  className="w-full bg-primary text-primary-foreground hover:brightness-105 font-bold py-3.5 rounded-full transition-all shadow-primary flex items-center justify-center gap-2 mt-6 disabled:opacity-75 text-xs tracking-wider" 
                  type="submit"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <span>Signing In...</span>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>

                {/* Divider line */}
                <div className="border-t border-border mt-6 pt-5 text-center text-xs text-on-surface-variant/80 font-sans">
                  <button
                    type="button"
                    onClick={() => setIsRecovering(true)}
                    className="text-primary hover:underline font-semibold cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>

      {/* Sleek bottom footer */}
      <footer className="absolute bottom-6 w-full text-center z-10">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-muted font-semibold font-sans">
          © 2026 Soul Discovery All rights reserved.
        </p>
      </footer>
    </div>
  );
}

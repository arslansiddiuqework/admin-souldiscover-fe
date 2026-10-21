"use client";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

const routePermissions: { [key: string]: string } = {
  "/users": "users.read",
  "/sessions": "sessions.read",
  "/wellness": "users.read",
  "/assessments": "users.read",
  "/consultations": "users.read",
  "/emergency": "emergency.read",
  "/analytics": "analytics.read",
  "/logs": "logs.read",
  "/settings": "settings.read",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, isCheckingAuth, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleAuthError = () => {
      router.push("/login");
    };
    window.addEventListener("admin-auth-error", handleAuthError);
    return () => window.removeEventListener("admin-auth-error", handleAuthError);
  }, [router]);

  let isAllowed = true;
  if (!isCheckingAuth && isAuthenticated && adminUser) {
    const requiredPermission = routePermissions[pathname];
    if (requiredPermission && adminUser.role !== "superAdmin") {
      isAllowed = adminUser.permissions.includes(requiredPermission);
    }
  }

  return (
    <div className="flex min-h-screen text-on-surface relative">
      <Sidebar />
      <main className="relative z-10 flex-1 md:ml-[260px] min-w-0 flex flex-col">
        <Topbar />
        <div className="mx-auto w-full max-w-[1440px] p-4 pt-[84px] md:p-6 md:pt-[88px]">
          {isCheckingAuth ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
              <span className="h-9 w-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <span className="text-xs font-medium text-on-surface-variant">
                Checking authorization...
              </span>
            </div>
          ) : !isAllowed ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-error/20 bg-error-container text-error shadow-card">
                <span className="material-symbols-outlined text-[32px]">lock</span>
              </div>
              <h1 className="mb-2 text-xl font-bold tracking-tight text-on-surface">
                Access Denied
              </h1>
              <p className="mb-8 max-w-[420px] text-sm text-on-surface-variant">
                Your administrator account does not possess the required
                permissions to view this configuration dashboard.
              </p>
              <Link
                href="/dashboard"
                className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-primary transition-all hover:bg-primary-hover"
              >
                Return to Dashboard
              </Link>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}

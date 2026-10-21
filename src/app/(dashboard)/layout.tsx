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
        <div className="max-w-[1440px] w-full mx-auto p-4 md:p-6 pt-20">
          {isCheckingAuth ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
              <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-xs text-on-surface-variant">Checking authorization...</span>
            </div>
          ) : !isAllowed ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <div className="w-16 h-16 rounded-full bg-error-container border border-error/20 flex items-center justify-center mb-6 text-error">
                <span className="material-symbols-outlined text-[32px]">lock</span>
              </div>
              <h1 className="text-xl font-semibold text-on-surface mb-2 font-display">Access Denied</h1>
              <p className="text-sm text-on-surface-variant max-w-[420px] mb-8">
                Your administrator account does not possess the required permissions to view this configuration dashboard.
              </p>
              <Link
                href="/dashboard"
                className="bg-primary text-primary-foreground hover:bg-primary-hover px-5 py-2.5 rounded-full text-xs font-semibold shadow-primary transition-all"
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

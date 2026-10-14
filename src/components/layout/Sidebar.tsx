"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/hooks/useSidebarStore";
import { useAuth } from "@/hooks/useAuth";
import { AdminBrandLogo } from "@/components/brand-logo";
import { BRAND_NAME } from "@/lib/branding";
import { AvatarImage } from "@/components/ui/avatar-image";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { name: "Users", href: "/users", icon: "group" },
  { name: "Sessions", href: "/sessions", icon: "medical_services" },
  { name: "Wellness", href: "/wellness", icon: "self_improvement" },
  { name: "Assessments", href: "/assessments", icon: "quiz" },
  { name: "Consultations", href: "/consultations", icon: "event_available" },
  { name: "Emergency", href: "/emergency", icon: "emergency", error: true },
  { name: "Analytics", href: "/analytics", icon: "analytics" },
  { name: "Logs", href: "/logs", icon: "description" },
];

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

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebarStore();
  const { adminUser } = useAuth();

  const visibleNavItems = navItems.filter((item) => {
    const requiredPermission = routePermissions[item.href];
    if (!requiredPermission) return true;
    if (adminUser?.role === "superAdmin") return true;
    return adminUser?.permissions?.includes(requiredPermission);
  });

  const showSettings = adminUser?.role === "superAdmin" || adminUser?.permissions?.includes("settings.read");

  const linkClass = (active: boolean) =>
    active
      ? "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-semibold text-[#f3eefa] border border-[rgba(216,191,227,0.22)] bg-white/[0.08] shadow-[0_0_20px_rgba(179,132,201,0.12)]"
      : "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-[rgba(231,218,237,0.82)] transition-colors hover:bg-white/[0.06] hover:text-[#f3eefa]";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-scrim z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col overflow-hidden p-4 glass-sidebar
          transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "radial-gradient(circle at top right, rgba(179,132,201,0.1), transparent 42%), radial-gradient(circle at bottom left, rgba(90,50,130,0.08), transparent 40%)",
          }}
        />

        <div className="relative mb-6 mt-2 flex items-center px-2" aria-label={BRAND_NAME}>
          <AdminBrandLogo variant="mark" size={40} />
        </div>

        <nav className="relative flex-1 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeSidebar}
                className={linkClass(isActive)}
              >
                <span className={`material-symbols-outlined text-[20px] ${item.error && !isActive ? "text-[#f87171]" : ""}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative mt-auto space-y-1 border-t border-[rgba(216,191,227,0.18)] pt-4">
          {showSettings && (
            <Link
              href="/settings"
              onClick={closeSidebar}
              className={linkClass(pathname === "/settings")}
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
              <span>Settings</span>
            </Link>
          )}
          <Link
            href="/profile"
            onClick={closeSidebar}
            className={linkClass(pathname === "/profile")}
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span>Profile</span>
          </Link>

          <Link
            href="/profile"
            onClick={closeSidebar}
            className="mt-3 flex cursor-pointer items-center gap-3 rounded-full border border-[rgba(216,191,227,0.18)] bg-white/[0.04] p-3 backdrop-blur-md transition-colors hover:bg-white/[0.07]"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgba(216,191,227,0.22)] bg-[rgba(179,132,201,0.14)] text-xs font-bold text-[#f3eefa]">
              {adminUser?.profileImage ? (
                <AvatarImage src={adminUser.profileImage} alt={adminUser.name} width={32} height={32} className="h-full w-full object-cover" />
              ) : (
                adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "A"
              )}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium text-[#f3eefa]">
                {adminUser?.name || "Admin User"}
              </p>
              <p className="text-[9px] uppercase tracking-wider text-[rgba(231,218,237,0.55)]">
                {adminUser?.role === "superAdmin" ? "Super Admin" : "Administrator"}
              </p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

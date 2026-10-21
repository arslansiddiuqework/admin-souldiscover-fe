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

  const showSettings =
    adminUser?.role === "superAdmin" ||
    adminUser?.permissions?.includes("settings.read");

  const linkClass = (active: boolean) =>
    active ? "nav-link-active" : "nav-link-idle";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-scrim md:hidden"
          onClick={closeSidebar}
          aria-hidden
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col overflow-hidden p-4 glass-sidebar transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        aria-label="Admin navigation"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(circle at top right, rgba(183,71,131,0.08), transparent 42%), radial-gradient(circle at bottom left, rgba(217,184,245,0.16), transparent 40%)",
          }}
        />

        <div
          className="relative mb-6 mt-1 flex items-center px-1.5"
          aria-label={BRAND_NAME}
        >
          <AdminBrandLogo variant="mark" size={38} priority />
        </div>

        <p className="relative mb-2 px-3 label-eyebrow">Main</p>

        <nav className="relative flex-1 space-y-1 overflow-y-auto pr-0.5">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeSidebar}
                className={linkClass(isActive)}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    item.error && !isActive
                      ? "text-error"
                      : isActive
                      ? "text-primary"
                      : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative mt-auto space-y-1 border-t border-border pt-4">
          <p className="mb-2 px-3 label-eyebrow">Account</p>
          {showSettings && (
            <Link
              href="/settings"
              onClick={closeSidebar}
              className={linkClass(pathname === "/settings")}
              aria-current={pathname === "/settings" ? "page" : undefined}
            >
              <span className="material-symbols-outlined text-[20px]">
                settings
              </span>
              <span>Settings</span>
            </Link>
          )}
          <Link
            href="/profile"
            onClick={closeSidebar}
            className={linkClass(pathname === "/profile")}
            aria-current={pathname === "/profile" ? "page" : undefined}
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span>Profile</span>
          </Link>

          <Link
            href="/profile"
            onClick={closeSidebar}
            className="mt-3 flex cursor-pointer items-center gap-3 rounded-[20px] border border-border bg-white/80 p-3 shadow-xs backdrop-blur-md transition-colors hover:bg-[#FFF0F6]"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary-container text-xs font-bold text-primary">
              {adminUser?.profileImage ? (
                <AvatarImage
                  src={adminUser.profileImage}
                  alt={adminUser.name}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              ) : adminUser?.name ? (
                adminUser.name.charAt(0).toUpperCase()
              ) : (
                "A"
              )}
            </div>
            <div className="min-w-0 overflow-hidden">
              <p className="truncate text-sm font-semibold text-on-surface">
                {adminUser?.name || "Admin User"}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-on-surface-muted">
                {adminUser?.role === "superAdmin"
                  ? "Super Admin"
                  : "Administrator"}
              </p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

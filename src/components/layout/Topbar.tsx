"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, Menu, Loader2 } from "lucide-react";
import { useSidebarStore } from "@/hooks/useSidebarStore";
import { apiClient } from "@/services/apiClient";
import { usePathname, useRouter } from "next/navigation";
import { AvatarImage } from "@/components/ui/avatar-image";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "Users",
  "/sessions": "Sessions",
  "/wellness": "Wellness",
  "/assessments": "Assessments",
  "/consultations": "Consultations",
  "/engagement": "Engagement",
  "/ai-usage": "AI Usage",
  "/emergency": "Emergency",
  "/analytics": "Analytics",
  "/security": "Security",
  "/logs": "Logs",
  "/settings": "Settings",
  "/profile": "Profile",
};

export default function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] || "Admin";

  const { toggleSidebar } = useSidebarStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    users: any[];
    sessions: any[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLFormElement>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "";
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const [usersRes, sessionsRes] = await Promise.all([
          apiClient.get(
            `/users?search=${encodeURIComponent(searchQuery)}&limit=3`
          ),
          apiClient.get(
            `/sessions?search=${encodeURIComponent(searchQuery)}&limit=3`
          ),
        ]);
        setSearchResults({
          users: usersRes.data?.users || [],
          sessions: sessionsRes.data?.sessions || [],
        });
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let active = true;

    const fetchNotifications = async () => {
      try {
        const res = await apiClient.get("/logs?limit=8");
        const logsData = res.data?.logs || [];
        if (!active) return;

        const dismissedRaw = localStorage.getItem(
          "admin_dismissed_notifications"
        );
        const dismissedIds: string[] = dismissedRaw
          ? JSON.parse(dismissedRaw)
          : [];
        const visibleLogs = logsData.filter(
          (log: any) => !dismissedIds.includes(log._id || log.id)
        );

        setNotifications(visibleLogs);
        setUnreadCount(visibleLogs.length);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleDismissNotification = (id: string) => {
    const dismissedRaw = localStorage.getItem("admin_dismissed_notifications");
    const dismissedIds: string[] = dismissedRaw ? JSON.parse(dismissedRaw) : [];
    if (id && !dismissedIds.includes(id)) {
      dismissedIds.push(id);
      localStorage.setItem(
        "admin_dismissed_notifications",
        JSON.stringify(dismissedIds)
      );
    }
    setNotifications((prev) =>
      prev.filter((log: any) => (log._id || log.id) !== id)
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    const dismissedRaw = localStorage.getItem("admin_dismissed_notifications");
    const dismissedIds: string[] = dismissedRaw ? JSON.parse(dismissedRaw) : [];

    notifications.forEach((log: any) => {
      const id = log._id || log.id;
      if (id && !dismissedIds.includes(id)) {
        dismissedIds.push(id);
      }
    });

    localStorage.setItem(
      "admin_dismissed_notifications",
      JSON.stringify(dismissedIds)
    );
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleNotificationClick = (log: any) => {
    const id = log._id || log.id;
    handleDismissNotification(id);
    setShowNotifDropdown(false);
    if (log.category === "CRISIS") {
      router.push("/emergency");
    } else {
      router.push("/logs");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/sessions?search=${encodeURIComponent(searchQuery)}`);
    setShowDropdown(false);
    setSearchQuery("");
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-[68px] items-center justify-between gap-3 border-b border-border/80 bg-white/80 px-4 backdrop-blur-xl md:left-[260px] md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-on-surface-variant shadow-xs transition-colors hover:bg-[#F0EAFE] hover:text-on-surface active:scale-95 md:hidden"
          title="Toggle Menu"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-[15px] font-bold tracking-tight text-on-surface">
            {pageTitle}
          </p>
          <p className="truncate text-[10px] font-medium uppercase tracking-[0.08em] text-on-surface-muted">
            Soul Discovery Admin
          </p>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full max-w-md sm:ml-3"
          ref={dropdownRef}
        >
          <div className="flex w-full items-center rounded-full border border-border bg-[#F7F4FF]/90 px-4 py-2 shadow-xs transition-all focus-within:border-violet focus-within:bg-white focus-within:ring-4 focus-within:ring-ring">
            <Search className="mr-2.5 h-4 w-4 text-violet/80" />
            <input
              className="w-full border-none bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-muted focus:ring-0"
              placeholder="Search patients or sessions..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim()) setShowDropdown(true);
              }}
              aria-label="Search patients or sessions"
            />
          </div>

          {showDropdown && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[380px] overflow-hidden overflow-y-auto rounded-xl py-2 glass-panel-strong">
              {isSearching ? (
                <div className="flex items-center justify-center gap-2 py-6 text-xs text-on-surface-muted">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Searching database...
                </div>
              ) : !searchResults ||
                (searchResults.users.length === 0 &&
                  searchResults.sessions.length === 0) ? (
                <div className="py-6 text-center text-xs text-on-surface-muted">
                  No matching patients or sessions found.
                </div>
              ) : (
                <div className="space-y-3 p-1">
                  {searchResults.users.length > 0 && (
                    <div>
                      <div className="px-3 py-1 label-eyebrow">Patients</div>
                      <div className="mt-1 space-y-0.5">
                        {searchResults.users.map((user) => (
                          <div
                            key={user._id || user.id}
                            onClick={() => {
                              router.push(
                                `/users?search=${encodeURIComponent(user.name)}`
                              );
                              setShowDropdown(false);
                              setSearchQuery("");
                            }}
                            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-[#F0EAFE]"
                          >
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-soft text-xs font-bold text-sky">
                              {user.profileImage ? (
                                <AvatarImage
                                  src={user.profileImage}
                                  alt={user.name}
                                  width={32}
                                  height={32}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                user.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <p className="truncate text-xs font-semibold text-on-surface">
                                {user.name}
                              </p>
                              <p className="truncate text-[10px] text-on-surface-muted">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.sessions.length > 0 && (
                    <div>
                      <div className="label-eyebrow border-t border-border px-3 py-1 pt-3">
                        Therapy Sessions
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {searchResults.sessions.map((session) => (
                          <div
                            key={session.sessionId}
                            onClick={() => {
                              router.push(
                                `/sessions?search=${encodeURIComponent(
                                  session.userName
                                )}`
                              );
                              setShowDropdown(false);
                              setSearchQuery("");
                            }}
                            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-[#F0EAFE]"
                          >
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-violet-soft">
                              <span className="material-symbols-outlined text-[16px] text-violet">
                                chat
                              </span>
                            </div>
                            <div className="overflow-hidden">
                              <p className="truncate text-xs font-semibold text-on-surface">
                                Session with {session.userName}
                              </p>
                              <p className="truncate font-mono text-[10px] text-on-surface-muted">
                                ID: {session.sessionId.substring(0, 8)}... •{" "}
                                {session.duration || "N/A"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2.5">
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
            }}
            className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-on-surface-variant shadow-xs transition-all hover:bg-[#F0EAFE] hover:text-on-surface active:scale-95"
            title="Notifications"
            aria-label="Notifications"
            aria-expanded={showNotifDropdown}
          >
            <Bell className="h-4 w-4 text-violet" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-white bg-error" />
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl py-2 glass-panel-strong sm:w-96">
              <div className="flex items-center justify-between border-b border-border bg-[#F7F4FF] px-4 py-2.5">
                <span className="text-xs font-semibold text-on-surface">
                  Notifications
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-semibold text-violet hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[300px] divide-y divide-border overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-1 py-8 text-center text-xs text-on-surface-muted">
                    <span className="material-symbols-outlined text-[28px] text-on-surface-muted/40">
                      notifications_off
                    </span>
                    <span>No active notifications</span>
                  </div>
                ) : (
                  notifications.map((log: any) => {
                    let NotifIcon = "notifications";
                    let iconColor = "text-on-surface-muted";
                    let bgIconColor = "bg-surface-container-high";

                    if (log.category === "CRISIS") {
                      NotifIcon = "emergency_home";
                      iconColor = "text-error";
                      bgIconColor = "bg-error-container";
                    } else if (log.category === "AUTH") {
                      NotifIcon = "vpn_key";
                      iconColor = "text-primary";
                      bgIconColor = "bg-primary-container";
                    } else if (log.category === "SECURITY") {
                      NotifIcon = "shield_lock";
                      iconColor = "text-warning";
                      bgIconColor = "bg-warning-container";
                    } else if (log.category === "SYSTEM") {
                      NotifIcon = "tune";
                      iconColor = "text-info";
                      bgIconColor = "bg-info-container";
                    }

                    return (
                      <div
                        key={log._id || log.id}
                        onClick={() => handleNotificationClick(log)}
                        className="flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-[#F0EAFE]"
                      >
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border ${bgIconColor}`}
                        >
                          <span
                            className={`material-symbols-outlined text-[16px] ${iconColor}`}
                          >
                            {NotifIcon}
                          </span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="line-clamp-2 text-xs font-normal leading-normal text-on-surface">
                            {log.description}
                          </p>
                          <span className="mt-1 block text-[9px] text-on-surface-muted">
                            {timeAgo(log.timestamp)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, Menu, Loader2 } from "lucide-react";
import { useSidebarStore } from "@/hooks/useSidebarStore";
import { apiClient } from "@/services/apiClient";
import { useRouter } from "next/navigation";
import { AvatarImage } from "@/components/ui/avatar-image";

export default function Topbar() {
  const router = useRouter();

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
          apiClient.get(`/users?search=${encodeURIComponent(searchQuery)}&limit=3`),
          apiClient.get(`/sessions?search=${encodeURIComponent(searchQuery)}&limit=3`)
        ]);
        setSearchResults({
          users: usersRes.data?.users || [],
          sessions: sessionsRes.data?.sessions || []
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
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

        const dismissedRaw = localStorage.getItem("admin_dismissed_notifications");
        const dismissedIds: string[] = dismissedRaw ? JSON.parse(dismissedRaw) : [];
        const visibleLogs = logsData.filter((log: any) => !dismissedIds.includes(log._id || log.id));

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
      localStorage.setItem("admin_dismissed_notifications", JSON.stringify(dismissedIds));
    }
    setNotifications(prev => prev.filter((log: any) => (log._id || log.id) !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
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

    localStorage.setItem("admin_dismissed_notifications", JSON.stringify(dismissedIds));
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
    <header className="fixed top-0 right-0 left-0 md:left-[260px] h-16 z-40 glass-nav flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3 w-full max-w-sm">
        <button
          onClick={toggleSidebar}
          className="md:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer active:scale-95"
          title="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="w-full relative" ref={dropdownRef}>
          <div className="flex items-center bg-white/[0.04] px-3.5 py-1.5 rounded-lg border border-white/[0.08] w-full transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-ring">
            <Search className="text-on-surface-muted w-4 h-4 mr-2" />
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-muted text-on-surface outline-none"
              placeholder="Search patients or sessions..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim()) setShowDropdown(true);
              }}
            />
          </div>

          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 glass-panel-strong rounded-xl overflow-hidden z-50 py-2 max-h-[380px] overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center py-6 text-xs text-on-surface-muted gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Searching database...
                </div>
              ) : !searchResults || (searchResults.users.length === 0 && searchResults.sessions.length === 0) ? (
                <div className="text-center py-6 text-xs text-on-surface-muted">
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
                              router.push(`/users?search=${encodeURIComponent(user.name)}`);
                              setShowDropdown(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[rgba(179,132,201,0.05)] cursor-pointer transition-colors"
                          >
                            <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-primary text-xs font-bold overflow-hidden flex-shrink-0">
                              {user.profileImage ? (
                                <AvatarImage src={user.profileImage} alt={user.name} width={32} height={32} className="w-full h-full object-cover" />
                              ) : (
                                user.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs text-on-surface font-semibold truncate">{user.name}</p>
                              <p className="text-[10px] text-on-surface-muted truncate">{user.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.sessions.length > 0 && (
                    <div>
                      <div className="px-3 py-1 label-eyebrow border-t border-border pt-3">Therapy Sessions</div>
                      <div className="mt-1 space-y-0.5">
                        {searchResults.sessions.map((session) => (
                          <div
                            key={session.sessionId}
                            onClick={() => {
                              router.push(`/sessions?search=${encodeURIComponent(session.userName)}`);
                              setShowDropdown(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[rgba(179,132,201,0.05)] cursor-pointer transition-colors"
                          >
                            <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-[16px] text-primary">chat</span>
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs text-on-surface font-semibold truncate">Session with {session.userName}</p>
                              <p className="text-[10px] text-on-surface-muted truncate font-mono">
                                ID: {session.sessionId.substring(0, 8)}... • {session.duration || "N/A"}
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

      <div className="flex items-center gap-2.5">
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
            }}
            className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer active:scale-95 border border-white/[0.08] relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-primary" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-error animate-pulse border-2 border-[#0c0819]" />
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-panel-strong rounded-xl overflow-hidden z-50 py-2">
              <div className="px-4 py-2.5 border-b border-white/[0.08] flex justify-between items-center bg-white/[0.03]">
                <span className="text-xs font-semibold text-on-surface">Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] text-primary hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[300px] overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-xs text-on-surface-muted gap-1 text-center">
                    <span className="material-symbols-outlined text-[28px] text-on-surface-muted/40">notifications_off</span>
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
                        className="p-3 hover:bg-[rgba(179,132,201,0.05)] cursor-pointer transition-colors flex gap-3 items-start"
                      >
                        <div className={`w-8 h-8 rounded-lg ${bgIconColor} flex items-center justify-center flex-shrink-0 border border-border`}>
                          <span className={`material-symbols-outlined text-[16px] ${iconColor}`}>
                            {NotifIcon}
                          </span>
                        </div>
                        <div className="overflow-hidden flex-1">
                          <p className="text-xs text-on-surface font-normal leading-normal line-clamp-2">
                            {log.description}
                          </p>
                          <span className="text-[9px] text-on-surface-muted mt-1 block">
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

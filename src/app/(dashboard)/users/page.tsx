"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Great_Vibes } from "next/font/google";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { Drawer } from "@/components/ui/Drawer";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers";
import { useSearchParams } from "next/navigation";
import { AvatarImage } from "@/components/ui/avatar-image";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricTile } from "@/components/layout/ScreenHero";
import { hasPermission } from "@/lib/permissions";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

function hasActiveAlert(user: any) {
  const risk = user?.lastEscalation?.riskLevel;
  return risk === "HIGH" || risk === "CRITICAL";
}

/** Rotating full-palette avatar washes so the roster never reads monochrome. */
const AVATAR_TONES = [
  "bg-[#EEF4FF] text-[#4F7FE8]",
  "bg-[#F0EAFE] text-[#7863C6]",
  "bg-[#EAF7EF] text-[#287D58]",
  "bg-[#FFF1E9] text-[#C46B4A]",
  "bg-[#FFE5F0] text-[#B74783]",
];

function SnapshotPill({
  label,
  value,
  icon,
  tone = "sky",
}: {
  label: string;
  value: React.ReactNode;
  icon: string;
  tone?: "sky" | "violet" | "mint" | "peach" | "orchid";
}) {
  const iconColor = {
    sky: "text-[#4F7FE8]",
    violet: "text-[#7863C6]",
    mint: "text-[#287D58]",
    peach: "text-[#C46B4A]",
    orchid: "text-[#B74783]",
  }[tone];
  return (
    <div className="rounded-2xl border border-[#DCE7FB] bg-white/90 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#927C8B]">
        <span className={`material-symbols-outlined text-[14px] ${iconColor}`}>{icon}</span>
        {label}
      </div>
      <p className="mt-1 text-sm font-bold text-[#49263D]">{value}</p>
    </div>
  );
}

function DrawerSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#795A70]">
        <span className="material-symbols-outlined text-[14px] text-[#4F7FE8]">{icon}</span>
        {title}
      </h4>
      <div className="space-y-2 rounded-2xl border border-[#DCE7FB] bg-gradient-to-br from-white to-[#F5F8FF] p-4">
        {children}
      </div>
    </div>
  );
}

export default function UsersPage() {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(querySearch);
  const [debouncedSearch, setDebouncedSearch] = useState(querySearch);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { showToast } = useToast();
  const { adminUser } = useAuth();

  useEffect(() => {
    if (querySearch) {
      setSearch(querySearch);
      setDebouncedSearch(querySearch);
    }
  }, [querySearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    users,
    pagination,
    isLoading,
    deleteUser,
    updateUserStatus,
    isUpdatingStatus,
  } = useUsers({
    search: debouncedSearch,
    status,
    page,
    limit: 10,
  });

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userDetail, setUserDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);

  const pulse = useMemo(() => {
    const active = users.filter((u: any) => u.status !== "suspended").length;
    const suspended = users.filter((u: any) => u.status === "suspended").length;
    const alerts = users.filter((u: any) => hasActiveAlert(u)).length;
    const withContacts = users.filter((u: any) => u.hasEmergencyContacts).length;
    const sessions = users.reduce(
      (sum: number, u: any) => sum + (u.sessionCount || 0),
      0
    );
    return { active, suspended, alerts, withContacts, sessions };
  }, [users]);

  /** Decorative spark shapes derived from page counts (stable visual, not fake history). */
  const sparks = useMemo(() => {
    const seed = (n: number, shape: number[]) =>
      shape.map((s) => Math.max(0, s + n * 0.15));
    return {
      total: seed(pagination.total, [2, 3, 2.5, 4, 3.5, 5, 4.5, 6]),
      active: seed(pulse.active, [1, 2, 2.5, 3, 2.8, 4, 3.5, 5]),
      suspended: seed(pulse.suspended, [4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5]),
      alerts: seed(pulse.alerts, [1, 1.2, 1, 1.5, 1.2, 1.8, 1.4, 2]),
      contacts: seed(pulse.withContacts, [2, 2.2, 2.5, 2.8, 3, 3.2, 3.5, 4]),
      sessions: seed(pulse.sessions, [1, 2, 1.5, 3, 2.5, 4, 3.5, 5]),
    };
  }, [pagination.total, pulse]);

  const openUser = async (user: any) => {
    setSelectedUser(user);
    setDetailLoading(true);
    try {
      const detail = await userService.getUserDetail(user._id);
      setUserDetail(detail);
    } catch {
      setUserDetail(null);
      showToast("Could not load full user detail", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const [deletePassword, setDeletePassword] = useState("");

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    if (!deletePassword.trim()) {
      showToast("Enter your admin password to confirm deletion.", "error");
      return;
    }
    setIsActionPending(true);
    try {
      await deleteUser({
        id: userToDelete._id,
        confirmPassword: deletePassword,
      });
      showToast(`User account deleted permanently`, "success");
      setSelectedUser(null);
      setUserDetail(null);
      setDeletePassword("");
    } catch (err: any) {
      showToast(
        err?.response?.data?.message || "Failed to delete user.",
        "error"
      );
    } finally {
      setIsActionPending(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="page-shell !space-y-4">
      {/* Sky directory hero */}
      <PageHeader
        tone="sky"
        eyebrow="Directory"
        title="Users"
        description="Member intelligence — status, emergency posture, and engagement density across the Soul Discovery network."
        meta={
          <>
            <span className="badge-sky">
              <span className="material-symbols-outlined text-[13px]">groups</span>
              {pagination.total} total
            </span>
            {pulse.alerts > 0 ? (
              <span className="badge-error">
                <span className="material-symbols-outlined text-[13px]">emergency</span>
                {pulse.alerts} alerted
              </span>
            ) : (
              <span className="badge-success">
                <span className="material-symbols-outlined text-[13px]">verified_user</span>
                Stable page
              </span>
            )}
            <span className="badge-violet">{pulse.sessions} sessions on page</span>
          </>
        }
        aside={
          <div className="relative mx-auto flex h-36 w-full max-w-[280px] shrink-0 items-center justify-center lg:mx-0 lg:h-40">
            <div
              aria-hidden
              className="absolute h-24 w-24 rounded-full bg-[#93C5FD]/50 blur-2xl"
            />
            <div
              aria-hidden
              className="absolute right-6 top-2 h-10 w-10 rounded-full bg-[#C4B5FD]/60 blur-md"
            />
            <div
              aria-hidden
              className="absolute bottom-4 left-4 h-8 w-8 rounded-full bg-[#86EFAC]/55 blur-md"
            />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-[28px] bg-gradient-to-br from-white to-[#EEF4FF] shadow-[0_16px_40px_rgba(79,127,232,0.22)] ring-1 ring-white/80">
              <span className="material-symbols-outlined text-[52px] text-[#4F7FE8]">
                groups
              </span>
            </div>
            <p
              className={`${greatVibes.className} absolute -bottom-1 right-0 rotate-[-6deg] text-[22px] leading-none text-[#7863C6] sm:text-[26px]`}
            >
              Real People, Real Connections.
            </p>
          </div>
        }
      />

      {/* Metric tiles — full palette */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <MetricTile
          label="Registered"
          value={pagination.total}
          hint="Registered accounts"
          icon="group"
          tone="sky"
          spark={sparks.total}
        />
        <MetricTile
          label="Active"
          value={pulse.active}
          hint="On this page"
          icon="verified_user"
          tone="mint"
          spark={sparks.active}
        />
        <MetricTile
          label="Suspended"
          value={pulse.suspended}
          hint="Access paused"
          icon="block"
          tone="alert"
          spark={sparks.suspended}
        />
        <MetricTile
          label="Risk flags"
          value={pulse.alerts}
          hint="HIGH / CRITICAL"
          icon="emergency"
          tone="violet"
          spark={sparks.alerts}
        />
        <MetricTile
          label="Safety net"
          value={pulse.withContacts}
          hint="Contacts configured"
          icon="contact_emergency"
          tone="peach"
          spark={sparks.contacts}
        />
        <MetricTile
          label="Sessions"
          value={pulse.sessions}
          hint="On this page"
          icon="forum"
          tone="orchid"
          spark={sparks.sessions}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="field-shell flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#4F7FE8]">
              search
            </span>
            <input
              type="text"
              className="field-input rounded-full py-2.5 pl-11 pr-4 text-xs"
              placeholder="Search by name, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="field-select rounded-full text-xs sm:max-w-[200px]"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#DCE7FB] bg-white px-4 py-2.5 shadow-[0_4px_14px_rgba(79,127,232,0.08)]">
          <span className="material-symbols-outlined text-[18px] text-[#4F7FE8]">
            filter_alt
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#927C8B]">
              Showing
            </p>
            <p className="text-xs font-bold text-[#49263D]">
              {users.length} of {pagination.total}
            </p>
          </div>
        </div>
      </div>

      {/* Member roster */}
      <div className="panel !border-[#DCE7FB] shadow-[0_10px_32px_rgba(79,127,232,0.08)]">
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE7FB] bg-gradient-to-r from-[#EEF4FF] via-white to-[#F5F0FF] px-5 py-4 sm:px-6">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#4F7FE8] via-[#7863C6] to-[#287D58]"
          />
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4F7FE8] text-white shadow-[0_8px_18px_rgba(79,127,232,0.3)]">
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </span>
            <div>
              <h2 className="text-sm font-semibold text-[#49263D]">Member roster</h2>
              <p className="mt-0.5 text-[11px] text-[#795A70]">
                Open any row for full clinical &amp; engagement profile
              </p>
            </div>
          </div>
          <span className="badge-sky">{pagination.total} accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left">
            <thead>
              <tr className="border-b border-[#DCE7FB] bg-[#F5F8FF] text-[10px] font-bold uppercase tracking-[0.1em] text-[#4F7FE8]">
                <th className="px-6 py-3">Member</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Emergency</th>
                <th className="px-6 py-3">Engagement</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF2FB]">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-14 animate-pulse rounded-2xl bg-[#EEF4FF]" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon !bg-[#EEF4FF] !text-[#4F7FE8]">
                        <span className="material-symbols-outlined text-[28px]">
                          group_off
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-on-surface">
                        No users found
                      </p>
                      <p className="max-w-xs text-xs text-on-surface-variant">
                        Try a different search or clear the status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user: any) => {
                  const alerted = hasActiveAlert(user);
                  const sessions = user.sessionCount || 0;
                  const colorIdx =
                    (user.name?.charCodeAt(0) || 0) % AVATAR_TONES.length;
                  return (
                    <tr
                      key={user._id}
                      className="group cursor-pointer transition-colors hover:bg-[#F5F8FF]"
                      onClick={() => openUser(user)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold ring-2 ring-white shadow-sm ${AVATAR_TONES[colorIdx]}`}
                            >
                              {user.profileImage ? (
                                <AvatarImage
                                  src={user.profileImage}
                                  alt={user.name}
                                  width={44}
                                  height={44}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                user.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            {alerted ? (
                              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-error ring-2 ring-white" />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-xs font-semibold text-[#49263D] transition-colors group-hover:text-[#4F7FE8]">
                              {user.name}
                            </div>
                            <div className="truncate text-[10px] text-[#927C8B]">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.status === "suspended" ? (
                          <span className="badge-error !px-2.5 !py-1 !text-[10px] uppercase tracking-wider">
                            <span className="h-1.5 w-1.5 rounded-full bg-error" />
                            suspended
                          </span>
                        ) : (
                          <span className="badge-success !px-2.5 !py-1 !text-[10px] uppercase tracking-wider">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#34B27B]" />
                            active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {alerted ? (
                          <span className="badge-error animate-pulse !text-[10px] uppercase tracking-wider">
                            {user.lastEscalation.riskLevel}
                          </span>
                        ) : user.hasEmergencyContacts ? (
                          <span className="badge-peach !text-[10px]">
                            <span className="material-symbols-outlined text-[13px]">
                              verified
                            </span>
                            Contacts set
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#927C8B]">Stable</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#E6EEFD]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#4F7FE8] to-[#7863C6]"
                              style={{
                                width: `${Math.min(100, Math.max(8, sessions * 12))}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-[#49263D]">
                            {sessions}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-[#795A70]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openUser(user)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DCE7FB] bg-white text-[#795A70] transition hover:border-[#4F7FE8]/40 hover:bg-[#EEF4FF] hover:text-[#4F7FE8]"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              visibility
                            </span>
                          </button>
                          {hasPermission(adminUser, "users.delete") ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setUserToDelete(user);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DCE7FB] bg-white text-[#795A70] transition hover:border-error/40 hover:bg-error/10 hover:text-error"
                              title="Delete User"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                more_horiz
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DCE7FB] bg-white text-[#795A70]"
                              title="More"
                              onClick={() => openUser(user)}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                more_horiz
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE7FB] bg-[#F5F8FF]/70 px-5 py-3.5 text-xs sm:px-6">
          <span className="text-[#795A70]">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
            total)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="soft-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="soft-btn-sky"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Drawer
        isOpen={!!selectedUser}
        onClose={() => {
          setSelectedUser(null);
          setUserDetail(null);
        }}
        title={
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EEF4FF] text-sm font-bold text-[#4F7FE8] ring-1 ring-[#DCE7FB]">
              {selectedUser?.profileImage ? (
                <AvatarImage
                  src={selectedUser.profileImage}
                  alt={selectedUser.name}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                (selectedUser?.name || "Unknown").charAt(0).toUpperCase()
              )}
            </div>
            <span>{selectedUser?.name || "User Details"}</span>
          </div>
        }
        subtitle={`User ID: ${selectedUser?._id || "N/A"}`}
      >
        <div className="space-y-5 font-sans text-xs text-on-surface">
          {detailLoading && (
            <div className="space-y-3">
              <div className="h-24 animate-pulse rounded-2xl bg-[#EEF4FF]" />
              <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-2xl bg-[#EEF4FF]" />
                ))}
              </div>
            </div>
          )}

          <div className="relative overflow-hidden rounded-[22px] border border-[#DCE7FB] bg-white p-4 shadow-card">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 80% 70% at 0% 0%, rgba(238,244,255,0.95), transparent 55%), radial-gradient(ellipse 50% 50% at 100% 100%, rgba(240,234,254,0.6), transparent 60%)",
              }}
            />
            <div className="relative space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-on-surface-variant/80">Email</span>
                <span className="max-w-[60%] truncate font-semibold text-on-surface">
                  {selectedUser?.email}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-on-surface-variant/80">Status</span>
                <select
                  value={selectedUser?.status || "active"}
                  disabled={isUpdatingStatus}
                  onChange={async (e) => {
                    try {
                      const newStatus = e.target.value as "active" | "suspended";
                      await updateUserStatus({
                        id: selectedUser._id,
                        status: newStatus,
                      });
                      setSelectedUser((prev: any) =>
                        prev ? { ...prev, status: newStatus } : null
                      );
                      showToast("User status updated successfully", "success");
                    } catch (err: any) {
                      showToast(
                        err.response?.data?.message || "Failed to update status",
                        "error"
                      );
                    }
                  }}
                  className={`field-select min-w-[7rem] w-auto py-1 text-[10px] font-semibold uppercase tracking-wider ${
                    (selectedUser?.status || "active") === "suspended"
                      ? "border-error/30 text-error"
                      : "border-[#287D58]/30 text-[#287D58]"
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-on-surface-variant/80">Sign-in</span>
                <span className="font-semibold capitalize text-[#4F7FE8]">
                  {userDetail?.user?.authProvider ||
                    selectedUser?.authProvider ||
                    "local"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-on-surface-variant/80">AI Companion</span>
                <span className="font-semibold text-[#7863C6]">
                  {userDetail?.user?.aiName || selectedUser?.aiName || "Maya"} ·{" "}
                  {userDetail?.user?.aiBehavior ||
                    selectedUser?.aiBehavior ||
                    "supportive"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-on-surface-variant/80">AI chat (month)</span>
                <span className="font-semibold text-[#B74783]">
                  {userDetail?.aiUsage
                    ? `${userDetail.aiUsage.count}/${userDetail.aiUsage.limit}`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-on-surface-variant/80">Emergency Alert</span>
                <span
                  className={`font-semibold ${
                    hasActiveAlert(selectedUser) ? "text-error" : "text-[#287D58]"
                  }`}
                >
                  {hasActiveAlert(selectedUser)
                    ? `${selectedUser.lastEscalation.riskLevel} (${selectedUser.lastEscalation.outcome})`
                    : "None"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#795A70]">
              <span className="material-symbols-outlined text-[14px] text-[#4F7FE8]">
                monitoring
              </span>
              Activity Snapshot
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <SnapshotPill
                label="Registered"
                icon="calendar_month"
                tone="sky"
                value={
                  selectedUser?.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleDateString()
                    : "N/A"
                }
              />
              <SnapshotPill
                label="Sessions"
                icon="forum"
                tone="violet"
                value={selectedUser?.sessionCount || userDetail?.sessions?.length || 0}
              />
              <SnapshotPill
                label="Mood entries"
                icon="sentiment_satisfied"
                tone="peach"
                value={userDetail?.mood?.totalEntries ?? "—"}
              />
              <SnapshotPill
                label="Weekly mood"
                icon="trending_up"
                tone="mint"
                value={
                  userDetail?.mood ? `${userDetail.mood.weeklyAvgScore}/100` : "—"
                }
              />
              <SnapshotPill
                label="Activities"
                icon="self_improvement"
                tone="mint"
                value={userDetail?.activity?.totalEntries ?? "—"}
              />
              <SnapshotPill
                label="Wellness"
                icon="spa"
                tone="orchid"
                value={userDetail?.wellnessPlans?.length ?? "—"}
              />
              <SnapshotPill
                label="Consults"
                icon="event"
                tone="sky"
                value={userDetail?.consultations?.length ?? "—"}
              />
              <SnapshotPill
                label="Assessments"
                icon="quiz"
                tone="violet"
                value={userDetail?.assessments?.totalCompletions ?? "—"}
              />
            </div>
            {userDetail?.assessments?.inProgressSessions != null ? (
              <p className="mt-2 text-[10px] text-on-surface-variant/70">
                Assessments in progress:{" "}
                <span className="font-semibold text-on-surface">
                  {userDetail.assessments.inProgressSessions}
                </span>
              </p>
            ) : null}
          </div>

          {userDetail?.mood?.recent?.length > 0 && (
            <DrawerSection title="Recent Mood" icon="mood">
              {userDetail.mood.recent.map((m: any, idx: number) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span>
                    {m.mood || "Check-in"} · {m.score}/100
                  </span>
                  <span className="text-on-surface-variant/70">
                    {m.timestamp ? new Date(m.timestamp).toLocaleDateString() : "—"}
                  </span>
                </div>
              ))}
            </DrawerSection>
          )}

          {userDetail?.activity?.recent?.length > 0 && (
            <DrawerSection title="Recent Activity" icon="directions_run">
              {userDetail.activity.recent.map((a: any, idx: number) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span>
                    {a.name || a.type}
                    {a.completed ? "" : " · open"}
                  </span>
                  <span className="text-on-surface-variant/70">
                    {a.timestamp ? new Date(a.timestamp).toLocaleDateString() : "—"}
                  </span>
                </div>
              ))}
            </DrawerSection>
          )}

          {userDetail?.assessments?.recent?.length > 0 && (
            <DrawerSection title="Assessment Completions" icon="assignment_turned_in">
              {userDetail.assessments.recent.map((r: any) => (
                <div
                  key={r.resultId}
                  className="flex justify-between gap-3 text-[11px]"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{r.title}</div>
                    <div className="text-on-surface-variant/70">
                      {r.interpretationLabel || r.scoringMethod || "Completed"}
                    </div>
                  </div>
                  <span className="shrink-0 text-on-surface-variant/70">
                    {r.completedAt
                      ? new Date(r.completedAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              ))}
            </DrawerSection>
          )}

          {userDetail?.sessions?.length > 0 && (
            <DrawerSection title="Recent Therapy Sessions" icon="chat">
              {userDetail.sessions.slice(0, 8).map((s: any) => (
                <div key={s.sessionId} className="flex justify-between text-[11px]">
                  <span className="truncate">{s.title || "Session"}</span>
                  <span className="capitalize text-on-surface-variant/70">
                    {s.status} · {s.messageCount} msgs
                  </span>
                </div>
              ))}
            </DrawerSection>
          )}

          {userDetail?.emergencyContacts?.length > 0 && (
            <DrawerSection title="Emergency Contacts" icon="contact_phone">
              {userDetail.emergencyContacts.map((c: any, idx: number) => (
                <div key={idx} className="flex justify-between gap-3">
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-[10px] text-on-surface-variant/70">
                      {c.relationship}
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-on-surface-variant/80">
                    <div>{c.phone || c.whatsapp || "—"}</div>
                    <div className="capitalize">{c.preferredMethod || ""}</div>
                  </div>
                </div>
              ))}
            </DrawerSection>
          )}

          {userDetail?.wellnessPlans?.length > 0 && (
            <DrawerSection title="Wellness Plans" icon="spa">
              {userDetail.wellnessPlans.map((p: any) => (
                <div key={p.planId || p._id} className="flex justify-between">
                  <span>{p.title}</span>
                  <span className="text-on-surface-variant/80">
                    {p.status} · {p.completionRate}%
                  </span>
                </div>
              ))}
            </DrawerSection>
          )}

          {userDetail?.consultations?.length > 0 && (
            <DrawerSection title="Consultations" icon="event_available">
              {userDetail.consultations.map((c: any) => (
                <div key={c.bookingId || c._id} className="flex justify-between">
                  <span>
                    {c.date} {c.time}
                  </span>
                  <span className="capitalize text-on-surface-variant/80">
                    {c.status}
                  </span>
                </div>
              ))}
            </DrawerSection>
          )}

          {hasPermission(adminUser, "users.delete") && (
            <div className="flex gap-2 border-t border-[#DCE7FB] pt-4">
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  setDeletePassword("");
                  setUserToDelete(selectedUser);
                }}
              >
                Delete User
              </Button>
            </div>
          )}
        </div>
      </Drawer>

      <Modal
        isOpen={!!userToDelete}
        onClose={() => {
          setUserToDelete(null);
          setDeletePassword("");
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete User Account"
        description={`Permanently delete "${userToDelete?.name}"? Re-enter your admin password to confirm.`}
        confirmText="Permanently Delete"
        isConfirming={isActionPending}
        variant="danger"
      >
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-on-surface-muted">
          Admin password
        </label>
        <input
          type="password"
          autoComplete="current-password"
          className="field-input w-full py-2.5 text-sm"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          placeholder="Confirm with your password"
        />
      </Modal>
    </div>
  );
}

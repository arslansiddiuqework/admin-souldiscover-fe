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

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

function hasActiveAlert(user: any) {
  const risk = user?.lastEscalation?.riskLevel;
  return risk === "HIGH" || risk === "CRITICAL";
}

function Sparkline({
  points,
  color,
}: {
  points: number[];
  color: string;
}) {
  const w = 72;
  const h = 28;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 1);
  const d = points
    .map((p, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * w;
      const y = h - ((p - min) / range) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
      <circle
        cx={w}
        cy={h - ((points[points.length - 1] - min) / range) * (h - 4) - 2}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon,
  iconBg,
  iconColor,
  sparkColor,
  spark,
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  sparkColor: string;
  spark: number[];
}) {
  return (
    <div className="rounded-[20px] border border-[#EADCE5]/80 bg-white p-3.5 shadow-[0_8px_24px_rgba(123,57,98,0.06)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
          >
            <span className="material-symbols-outlined text-[16px]">{icon}</span>
          </span>
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-[#927C8B]">
            {label}
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight text-[#49263D]">{value}</p>
          <p className="mt-0.5 text-[11px] text-[#795A70]">{hint}</p>
        </div>
        <Sparkline points={spark} color={sparkColor} />
      </div>
    </div>
  );
}

function SnapshotPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white/80 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-on-surface-muted">
        <span className="material-symbols-outlined text-[14px] text-primary">{icon}</span>
        {label}
      </div>
      <p className="mt-1 text-sm font-bold text-on-surface">{value}</p>
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
      <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/80">
        <span className="material-symbols-outlined text-[14px] text-primary">{icon}</span>
        {title}
      </h4>
      <div className="space-y-2 rounded-2xl border border-border bg-gradient-to-br from-white to-[#FFF8FB] p-4">
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

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsActionPending(true);
    try {
      await deleteUser(userToDelete._id);
      showToast(`User account deleted permanently`, "success");
      setSelectedUser(null);
      setUserDetail(null);
    } catch {
      showToast("Failed to delete user.", "error");
    } finally {
      setIsActionPending(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="page-shell !space-y-4">
      {/* Hero banner — matches pastel directory mock */}
      <section className="relative overflow-hidden rounded-[28px] border border-[#E4D4F0]/80 bg-gradient-to-r from-[#F3E8FF] via-[#F7EEFF] to-[#E8F0FE] shadow-[0_12px_40px_rgba(150,88,183,0.1)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 50% 80% at 85% 40%, rgba(255,255,255,0.7), transparent 55%), radial-gradient(ellipse 40% 60% at 0% 100%, rgba(183,71,131,0.08), transparent 50%)",
          }}
        />
        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B74783]">
              Directory
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#49263D] sm:text-[2rem]">
              Users
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#795A70]">
              Member intelligence — status, emergency posture, and engagement
              density across the Soul Discovery network.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[#FFE5F0] px-3 py-1 text-[11px] font-bold text-[#B74783] ring-1 ring-[#F0CADA]">
                {pagination.total} total
              </span>
              {pulse.alerts > 0 ? (
                <span className="inline-flex items-center rounded-full bg-[#FFF0F2] px-3 py-1 text-[11px] font-bold text-error ring-1 ring-error/20">
                  {pulse.alerts} alerted
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-[#E8F6EF] px-3 py-1 text-[11px] font-bold text-[#287D58] ring-1 ring-[#C6E8D6]">
                  Stable page
                </span>
              )}
            </div>
          </div>

          {/* Decorative illustration */}
          <div className="relative mx-auto flex h-36 w-full max-w-[280px] shrink-0 items-center justify-center lg:mx-0 lg:h-40">
            <div
              aria-hidden
              className="absolute h-24 w-24 rounded-full bg-[#D9B8F5]/50 blur-2xl"
            />
            <div
              aria-hidden
              className="absolute right-6 top-2 h-10 w-10 rounded-full bg-[#B8D4FE]/70 blur-md"
            />
            <div
              aria-hidden
              className="absolute bottom-4 left-4 h-8 w-8 rounded-full bg-[#FFB8D9]/60 blur-md"
            />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-[28px] bg-gradient-to-br from-white to-[#F3E8FF] shadow-[0_16px_40px_rgba(150,88,183,0.2)] ring-1 ring-white/80">
              <span className="material-symbols-outlined text-[52px] text-[#B74783]">
                groups
              </span>
            </div>
            <p
              className={`${greatVibes.className} absolute -bottom-1 right-0 rotate-[-6deg] text-[22px] leading-none text-[#9658B7] sm:text-[26px]`}
            >
              Real People, Real Connections.
            </p>
          </div>
        </div>
      </section>

      {/* Metric cards with sparklines */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          label="Registered"
          value={pagination.total}
          hint="Registered accounts"
          icon="group"
          iconBg="bg-[#FFE5F0]"
          iconColor="text-[#B74783]"
          sparkColor="#E879B0"
          spark={sparks.total}
        />
        <MetricCard
          label="Active"
          value={pulse.active}
          hint="On this page"
          icon="verified_user"
          iconBg="bg-[#E8F6EF]"
          iconColor="text-[#287D58]"
          sparkColor="#34B27B"
          spark={sparks.active}
        />
        <MetricCard
          label="Suspended"
          value={pulse.suspended}
          hint="Access paused"
          icon="block"
          iconBg="bg-[#FFF0F2]"
          iconColor="text-error"
          sparkColor="#E85A6A"
          spark={sparks.suspended}
        />
        <MetricCard
          label="Risk flags"
          value={pulse.alerts}
          hint="HIGH / CRITICAL"
          icon="emergency"
          iconBg="bg-[#E8F0FE]"
          iconColor="text-[#4A7FD4]"
          sparkColor="#5B8DEF"
          spark={sparks.alerts}
        />
        <MetricCard
          label="Safety net"
          value={pulse.withContacts}
          hint="Contacts configured"
          icon="contact_emergency"
          iconBg="bg-[#E8F0FE]"
          iconColor="text-[#4A7FD4]"
          sparkColor="#6B9AF0"
          spark={sparks.contacts}
        />
        <MetricCard
          label="Sessions"
          value={pulse.sessions}
          hint="On this page"
          icon="forum"
          iconBg="bg-[#FFE5F0]"
          iconColor="text-[#B74783]"
          sparkColor="#E879B0"
          spark={sparks.sessions}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="field-shell flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant/80">
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
            className="field-select rounded-full text-xs"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#EADCE5] bg-white px-4 py-2.5 shadow-[0_4px_14px_rgba(123,57,98,0.05)]">
          <span className="material-symbols-outlined text-[18px] text-primary">
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
      <div className="overflow-hidden rounded-[24px] border border-[#EADCE5]/90 bg-white shadow-[0_10px_32px_rgba(123,57,98,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EADCE5]/80 bg-gradient-to-r from-[#FFF8FB] via-white to-[#F8F0FF] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFE5F0] text-primary">
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </span>
            <div>
              <h2 className="text-sm font-semibold text-[#49263D]">Member roster</h2>
              <p className="mt-0.5 text-[11px] text-[#795A70]">
                Open any row for full clinical &amp; engagement profile
              </p>
            </div>
          </div>
          <span className="badge badge-neutral">{pagination.total} accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left">
            <thead>
              <tr className="border-b border-[#EADCE5]/80 text-[10px] font-bold uppercase tracking-[0.1em] text-[#927C8B]">
                <th className="px-6 py-3">Member</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Emergency</th>
                <th className="px-6 py-3">Engagement</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E8ED]">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-14 animate-pulse rounded-2xl bg-[#FFF0F6]/70" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
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
                  const avatarColors = [
                    "bg-[#FFE5F0] text-[#B74783]",
                    "bg-[#E8F0FE] text-[#4A7FD4]",
                    "bg-[#F3EBFF] text-[#9658B7]",
                    "bg-[#E8F6EF] text-[#287D58]",
                  ];
                  const colorIdx =
                    (user.name?.charCodeAt(0) || 0) % avatarColors.length;
                  return (
                    <tr
                      key={user._id}
                      className="group cursor-pointer transition-colors hover:bg-[#FFF8FB]"
                      onClick={() => openUser(user)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold ring-2 ring-white shadow-sm ${avatarColors[colorIdx]}`}
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
                            <div className="truncate text-xs font-semibold text-[#49263D] transition-colors group-hover:text-primary">
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
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-error ring-1 ring-error/15">
                            <span className="h-1.5 w-1.5 rounded-full bg-error" />
                            suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F6EF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#287D58] ring-1 ring-[#C6E8D6]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#34B27B]" />
                            active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {alerted ? (
                          <span className="badge badge-error animate-pulse text-[10px] uppercase tracking-wider">
                            {user.lastEscalation.riskLevel}
                          </span>
                        ) : user.hasEmergencyContacts ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#287D58]">
                            <span className="material-symbols-outlined text-[14px]">
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
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#F1E9EF]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#9F376F] to-[#D9B8F5]"
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
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EADCE5] bg-white text-[#795A70] transition hover:border-primary/30 hover:bg-[#FFF0F6] hover:text-primary"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              visibility
                            </span>
                          </button>
                          {adminUser?.role === "superAdmin" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setUserToDelete(user);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EADCE5] bg-white text-[#795A70] transition hover:border-error/40 hover:bg-error/10 hover:text-error"
                              title="Delete User"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                more_horiz
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EADCE5] bg-white text-[#795A70]"
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EADCE5]/80 px-5 py-3.5 text-xs sm:px-6">
          <span className="text-[#795A70]">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
            total)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full border border-[#EADCE5] bg-white px-4 py-1.5 font-semibold text-[#49263D] transition hover:bg-[#FFF8FB] disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-full border border-[#EADCE5] bg-white px-4 py-1.5 font-semibold text-[#49263D] transition hover:bg-[#FFF8FB] disabled:opacity-40"
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
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-container font-bold text-sm text-primary ring-1 ring-border">
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
              <div className="h-24 animate-pulse rounded-2xl bg-[#FFF0F6]" />
              <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-2xl bg-[#FFF0F6]" />
                ))}
              </div>
            </div>
          )}

          <div className="relative overflow-hidden rounded-[22px] border border-border bg-white p-4 shadow-card">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 80% 70% at 0% 0%, rgba(255,229,240,0.9), transparent 55%)",
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
                      : "border-primary/30 text-primary"
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-on-surface-variant/80">AI Companion</span>
                <span className="font-semibold">
                  {userDetail?.user?.aiName || selectedUser?.aiName || "Maya"} ·{" "}
                  {userDetail?.user?.aiBehavior ||
                    selectedUser?.aiBehavior ||
                    "supportive"}
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
            <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/80">
              <span className="material-symbols-outlined text-[14px] text-primary">
                monitoring
              </span>
              Activity Snapshot
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <SnapshotPill
                label="Registered"
                icon="calendar_month"
                value={
                  selectedUser?.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleDateString()
                    : "N/A"
                }
              />
              <SnapshotPill
                label="Sessions"
                icon="forum"
                value={selectedUser?.sessionCount || userDetail?.sessions?.length || 0}
              />
              <SnapshotPill
                label="Mood entries"
                icon="sentiment_satisfied"
                value={userDetail?.mood?.totalEntries ?? "—"}
              />
              <SnapshotPill
                label="Weekly mood"
                icon="trending_up"
                value={
                  userDetail?.mood ? `${userDetail.mood.weeklyAvgScore}/100` : "—"
                }
              />
              <SnapshotPill
                label="Activities"
                icon="self_improvement"
                value={userDetail?.activity?.totalEntries ?? "—"}
              />
              <SnapshotPill
                label="Wellness"
                icon="spa"
                value={userDetail?.wellnessPlans?.length ?? "—"}
              />
              <SnapshotPill
                label="Consults"
                icon="event"
                value={userDetail?.consultations?.length ?? "—"}
              />
              <SnapshotPill
                label="Assessments"
                icon="quiz"
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

          {adminUser?.role === "superAdmin" && (
            <div className="flex gap-2 border-t border-border pt-4">
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => setUserToDelete(selectedUser)}
              >
                Delete User
              </Button>
            </div>
          )}
        </div>
      </Drawer>

      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete User Account"
        description={`Are you sure you want to permanently delete "${userToDelete?.name}"? This action cannot be undone.`}
        confirmText="Permanently Delete"
        isConfirming={isActionPending}
        variant="danger"
      />
    </div>
  );
}

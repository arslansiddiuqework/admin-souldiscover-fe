"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useUsers } from "@/hooks/useUsers";
import { sessionService } from "@/services/sessionService";
import { useAuth } from "@/hooks/useAuth";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/providers";
import { useSearchParams } from "next/navigation";
import { AvatarImage } from "@/components/ui/avatar-image";
import { PageHeader } from "@/components/layout/PageHeader";

function HeroStat({
  label,
  value,
  hint,
  icon,
  accent = "orchid",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: string;
  accent?: "orchid" | "lavender" | "success" | "danger";
}) {
  const accentCls =
    accent === "success"
      ? "bg-[#E8F6EF] text-[#287D58]"
      : accent === "danger"
        ? "bg-[#FFF0F2] text-error"
        : accent === "lavender"
          ? "bg-[#F3EBFF] text-[#9658B7]"
          : "bg-[#FFE5F0] text-primary";

  return (
    <div className="rounded-2xl border border-white/50 bg-white/55 px-3.5 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${accentCls}`}>
          <span className="material-symbols-outlined text-[16px]">{icon}</span>
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-muted">
          {label}
        </p>
      </div>
      <p className="mt-2 text-xl font-bold tracking-tight text-on-surface">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-on-surface-variant">{hint}</p> : null}
    </div>
  );
}

function statusBadge(status?: string) {
  if (status === "active") return "badge-primary";
  if (status === "completed") return "badge-neutral";
  return "badge-warning";
}

export default function SessionsPage() {
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

  const { users, pagination, isLoading } = useUsers({
    search: debouncedSearch,
    status: status === "all" ? undefined : status,
    page,
    limit: 12,
  });

  const [selectedUserForSessions, setSelectedUserForSessions] = useState<any | null>(
    null
  );
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [isUserSessionsLoading, setIsUserSessionsLoading] = useState(false);

  const [inspectSession, setInspectSession] = useState<any | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const pulse = useMemo(() => {
    const totalSessions = users.reduce(
      (sum: number, u: any) => sum + (u.sessionCount || 0),
      0
    );
    const withSessions = users.filter((u: any) => (u.sessionCount || 0) > 0).length;
    const activeUsers = users.filter((u: any) => u.status !== "suspended").length;
    const suspended = users.filter((u: any) => u.status === "suspended").length;
    const avg =
      users.length > 0 ? Math.round((totalSessions / users.length) * 10) / 10 : 0;
    const maxOnPage = Math.max(...users.map((u: any) => u.sessionCount || 0), 0);
    return { totalSessions, withSessions, activeUsers, suspended, avg, maxOnPage };
  }, [users]);

  const sessionListStats = useMemo(() => {
    const active = userSessions.filter((s) => s.status === "active").length;
    const completed = userSessions.filter((s) => s.status === "completed").length;
    const risk = userSessions.filter((s) => s.hasRisk).length;
    return { active, completed, risk, total: userSessions.length };
  }, [userSessions]);

  const handleSelectUser = async (user: any) => {
    setSelectedUserForSessions(user);
    setIsUserSessionsLoading(true);
    try {
      const fetchedSessions = await sessionService.getUserSessions(user._id);
      setUserSessions(fetchedSessions);
    } catch (e) {
      console.error(e);
      showToast("Failed to fetch user's sessions", "error");
      setUserSessions([]);
    } finally {
      setIsUserSessionsLoading(false);
    }
  };

  const handleInspect = async (session: any) => {
    setIsDetailLoading(true);
    setInspectSession({ ...session, messages: [], isFetching: true });
    try {
      const detail = await sessionService.getSessionDetail(session.sessionId);
      setInspectSession({
        ...session,
        messages: detail.messages || [],
        isFetching: false,
      });
    } catch (e) {
      console.error(e);
      setInspectSession({
        ...session,
        messages: [],
        isFetching: false,
        error: true,
      });
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div className="page-shell !space-y-4">
      <PageHeader
        eyebrow="Clinical"
        title="Sessions"
        description="Therapy session console — browse members, open histories, and inspect high-risk transcripts securely."
        meta={
          <>
            <span className="badge badge-primary">{pagination.total} members</span>
            <span className="badge badge-neutral">
              {pulse.totalSessions} sessions on page
            </span>
          </>
        }
      />

      {/* Hero pulse */}
      <div className="relative overflow-hidden rounded-[28px] border border-border bg-white/90 shadow-card">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 80% at 0% 0%, rgba(255,229,240,0.95), transparent 55%), radial-gradient(ellipse 55% 60% at 100% 0%, rgba(217,184,245,0.35), transparent 50%), radial-gradient(ellipse 40% 50% at 50% 100%, rgba(255,240,246,0.65), transparent 45%)",
          }}
        />
        <div className="relative grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6">
          <HeroStat
            label="Members"
            value={pagination.total}
            hint="In directory"
            icon="groups"
          />
          <HeroStat
            label="Sessions"
            value={pulse.totalSessions}
            hint="On this page"
            icon="forum"
          />
          <HeroStat
            label="Engaged"
            value={pulse.withSessions}
            hint="Have ≥1 session"
            icon="psychology"
            accent="lavender"
          />
          <HeroStat
            label="Avg / member"
            value={pulse.avg}
            hint="Page average"
            icon="analytics"
          />
          <HeroStat
            label="Active"
            value={pulse.activeUsers}
            hint="Account status"
            icon="verified_user"
            accent="success"
          />
          <HeroStat
            label="Peak"
            value={pulse.maxOnPage}
            hint="Most sessions"
            icon="bolt"
            accent={pulse.suspended > 0 ? "danger" : "orchid"}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <div className="filter-bar flex-1 !mb-0">
          <div className="field-shell">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant/80">
              search
            </span>
            <input
              type="text"
              className="field-input py-2.5 pl-11 pr-4 text-xs"
              placeholder="Search users by name or email..."
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
            className="field-select text-xs"
          >
            <option value="all">All Users</option>
            <option value="active">Active Users</option>
            <option value="suspended">Suspended Users</option>
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-[22px] border border-border bg-white/80 px-4 py-2 shadow-card">
          <span className="material-symbols-outlined text-[18px] text-primary">
            grid_view
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-muted">
              Showing
            </p>
            <p className="text-xs font-bold text-on-surface">
              {users.length} of {pagination.total}
            </p>
          </div>
        </div>
      </div>

      {/* Member session cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, idx) => (
            <div
              key={idx}
              className="h-56 animate-pulse rounded-[22px] border border-border bg-white/70"
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="empty-state-icon">
              <span className="material-symbols-outlined text-[28px]">group_off</span>
            </div>
            <p className="text-sm font-semibold text-on-surface">No users found</p>
            <p className="max-w-xs text-xs text-on-surface-variant">
              Adjust search parameters or filter criteria.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {users.map((user: any) => {
            const sessions = user.sessionCount || 0;
            const barPct = Math.min(
              100,
              Math.max(6, pulse.maxOnPage > 0 ? (sessions / pulse.maxOnPage) * 100 : 6)
            );
            return (
              <div
                key={user._id}
                className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-[22px] border border-border bg-white/90 p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
                onClick={() => handleSelectUser(user)}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-90"
                  style={{
                    backgroundImage:
                      "radial-gradient(ellipse 80% 70% at 0% 0%, rgba(255,229,240,0.95), transparent 55%), radial-gradient(ellipse 60% 50% at 100% 0%, rgba(241,234,255,0.7), transparent 50%)",
                  }}
                />
                <div className="relative">
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-container text-lg font-bold text-primary ring-1 ring-border transition-colors group-hover:ring-primary/40">
                        {user.profileImage ? (
                          <AvatarImage
                            src={user.profileImage}
                            alt={user.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          (user.name || "U").charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 overflow-hidden">
                        <h3 className="line-clamp-1 text-sm font-semibold text-on-surface transition-colors group-hover:text-primary">
                          {user.name || "Unknown User"}
                        </h3>
                        <p className="mt-0.5 line-clamp-1 font-mono text-[10px] text-on-surface-variant/75">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`badge shrink-0 text-[9px] uppercase tracking-wider ${
                        user.status === "suspended" ? "badge-error" : "badge-success"
                      }`}
                    >
                      {user.status || "Active"}
                    </span>
                  </div>

                  <div className="mb-4 rounded-2xl border border-border bg-white/75 p-3.5 backdrop-blur-sm">
                    <div className="mb-2 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/70">
                          Sessions
                        </p>
                        <p className="mt-0.5 text-2xl font-bold tracking-tight text-on-surface">
                          {sessions}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-[22px] text-primary/70">
                        forum
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#F1E9EF]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#9F376F] via-[#B74783] to-[#D9B8F5] transition-all duration-500"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] text-on-surface-muted">
                      Relative volume on this page
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="relative soft-btn w-full group-hover:border-primary/30 group-hover:bg-[#FFF0F6] group-hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectUser(user);
                  }}
                >
                  <span className="material-symbols-outlined text-[15px]">list_alt</span>
                  Open session history
                  <span className="material-symbols-outlined ml-auto text-[16px]">
                    arrow_forward
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && users.length > 0 && (
        <div className="panel">
          <div className="pagination-bar text-xs !border-t-0">
            <span className="text-on-surface-variant/80">
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
                className="soft-btn"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer 1: User's Session List */}
      <Drawer
        isOpen={!!selectedUserForSessions && !inspectSession}
        onClose={() => setSelectedUserForSessions(null)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-container font-bold text-sm text-primary ring-1 ring-border">
              {selectedUserForSessions?.profileImage ? (
                <AvatarImage
                  src={selectedUserForSessions.profileImage}
                  alt={selectedUserForSessions.name}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                (selectedUserForSessions?.name || "U").charAt(0).toUpperCase()
              )}
            </div>
            <span>{selectedUserForSessions?.name}&apos;s Sessions</span>
          </div>
        }
        subtitle={`${selectedUserForSessions?.email}`}
      >
        <div className="space-y-4 font-sans text-xs text-on-surface">
          {!isUserSessionsLoading && userSessions.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-2xl border border-border bg-gradient-to-br from-white to-[#FFF8FB] px-3 py-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-on-surface-muted">
                  Total
                </p>
                <p className="mt-0.5 text-lg font-bold">{sessionListStats.total}</p>
              </div>
              <div className="rounded-2xl border border-border bg-gradient-to-br from-white to-[#FFF8FB] px-3 py-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-on-surface-muted">
                  Active
                </p>
                <p className="mt-0.5 text-lg font-bold text-primary">
                  {sessionListStats.active}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-gradient-to-br from-white to-[#FFF8FB] px-3 py-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-on-surface-muted">
                  Done
                </p>
                <p className="mt-0.5 text-lg font-bold">{sessionListStats.completed}</p>
              </div>
              <div className="rounded-2xl border border-border bg-gradient-to-br from-white to-[#FFF8FB] px-3 py-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-on-surface-muted">
                  Risk
                </p>
                <p
                  className={`mt-0.5 text-lg font-bold ${
                    sessionListStats.risk > 0 ? "text-error" : "text-[#287D58]"
                  }`}
                >
                  {sessionListStats.risk}
                </p>
              </div>
            </div>
          ) : null}

          {isUserSessionsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-2xl border border-border bg-surface"
                />
              ))}
            </div>
          ) : userSessions.length === 0 ? (
            <div className="empty-state py-10">
              <div className="empty-state-icon">
                <span className="material-symbols-outlined text-[24px]">inbox</span>
              </div>
              <p className="text-sm font-semibold text-on-surface">No sessions yet</p>
              <p className="text-xs text-on-surface-variant">
                This user has no recorded sessions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userSessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border bg-gradient-to-br from-white to-[#FFF8FB] p-4 transition-all hover:border-primary/40 hover:shadow-card"
                  onClick={() =>
                    handleInspect({
                      ...session,
                      userName: selectedUserForSessions.name,
                      userProfileImage: selectedUserForSessions.profileImage,
                    })
                  }
                >
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase text-on-surface-variant/70">
                        ID: {session.sessionId.substring(0, 8)}
                      </span>
                      <span
                        className={`badge text-[9px] uppercase tracking-wider ${statusBadge(
                          session.status
                        )}`}
                      >
                        {session.status}
                      </span>
                      {session.hasRisk ? (
                        <span className="badge badge-error text-[9px] uppercase tracking-wider">
                          High Risk
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-on-surface">
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                        schedule
                      </span>
                      {new Date(session.startTime || Date.now()).toLocaleDateString()}{" "}
                      • {session.duration || "0m"}
                    </div>
                  </div>

                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant transition-colors group-hover:text-primary">
                    chevron_right
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Drawer>

      {/* Drawer 2: Session Detail Inspect (Chat) */}
      <Drawer
        isOpen={!!inspectSession}
        onClose={() => setInspectSession(null)}
        title={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setInspectSession(null)}
              className="mr-1 rounded-full p-1 transition-colors hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            </button>
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-container font-bold text-sm text-primary ring-1 ring-border">
              {inspectSession?.userProfileImage ? (
                <AvatarImage
                  src={inspectSession.userProfileImage}
                  alt={inspectSession.userName}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                (inspectSession?.userName || "U").charAt(0).toUpperCase()
              )}
            </div>
            <span>Chat History: {inspectSession?.userName}</span>
          </div>
        }
        subtitle={`Session ID: ${inspectSession?.sessionId}`}
      >
        <div className="space-y-5 font-sans text-xs text-on-surface">
          {/* Sentiment HUD */}
          <div className="relative overflow-hidden rounded-[22px] border border-border bg-white p-4 shadow-card">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 80% 70% at 0% 0%, rgba(255,229,240,0.9), transparent 55%)",
              }}
            />
            <div className="relative flex items-center justify-between gap-4 font-mono">
              <div>
                <div className="font-sans text-[10px] uppercase text-on-surface-variant/80">
                  Duration
                </div>
                <div className="mt-1 font-sans text-sm font-semibold text-on-surface">
                  {inspectSession?.duration || "0m"}
                </div>
              </div>
              <div>
                <div className="text-right font-sans text-[10px] uppercase text-on-surface-variant/80">
                  Patient Status
                </div>
                <div className="mt-1 flex justify-end font-sans text-sm font-semibold">
                  <span
                    className={`badge font-sans text-[10px] uppercase tracking-wide ${
                      inspectSession?.hasRisk ? "badge-error" : "badge-success"
                    }`}
                  >
                    {inspectSession?.hasRisk ? "High Risk" : "Stable"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Status Manager */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-gradient-to-br from-white to-[#FFF8FB] p-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/80">
              Session Status
            </span>
            {adminUser?.role === "superAdmin" ? (
              <select
                value={inspectSession?.status || "active"}
                onChange={async (e) => {
                  const newStatus = e.target.value as
                    | "active"
                    | "completed"
                    | "archived";
                  try {
                    await sessionService.updateSessionStatus(
                      inspectSession.sessionId,
                      newStatus
                    );
                    showToast(`Session status updated to ${newStatus}`, "success");
                    setInspectSession((prev: any) =>
                      prev ? { ...prev, status: newStatus } : null
                    );
                    setUserSessions((prev) =>
                      prev.map((s) =>
                        s.sessionId === inspectSession.sessionId
                          ? { ...s, status: newStatus }
                          : s
                      )
                    );
                  } catch {
                    showToast("Failed to update session status.", "error");
                  }
                }}
                className="field-select min-w-[8rem] w-auto py-1.5 text-xs"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            ) : (
              <span
                className={`badge text-[10px] uppercase tracking-wider ${statusBadge(
                  inspectSession?.status
                )}`}
              >
                {inspectSession?.status || "active"}
              </span>
            )}
          </div>

          {/* Transcript logs */}
          <div>
            <h4 className="mb-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/80">
              <span className="material-symbols-outlined text-[14px]">chat</span>
              Chat Conversation History
              {isDetailLoading ? (
                <span className="ml-2 text-on-surface-variant/50">…</span>
              ) : null}
            </h4>
            <div className="max-h-[360px] space-y-4 overflow-y-auto rounded-2xl border border-border bg-gradient-to-b from-[#FFF8FB] to-white p-4">
              {inspectSession?.isFetching ? (
                <div className="animate-pulse py-8 text-center text-[11px] text-on-surface-variant/50">
                  Loading transcript...
                </div>
              ) : !inspectSession?.hasRisk ? (
                <div className="flex flex-col items-center justify-center space-y-4 px-4 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container text-primary ring-1 ring-border">
                    <span className="material-symbols-outlined text-[24px]">lock</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-on-surface">
                      Transcript Privacy Enabled
                    </h5>
                    <p className="mx-auto mt-1 max-w-[240px] text-[10px] leading-normal text-on-surface-variant/75">
                      To protect patient privacy, chat transcripts are securely
                      encrypted. They are only accessible to administrators when a
                      safety check flags the session as High Risk.
                    </p>
                  </div>
                </div>
              ) : !inspectSession?.messages ||
                inspectSession.messages.length === 0 ? (
                <div className="py-8 text-center text-[11px] text-on-surface-variant/50">
                  No messages in this session.
                </div>
              ) : (
                inspectSession.messages.map((msg: any, idx: number) => (
                  <div
                    key={idx}
                    className={`space-y-1 ${msg.role === "user" ? "" : "text-right"}`}
                  >
                    <div className="font-mono text-[9px] font-semibold uppercase tracking-wider text-on-surface-variant/70">
                      {msg.role === "user" ? inspectSession.userName : "AI Therapist"}{" "}
                      •{" "}
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div
                      className={`inline-block max-w-[85%] rounded-2xl p-3 text-left text-[11px] leading-relaxed ${
                        msg.role === "user"
                          ? "border border-border bg-white text-on-surface"
                          : "border border-primary/20 bg-primary/10 text-primary"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Compliance dispatch block */}
          <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <span className="material-symbols-outlined text-[20px] text-primary">
              shield
            </span>
            <div>
              <p className="text-[11px] font-semibold text-primary">
                Secure Conversation
              </p>
              <p className="mt-0.5 text-[10px] text-on-surface-variant/80">
                This conversation is private and securely encrypted.
              </p>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

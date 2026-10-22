"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useWellness } from "@/hooks/useWellness";
import { wellnessService } from "@/services/wellnessService";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/providers";
import { PageHeader } from "@/components/layout/PageHeader";

function MiniRing({
  value,
  size = 56,
  stroke = 5,
  color = "#287D58",
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#DDF1E6"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold tabular-nums text-[#49263D]">
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  );
}

/** Status → pill (paused = peach, completed = mint, active = sky). */
function statusPill(status?: string) {
  if (status === "completed") return "badge-success";
  if (status === "paused") return "badge-peach";
  return "badge-sky";
}

function ringColor(status?: string) {
  if (status === "paused") return "#C46B4A";
  if (status === "completed") return "#287D58";
  return "#2F9E6F";
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[#795A70]">{label}</span>
      <span className="text-right font-semibold capitalize text-[#49263D]">{children}</span>
    </div>
  );
}

export default function WellnessPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { plans, pagination, summary, isLoading } = useWellness({
    search: debouncedSearch,
    status,
    page,
    limit: 12,
  });

  const openDetail = async (plan: any) => {
    setSelected(plan);
    setDetailLoading(true);
    try {
      const data = await wellnessService.getPlanDetail(plan._id);
      setDetail(data);
    } catch {
      showToast("Failed to load plan details", "error");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const weekTiles = useMemo(
    () => [
      { id: "all", label: "All", value: summary.totalEnrollments, icon: "spa" },
      { id: "active", label: "Active", value: summary.active, icon: "play_circle" },
      { id: "completed", label: "Done", value: summary.completed, icon: "task_alt" },
      { id: "paused", label: "Paused", value: summary.paused, icon: "pause_circle" },
    ],
    [summary]
  );

  /** Active tile styling per status — mint family, paused flips to peach. */
  const tileActive = (id: string) =>
    id === "paused"
      ? "bg-gradient-to-br from-[#D98262] to-[#C46B4A] text-white shadow-[0_8px_18px_rgba(196,107,74,0.3)]"
      : id === "active"
        ? "bg-gradient-to-br from-[#4F7FE8] to-[#3E69CC] text-white shadow-[0_8px_18px_rgba(79,127,232,0.28)]"
        : "bg-gradient-to-br from-[#34966D] to-[#287D58] text-white shadow-[0_8px_18px_rgba(40,125,88,0.28)]";

  return (
    <div className="page-shell !space-y-4">
      <PageHeader
        tone="mint"
        eyebrow="Wellness desk"
        title="Member plan journeys"
        description="Follow every enrollment — completion rings, streak momentum, and paused plans that need a nudge."
        meta={
          <>
            <span className="badge-success">
              <span className="material-symbols-outlined text-[13px]">groups</span>
              {summary.totalEnrollments} enrolled
            </span>
            <span className="badge-sky">{summary.active} active</span>
            <span className="badge-peach">
              <span className="material-symbols-outlined text-[13px]">pause_circle</span>
              {summary.paused} paused
            </span>
          </>
        }
        aside={
          <div className="relative mx-auto hidden h-28 w-32 shrink-0 items-center justify-center lg:flex">
            <div
              aria-hidden
              className="absolute inset-0 rounded-[28px] bg-[#86EFAC]/50 blur-2xl"
            />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-[0_16px_36px_rgba(40,125,88,0.25)] ring-4 ring-[#DDF1E6]">
              <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gradient-to-br from-[#34966D] to-[#287D58] text-white">
                <span className="material-symbols-outlined text-[34px]">spa</span>
              </div>
            </div>
            <span className="absolute -right-1 top-1 flex items-center gap-0.5 rounded-full bg-[#FFF1E9] px-2 py-1 text-[10px] font-bold text-[#C46B4A] shadow-lifted ring-1 ring-[#F0D5C4]">
              <span className="material-symbols-outlined text-[13px]">
                local_fire_department
              </span>
              {summary.avgCompletionRate}%
            </span>
          </div>
        }
      />

      {/* Mint frosted desk */}
      <div className="relative -mx-1 overflow-hidden rounded-[28px] border border-[#CFE9DB] bg-[#F4FBF7] shadow-[0_18px_50px_rgba(40,125,88,0.1)]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,rgba(40,125,88,0.14),transparent_58%)]" />
          <div className="absolute -left-16 bottom-8 h-48 w-48 rounded-full bg-[rgba(134,239,172,0.28)] blur-3xl" />
          <div className="absolute right-0 top-24 h-56 w-56 rounded-full bg-[rgba(79,127,232,0.12)] blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-[rgba(196,107,74,0.08)] blur-3xl" />
        </div>

        <div className="relative m-3 overflow-hidden rounded-[24px] border border-[#CFE9DB]/90 bg-white/80 shadow-[0_14px_40px_rgba(40,125,88,0.09)] backdrop-blur-xl sm:m-4">
          {/* Status tile selector */}
          <div className="border-b border-[#DDF1E6] bg-[linear-gradient(105deg,#F4FBF7_0%,#FFFFFF_45%,#EEF4FF_100%)] px-4 py-4 sm:px-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EAF7EF] text-[#287D58]">
                <span className="material-symbols-outlined text-[16px]">tune</span>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#287D58]">
                Filter by journey state
              </p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {weekTiles.map((tile) => {
                const active = status === tile.id;
                return (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => {
                      setStatus(tile.id);
                      setPage(1);
                    }}
                    className={`min-w-[5.5rem] shrink-0 rounded-2xl px-3.5 py-2.5 text-left transition-all ${
                      active
                        ? tileActive(tile.id)
                        : "bg-white text-[#49263D] ring-1 ring-[#DDF1E6] hover:ring-[#9FD6B9]"
                    }`}
                  >
                    <p
                      className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] ${
                        active ? "text-white/85" : "text-[#927C8B]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {tile.icon}
                      </span>
                      {tile.label}
                    </p>
                    <p className="mt-0.5 text-lg font-bold tabular-nums">{tile.value}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="field-shell w-full max-w-lg">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#287D58]">
                search
              </span>
              <input
                className="field-input py-2.5 pl-11 pr-4 text-xs"
                placeholder="Search member, plan, or goal…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#EAF7EF] px-3 py-1.5 text-[11px] font-semibold text-[#287D58] ring-1 ring-[#C6E8D6] sm:self-auto">
              <span className="material-symbols-outlined text-[14px]">donut_large</span>
              {summary.avgCompletionRate}% avg completion
            </span>
          </div>

          {/* Journey cards grid */}
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-40 animate-pulse rounded-[22px] bg-[#EAF7EF]/80" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="empty-state rounded-[22px] border border-dashed border-[#CFE9DB] bg-white/60 py-14">
                <div className="empty-state-icon !bg-[#EAF7EF] !text-[#287D58]">
                  <span className="material-symbols-outlined text-[28px]">spa</span>
                </div>
                <p className="text-sm font-semibold text-on-surface">No wellness enrollments yet</p>
                <p className="max-w-sm text-xs text-on-surface-variant">
                  Plans sync when users create or update them in the app.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {plans.map((plan) => {
                  const paused = plan.status === "paused";
                  return (
                    <button
                      key={plan._id}
                      type="button"
                      onClick={() => openDetail(plan)}
                      className={`group relative flex flex-col overflow-hidden rounded-[22px] border bg-white/95 p-4 text-left shadow-[0_8px_24px_rgba(40,125,88,0.06)] transition-all hover:-translate-y-0.5 ${
                        paused
                          ? "border-[#F0D5C4] hover:border-[#E5B9A0] hover:shadow-[0_14px_32px_rgba(196,107,74,0.16)]"
                          : "border-[#DDF1E6] hover:border-[#9FD6B9] hover:shadow-[0_14px_32px_rgba(40,125,88,0.16)]"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`absolute inset-x-0 top-0 h-[3px] ${
                          paused
                            ? "bg-gradient-to-r from-[#C46B4A] to-[#EBAE92]"
                            : "bg-gradient-to-r from-[#287D58] to-[#7CCBA3]"
                        }`}
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1 ${
                              paused
                                ? "bg-[#FFF1E9] text-[#C46B4A] ring-[#F0D5C4]"
                                : "bg-[#EAF7EF] text-[#287D58] ring-[#C6E8D6]"
                            }`}
                          >
                            {(plan.user?.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`truncate text-sm font-semibold text-[#49263D] ${
                                paused
                                  ? "group-hover:text-[#C46B4A]"
                                  : "group-hover:text-[#287D58]"
                              }`}
                            >
                              {plan.user?.name || "Unknown"}
                            </p>
                            <p className="truncate text-[10px] text-[#927C8B]">
                              {plan.user?.email}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 text-[9px] uppercase tracking-wider ${statusPill(
                            plan.status
                          )}`}
                        >
                          {plan.status}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-1 text-[13px] font-semibold tracking-tight text-[#49263D]">
                        {plan.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] capitalize text-[#795A70]">
                        {(plan.catalogSlug || plan.primaryGoal || "").replace(/_/g, " ")}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E6F3EC] pt-3">
                        <MiniRing
                          value={plan.completionRate || 0}
                          color={ringColor(plan.status)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#927C8B]">
                            Tasks
                          </p>
                          <p className="text-sm font-bold tabular-nums text-[#49263D]">
                            {plan.tasksCompleted}/{plan.tasksTotal}
                          </p>
                        </div>
                        <div className="rounded-xl bg-[#FFF1E9] px-2.5 py-1.5 text-right ring-1 ring-[#F0D5C4]">
                          <p className="flex items-center justify-end gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#C46B4A]">
                            <span className="material-symbols-outlined text-[14px]">
                              local_fire_department
                            </span>
                            Streak
                          </p>
                          <p className="text-sm font-bold tabular-nums text-[#49263D]">
                            {plan.currentStreak}d
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#795A70]">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
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
                  className="soft-btn !border-[#C6E8D6] !bg-[#EAF7EF] !text-[#287D58] hover:!bg-[#DDF1E6]"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Drawer
        isOpen={!!selected}
        onClose={() => {
          setSelected(null);
          setDetail(null);
        }}
        title={selected?.title || "Plan Details"}
        subtitle={selected?.user?.email || ""}
      >
        <div className="space-y-4 text-xs">
          {detailLoading ? (
            <div className="space-y-3">
              <div className="h-28 animate-pulse rounded-2xl bg-[#EAF7EF]" />
              <div className="h-20 animate-pulse rounded-2xl bg-[#EAF7EF]" />
            </div>
          ) : (
            <>
              <div className="relative space-y-3 overflow-hidden rounded-[22px] border border-[#CFE9DB] bg-white p-4 shadow-[0_8px_24px_rgba(40,125,88,0.07)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(ellipse 70% 60% at 0% 0%, rgba(234,247,239,0.95), transparent 55%), radial-gradient(ellipse 40% 50% at 100% 100%, rgba(255,241,233,0.7), transparent 60%)",
                  }}
                />
                <div className="relative space-y-3">
                  <DetailRow label="User">
                    {detail?.user?.name || selected?.user?.name}
                  </DetailRow>
                  <DetailRow label="Status">
                    <span
                      className={`text-[10px] uppercase tracking-wider ${statusPill(
                        detail?.plan?.status || selected?.status
                      )}`}
                    >
                      {detail?.plan?.status || selected?.status}
                    </span>
                  </DetailRow>
                  <DetailRow label="Goal">
                    {(detail?.plan?.primaryGoal || selected?.primaryGoal || "").replace(
                      /_/g,
                      " "
                    )}
                  </DetailRow>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[#795A70]">Completion</p>
                      <p className="mt-0.5 text-lg font-bold text-[#287D58]">
                        {detail?.plan?.completionRate ?? selected?.completionRate}%
                      </p>
                    </div>
                    <MiniRing
                      value={detail?.plan?.completionRate ?? selected?.completionRate ?? 0}
                      size={64}
                      stroke={6}
                      color={ringColor(detail?.plan?.status || selected?.status)}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-[#FFF1E9] px-3 py-2 ring-1 ring-[#F0D5C4]">
                    <span className="flex items-center gap-1 font-semibold text-[#C46B4A]">
                      <span className="material-symbols-outlined text-[15px]">
                        local_fire_department
                      </span>
                      Streak
                    </span>
                    <span className="font-semibold text-[#49263D]">
                      {detail?.plan?.currentStreak ?? selected?.currentStreak} / longest{" "}
                      {detail?.plan?.longestStreak ?? selected?.longestStreak}
                    </span>
                  </div>
                </div>
              </div>

              <details
                className="rounded-[22px] border border-[#CFE9DB] bg-white open:pb-0"
                open
              >
                <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-[#49263D] [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EAF7EF] text-[#287D58]">
                        <span className="material-symbols-outlined text-[15px]">route</span>
                      </span>
                      Journey details
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-[#795A70]">
                      expand_more
                    </span>
                  </span>
                </summary>
                <div className="border-t border-[#DDF1E6] px-4 py-3">
                  {detail?.plan?.assessment ? (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#287D58]">
                        Assessment intake
                      </p>
                      <div className="flex justify-between">
                        <span className="text-[#795A70]">Stress</span>
                        <span>{detail.plan.assessment.stressLevel ?? "—"}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#795A70]">Sleep</span>
                        <span className="capitalize">
                          {detail.plan.assessment.sleepQuality || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#795A70]">Daily time</span>
                        <span>{detail.plan.assessment.dailyTime || "—"}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#795A70]">
                      No assessment snapshot on this enrollment.
                    </p>
                  )}
                </div>
              </details>
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
}

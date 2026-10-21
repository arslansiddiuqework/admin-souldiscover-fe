"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useWellness } from "@/hooks/useWellness";
import { wellnessService } from "@/services/wellnessService";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/providers";

function MiniRing({ value, size = 56, stroke = 5 }: { value: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F7F0F5" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#B74783"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold tabular-nums text-[#49263D]">{Math.round(pct)}%</span>
      </div>
    </div>
  );
}

function statusTone(status?: string) {
  if (status === "completed") return "bg-[#E8F6EF] text-[#287D58] ring-[#C6E8D6]";
  if (status === "paused") return "bg-[#FFF1E9] text-[#D4845A] ring-[#F0D5C4]";
  return "bg-[#FFF0F6] text-[#B74783] ring-[#F0CADA]";
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
      { id: "all", label: "All", value: summary.totalEnrollments },
      { id: "active", label: "Active", value: summary.active },
      { id: "completed", label: "Done", value: summary.completed },
      { id: "paused", label: "Paused", value: summary.paused },
    ],
    [summary]
  );

  return (
    <div className="page-shell !space-y-0">
      {/* Atmosphere — wellness hub language */}
      <div className="relative -mx-1 overflow-hidden rounded-[28px] border border-[#EADCE5]/90 bg-[#FBF9FF] shadow-[0_18px_50px_rgba(123,57,98,0.08)]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,rgba(183,71,131,0.12),transparent_58%)]" />
          <div className="absolute -left-16 bottom-8 h-48 w-48 rounded-full bg-[rgba(183,71,131,0.07)] blur-3xl" />
          <div className="absolute right-0 top-24 h-56 w-56 rounded-full bg-[rgba(120,99,198,0.1)] blur-3xl" />
        </div>

        {/* Frosted desk */}
        <div className="relative m-3 overflow-hidden rounded-[24px] border border-[#EADCE5]/85 bg-white/82 shadow-[0_14px_40px_rgba(123,57,98,0.08)] backdrop-blur-xl sm:m-4">
          {/* Desk header */}
          <header className="relative border-b border-[#EADCE5]/70 bg-[linear-gradient(105deg,#FFF7FB_0%,#FFFFFF_42%,#F7F1FF_100%)] px-4 py-4 sm:px-6 sm:py-5">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(ellipse_at_right,rgba(217,184,245,0.3),transparent_70%)]"
            />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                  <span aria-hidden className="absolute inset-0 rounded-full bg-[#B74783]/15" />
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#B74783] text-white shadow-[0_8px_18px_rgba(183,71,131,0.32)]">
                    <span className="material-symbols-outlined text-[20px]">spa</span>
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B74783]">
                    Wellness desk
                  </p>
                  <h1 className="truncate text-[1.2rem] font-bold tracking-[-0.03em] text-[#49263D] sm:text-[1.4rem]">
                    Member plan journeys
                  </h1>
                  <p className="mt-0.5 text-[12px] text-[#795A70]">
                    Continue the same desk language as the app — today&apos;s enrollments first.
                  </p>
                </div>
              </div>

              {/* Compact Day/Done chips — not a KPI strip */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#49263D] ring-1 ring-[#EADCE5]">
                  <span className="material-symbols-outlined text-[14px] text-primary">groups</span>
                  {summary.totalEnrollments} enrolled
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F6] px-3 py-1.5 text-[11px] font-semibold text-[#B74783] ring-1 ring-[#F0CADA]">
                  <span className="material-symbols-outlined text-[14px]">donut_large</span>
                  {summary.avgCompletionRate}% avg
                </span>
              </div>
            </div>
          </header>

          {/* Week-tile status selector */}
          <div className="border-b border-[#EADCE5]/60 px-4 py-3 sm:px-6">
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
                    className={`min-w-[4.5rem] shrink-0 rounded-2xl px-3 py-2.5 text-left transition-all ${
                      active
                        ? "bg-gradient-to-br from-[#C45A92] to-[#B74783] text-white shadow-[0_8px_18px_rgba(183,71,131,0.28)]"
                        : "bg-[#FFF8FB] text-[#49263D] ring-1 ring-[#EADCE5] hover:ring-[#F0CADA]"
                    }`}
                  >
                    <p
                      className={`text-[9px] font-bold uppercase tracking-[0.12em] ${
                        active ? "text-white/80" : "text-[#927C8B]"
                      }`}
                    >
                      {tile.label}
                    </p>
                    <p className="mt-0.5 text-lg font-bold tabular-nums">{tile.value}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <div className="px-4 py-3 sm:px-6">
            <div className="field-shell max-w-lg">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant/80">
                search
              </span>
              <input
                className="field-input py-2.5 pl-11 pr-4 text-xs"
                placeholder="Search member, plan, or goal…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Journey cards grid */}
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-40 animate-pulse rounded-[22px] bg-[#FFF0F6]/70" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="empty-state rounded-[22px] border border-dashed border-[#EADCE5] bg-white/60 py-14">
                <div className="empty-state-icon">
                  <span className="material-symbols-outlined text-[28px]">spa</span>
                </div>
                <p className="text-sm font-semibold text-on-surface">No wellness enrollments yet</p>
                <p className="max-w-sm text-xs text-on-surface-variant">
                  Plans sync when users create or update them in the app.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {plans.map((plan) => (
                  <button
                    key={plan._id}
                    type="button"
                    onClick={() => openDetail(plan)}
                    className="group flex flex-col rounded-[22px] border border-[#EADCE5]/90 bg-white/95 p-4 text-left shadow-[0_8px_24px_rgba(123,57,98,0.05)] transition-all hover:-translate-y-0.5 hover:border-[#F0CADA] hover:shadow-[0_14px_32px_rgba(183,71,131,0.12)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0F6] text-sm font-bold text-primary ring-1 ring-[#F0CADA]">
                          {(plan.user?.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#49263D] group-hover:text-primary">
                            {plan.user?.name || "Unknown"}
                          </p>
                          <p className="truncate text-[10px] text-[#927C8B]">{plan.user?.email}</p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ${statusTone(
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

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#EADCE5]/70 pt-3">
                      <MiniRing value={plan.completionRate || 0} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#927C8B]">
                          Tasks
                        </p>
                        <p className="text-sm font-bold tabular-nums text-[#49263D]">
                          {plan.tasksCompleted}/{plan.tasksTotal}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="flex items-center justify-end gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#D4845A]">
                          <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                          Streak
                        </p>
                        <p className="text-sm font-bold tabular-nums text-[#49263D]">
                          {plan.currentStreak}d
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
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
                  className="soft-btn"
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
              <div className="h-28 animate-pulse rounded-2xl bg-[#FFF0F6]" />
              <div className="h-20 animate-pulse rounded-2xl bg-[#FFF0F6]" />
            </div>
          ) : (
            <>
              <div className="space-y-3 rounded-[22px] border border-[#EADCE5]/90 bg-white p-4 shadow-[0_8px_24px_rgba(123,57,98,0.05)]">
                <div className="flex justify-between">
                  <span className="text-[#795A70]">User</span>
                  <span className="font-semibold text-[#49263D]">
                    {detail?.user?.name || selected?.user?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#795A70]">Status</span>
                  <span className="font-semibold capitalize text-[#49263D]">
                    {detail?.plan?.status || selected?.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#795A70]">Goal</span>
                  <span className="font-semibold capitalize text-[#49263D]">
                    {(detail?.plan?.primaryGoal || selected?.primaryGoal || "").replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[#795A70]">Completion</p>
                    <p className="mt-0.5 text-lg font-bold text-[#49263D]">
                      {detail?.plan?.completionRate ?? selected?.completionRate}%
                    </p>
                  </div>
                  <MiniRing
                    value={detail?.plan?.completionRate ?? selected?.completionRate ?? 0}
                    size={64}
                    stroke={6}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-[#795A70]">Streak</span>
                  <span className="font-semibold text-[#49263D]">
                    {detail?.plan?.currentStreak ?? selected?.currentStreak} / longest{" "}
                    {detail?.plan?.longestStreak ?? selected?.longestStreak}
                  </span>
                </div>
              </div>

              <details className="rounded-[22px] border border-[#EADCE5]/90 bg-white open:pb-0" open>
                <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-[#49263D] [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between">
                    Journey details
                    <span className="material-symbols-outlined text-[18px] text-[#795A70]">
                      expand_more
                    </span>
                  </span>
                </summary>
                <div className="border-t border-[#EADCE5]/80 px-4 py-3">
                  {detail?.plan?.assessment ? (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B74783]">
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

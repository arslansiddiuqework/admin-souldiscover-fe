"use client";

import React from "react";
import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogs } from "@/hooks/useLogs";
import { AvatarImage } from "@/components/ui/avatar-image";
import { ScreenHero, MetricTile } from "@/components/layout/ScreenHero";

type WellTone = "violet" | "sky" | "peach" | "mint" | "orchid" | "alert";

const wellTone: Record<WellTone, { well: string; hover: string; text: string }> = {
  violet: {
    well: "bg-[#F0EAFE] text-[#7863C6]",
    hover: "hover:border-[#7863C6]/40 hover:bg-[#F0EAFE]/60",
    text: "group-hover:text-[#7863C6]",
  },
  sky: {
    well: "bg-[#EEF4FF] text-[#4F7FE8]",
    hover: "hover:border-[#4F7FE8]/40 hover:bg-[#EEF4FF]/70",
    text: "group-hover:text-[#4F7FE8]",
  },
  peach: {
    well: "bg-[#FFF1E9] text-[#C46B4A]",
    hover: "hover:border-[#C46B4A]/40 hover:bg-[#FFF1E9]/70",
    text: "group-hover:text-[#C46B4A]",
  },
  mint: {
    well: "bg-[#EAF7EF] text-[#287D58]",
    hover: "hover:border-[#287D58]/40 hover:bg-[#EAF7EF]/70",
    text: "group-hover:text-[#287D58]",
  },
  orchid: {
    well: "bg-[#FFE5F0] text-[#B74783]",
    hover: "hover:border-[#B74783]/40 hover:bg-[#FFF0F6]/80",
    text: "group-hover:text-[#B74783]",
  },
  alert: {
    well: "bg-[#FFF0F2] text-[#B4233D]",
    hover: "hover:border-[#B4233D]/40 hover:bg-[#FFF0F2]/70",
    text: "group-hover:text-[#B4233D]",
  },
};

function LinkedTile({
  href,
  ...tile
}: {
  href: string;
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: string;
  tone?: WellTone;
  spark?: number[];
}) {
  return (
    <Link
      href={href}
      className="group block rounded-[22px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
    >
      <MetricTile {...tile} />
    </Link>
  );
}

function ModuleLink({
  href,
  icon,
  title,
  subtitle,
  tone,
}: {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  tone: WellTone;
}) {
  const t = wellTone[tone];
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-3 rounded-2xl border border-border bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-card ${t.hover}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ring-black/5 ${t.well}`}
        >
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </span>
        <span
          className={`material-symbols-outlined text-[18px] text-on-surface-muted transition-all group-hover:translate-x-0.5 ${t.text}`}
        >
          arrow_outward
        </span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-on-surface">{title}</p>
        <p className="truncate text-[11px] text-on-surface-muted">{subtitle}</p>
      </div>
    </Link>
  );
}

function StatRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone: WellTone;
}) {
  const t = wellTone[tone];
  return (
    <div
      className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${t.well.split(" ")[0]}`}
    >
      <span className="text-xs font-medium text-on-surface-variant">{label}</span>
      <span className={`text-sm font-bold ${t.well.split(" ")[1]}`}>{value}</span>
    </div>
  );
}

const heroGhostBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20";

export default function DashboardPage() {
  const { metrics, trends, aiUsage, isLoading } = useAnalytics();
  const { logs: recentLogs, isLoading: isLogsLoading } = useLogs({
    category: "ALL",
    severity: "ALL",
    page: 1,
    limit: 6,
  });
  const [hoveredDay, setHoveredDay] = React.useState<string | null>(null);

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const todayLabel = React.useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    []
  );

  const weekDays = React.useMemo(() => {
    const rawData = trends.sessionsPerDay || [];
    const map = new Map(rawData.map((d) => [d._id, d.count]));
    const padded = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      padded.push({
        _id: dateStr,
        count: map.get(dateStr) || 0,
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }
    return padded;
  }, [trends.sessionsPerDay]);

  const weekTotal = React.useMemo(
    () => weekDays.reduce((sum, d) => sum + d.count, 0),
    [weekDays]
  );

  const maxCount = React.useMemo(
    () => Math.max(...weekDays.map((d) => d.count), 1),
    [weekDays]
  );

  const sessionSpark = React.useMemo(
    () => weekDays.map((d) => d.count),
    [weekDays]
  );

  const moodDelta = metrics.avgMoodScore - metrics.previousWeekAvgMoodScore;

  if (isLoading) {
    return (
      <div className="page-shell animate-pulse">
        <div className="h-52 rounded-[28px] bg-gradient-to-br from-[#401B36]/80 to-[#7863C6]/60" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="h-64 rounded-[24px] bg-[#F0EAFE] lg:col-span-4" />
          <div className="grid grid-cols-2 gap-3 lg:col-span-8 xl:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-[100px] rounded-[22px] border border-border bg-white/80" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="h-[340px] rounded-[22px] border border-border bg-white/70 xl:col-span-7" />
          <div className="h-[340px] rounded-[22px] border border-border bg-white/70 xl:col-span-5" />
        </div>
      </div>
    );
  }

  const showCrisisAlert = metrics.totalEscalations > 0;

  return (
    <div className="page-shell !space-y-4">
      {showCrisisAlert && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#B4233D]/20 bg-[#FFF0F2] px-4 py-2.5 text-center text-sm text-[#7A1427]">
          <span className="material-symbols-outlined text-[18px] text-[#B4233D]">
            warning
          </span>
          <span>
            {metrics.totalEscalations} crisis escalation
            {metrics.totalEscalations === 1 ? "" : "s"} on record · monitoring
            active
          </span>
          <Link
            href="/emergency"
            className="ml-2 font-semibold text-[#B4233D] underline-offset-2 hover:underline"
          >
            Review
          </Link>
        </div>
      )}

      {/* Plum asymmetric hero */}
      <ScreenHero
        tone="plum"
        eyebrow={todayLabel}
        title={
          <>
            {greeting},{" "}
            <span className="bg-gradient-to-r from-[#F9DCEB] via-[#C9B8FF] to-[#9CC0FF] bg-clip-text text-transparent">
              clinical overview
            </span>
          </>
        }
        description={`${metrics.weeklyActiveUsers} weekly active · ${metrics.weeklySessions} sessions this week · ${metrics.newUsersThisWeek} new users`}
        meta={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#86EFAC]" />
              Live
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#9CC0FF]/40 bg-[#4F7FE8]/25 px-2.5 py-1 text-[11px] font-semibold text-[#DCE8FF]">
              {metrics.avgMoodScore || 0} avg mood
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FDBA74]/40 bg-[#C46B4A]/25 px-2.5 py-1 text-[11px] font-semibold text-[#FFE3D3]">
              {metrics.escalationsThisWeek} escalations / wk
            </span>
          </>
        }
        actions={
          <>
            <Link href="/users" className={heroGhostBtn}>
              <span className="material-symbols-outlined text-[16px]">group</span>
              Users
            </Link>
            <Link href="/emergency" className="soft-btn-sky">
              <span className="material-symbols-outlined text-[16px]">emergency</span>
              Alerts
            </Link>
            <Link href="/analytics" className="soft-btn-violet">
              <span className="material-symbols-outlined text-[16px]">insights</span>
              Analytics
            </Link>
          </>
        }
        aside={
          <div className="relative mx-auto h-40 w-full max-w-[300px] shrink-0 overflow-hidden rounded-[24px] border border-white/15 bg-white/5 lg:mx-0 lg:h-44 lg:w-[300px]">
            {/* diagonal accent rail */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -right-6 -top-10 h-64 w-5 rotate-[24deg] bg-[#4F7FE8]/70" />
              <div className="absolute -right-0 -top-10 h-64 w-3 rotate-[24deg] bg-[#C46B4A]/80" />
              <div className="absolute right-9 -top-10 h-64 w-8 rotate-[24deg] bg-[#7863C6]/60" />
              <div className="absolute right-[4.5rem] -top-10 h-64 w-2 rotate-[24deg] bg-[#287D58]/80" />
            </div>
            <div className="relative flex h-full flex-col justify-between p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F9DCEB]">
                This week
              </p>
              <div>
                <p className="text-6xl font-black leading-none tracking-tighter text-white">
                  {weekTotal}
                </p>
                <p className="mt-1 text-xs font-medium text-[#E4D7F5]">
                  therapy sessions · {metrics.weeklyMessageCount || 0} messages
                </p>
              </div>
            </div>
          </div>
        }
      />

      {/* Bento mosaic */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <Link
          href="/users"
          className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-[24px] p-5 text-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover lg:col-span-4"
          style={{
            backgroundImage:
              "linear-gradient(145deg, #5B3FA8 0%, #7863C6 55%, #4F7FE8 120%)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 right-6 h-36 w-36 rounded-full bg-[#C46B4A]/30 blur-2xl"
          />
          <div className="relative flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
              <span className="material-symbols-outlined text-[22px]">groups</span>
            </span>
            <span className="material-symbols-outlined text-[18px] opacity-0 transition-opacity group-hover:opacity-100">
              arrow_outward
            </span>
          </div>
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
              Registered users
            </p>
            <p className="mt-1 text-6xl font-black leading-none tracking-tighter">
              {metrics.totalUsers}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold ring-1 ring-white/25">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +{metrics.newUsersThisWeek} this week
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-8 xl:grid-cols-3">
          <LinkedTile
            href="/sessions"
            icon="forum"
            label="Active sessions"
            value={metrics.activeSessions}
            hint={`${metrics.totalSessions} total lifetime`}
            tone="sky"
            spark={sessionSpark}
          />
          <LinkedTile
            href="/sessions"
            icon="psychology"
            label="Weekly sessions"
            value={metrics.weeklySessions}
            hint={`${metrics.avgSessionMinutes || 0} min avg`}
            tone="violet"
            spark={sessionSpark}
          />
          <LinkedTile
            href="/emergency"
            icon="emergency"
            label="Escalations / week"
            value={metrics.escalationsThisWeek}
            hint={`${metrics.totalEscalations} all-time`}
            tone={metrics.escalationsThisWeek > 0 ? "alert" : "mint"}
          />
          <LinkedTile
            href="/wellness"
            icon="spa"
            label="Wellness plans"
            value={metrics.activeWellnessPlans || 0}
            hint={`${metrics.totalWellnessEnrollments || 0} enrolled`}
            tone="mint"
          />
          <LinkedTile
            href="/consultations"
            icon="event_available"
            label="Consultations"
            value={metrics.upcomingConsultations || 0}
            hint={`${metrics.totalConsultations || 0} total`}
            tone="peach"
          />
          <LinkedTile
            href="/assessments"
            icon="quiz"
            label="Assessments"
            value={metrics.assessmentCompletionsThisWeek || 0}
            hint={`${metrics.totalAssessmentCompletions || 0} completed`}
            tone="sky"
          />
          <LinkedTile
            href="/engagement"
            icon="mood"
            label="Avg mood"
            value={`${metrics.avgMoodScore || 0}`}
            hint={
              moodDelta === 0
                ? "vs last week · flat"
                : `vs last week · ${moodDelta > 0 ? "+" : ""}${moodDelta}`
            }
            tone="orchid"
          />
          <LinkedTile
            href="/engagement"
            icon="fitness_center"
            label="Activities / week"
            value={metrics.weeklyActivities || 0}
            hint={`${metrics.weeklyActivityCompletionRate || 0}% completion`}
            tone="peach"
          />
          <LinkedTile
            href="/engagement"
            icon="favorite"
            label="Benefit rate"
            value={`${Math.round(metrics.recoveryRate || 0)}%`}
            hint={`${metrics.benefitedUsersThisWeek || 0} benefited`}
            tone="mint"
          />
          <LinkedTile
            href="/ai-usage"
            icon="smart_toy"
            label="AI chat today"
            value={aiUsage?.globalDay ?? "—"}
            hint={
              aiUsage
                ? `${aiUsage.globalDay}/${aiUsage.dailyLimit} day · ${aiUsage.globalMonth}/${aiUsage.monthlyLimit} mo`
                : "Quota tracking"
            }
            tone="violet"
          />
        </div>
      </section>

      {/* Chart + activity */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="panel flex flex-col p-5 xl:col-span-7">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-on-surface">
                  Session velocity
                </h2>
                <span className="badge-sky">7 days</span>
              </div>
              <p className="mt-0.5 text-xs text-on-surface-muted">
                Therapy sessions started per day
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-[#7863C6]/25 bg-[#F0EAFE] px-3 py-1.5 text-right">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#5B3FA8]/80">
                  Week total
                </p>
                <p className="text-lg font-bold leading-none text-[#5B3FA8]">
                  {weekTotal}
                </p>
              </div>
              <div className="rounded-xl border border-[#4F7FE8]/25 bg-[#EEF4FF] px-3 py-1.5 text-right">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#315FC2]/80">
                  Messages
                </p>
                <p className="text-lg font-bold leading-none text-[#315FC2]">
                  {metrics.weeklyMessageCount || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex h-[220px] items-end gap-2 sm:gap-3">
            {weekDays.map((day, idx) => {
              const pct = Math.max((day.count / maxCount) * 100, day.count === 0 ? 6 : 12);
              const active = hoveredDay === day._id;
              const isSky = idx % 2 === 0;
              const isPeak = day.count > 0 && day.count === maxCount;
              return (
                <div
                  key={day._id}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  onMouseEnter={() => setHoveredDay(day._id)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <div className="relative flex w-full flex-1 items-end justify-center">
                    {active && (
                      <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-[#401B36] px-2 py-1 text-[10px] font-semibold text-white shadow-popover">
                        {day.count} session{day.count === 1 ? "" : "s"}
                      </div>
                    )}
                    {isPeak && !active && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full rounded-full bg-[#C46B4A] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
                        peak
                      </span>
                    )}
                    <div
                      className={`w-full max-w-[44px] rounded-t-xl transition-all duration-300 ${
                        day.count > 0
                          ? isSky
                            ? "bg-gradient-to-t from-[#315FC2] via-[#4F7FE8] to-[#A9C4FF]"
                            : "bg-gradient-to-t from-[#5B3FA8] via-[#7863C6] to-[#C9BBF3]"
                          : "bg-gradient-to-t from-[#E7E1F3] to-[#F5F2FF]"
                      } ${active ? "opacity-100 ring-2 ring-[#7863C6]/30" : "opacity-90"}`}
                      style={{ height: `${pct}%`, minHeight: 10 }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-semibold text-on-surface-muted">
                      {day.label}
                    </p>
                    <p className="text-[11px] font-bold text-on-surface">{day.count}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {weekTotal === 0 && (
            <p className="mt-3 rounded-xl border border-dashed border-[#7863C6]/30 bg-[#F0EAFE]/60 px-3 py-2 text-center text-[11px] text-on-surface-muted">
              No therapy sessions logged this week yet — bars stay ready for live
              traffic.
            </p>
          )}
        </div>

        {/* Activity feed */}
        <div className="panel flex flex-col xl:col-span-5">
          <div className="panel-header">
            <div>
              <h2 className="text-base font-bold tracking-tight text-on-surface">
                Live activity
              </h2>
              <p className="text-[11px] text-on-surface-muted">
                Auth, security, and system events
              </p>
            </div>
            <Link href="/logs" className="badge-violet hover:brightness-95">
              View all
            </Link>
          </div>

          <div className="flex-1 divide-y divide-border">
            {isLogsLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-[#EBE6F2]" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-1/3 rounded bg-[#EBE6F2]" />
                    <div className="h-2 w-3/4 rounded bg-[#EBE6F2]" />
                  </div>
                </div>
              ))
            ) : recentLogs.length === 0 ? (
              <div className="empty-state py-10">
                <div className="empty-state-icon">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <p className="text-xs text-on-surface-muted">No recent logs</p>
              </div>
            ) : (
              recentLogs.map((log: any) => {
                const isCritical =
                  log.severity === "CRITICAL" || log.category === "CRISIS";
                const isWarning =
                  log.severity === "WARNING" || log.category === "SECURITY";

                let tone: WellTone = "violet";
                let icon = "info";
                let title = "System";
                if (isCritical) {
                  tone = "alert";
                  icon = "priority_high";
                } else if (isWarning) {
                  tone = "peach";
                  icon = "shield";
                } else if (log.category === "AUTH") {
                  tone = "sky";
                  icon = "login";
                } else {
                  tone = "mint";
                }
                if (log.category === "CRISIS") title = "Emergency";
                else if (log.category === "AUTH") title = "Access";
                else if (log.category === "SECURITY") title = "Security";

                const t = wellTone[tone];
                const railColor = {
                  violet: "#7863C6",
                  sky: "#4F7FE8",
                  peach: "#C46B4A",
                  mint: "#287D58",
                  orchid: "#B74783",
                  alert: "#B4233D",
                }[tone];

                return (
                  <div
                    key={log.id || log._id}
                    className="relative flex gap-3 px-4 py-3 pl-5 transition-colors hover:bg-[#FAF8FF]"
                  >
                    <span
                      aria-hidden
                      className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full"
                      style={{ backgroundColor: railColor }}
                    />
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-black/5 ${
                        log.userProfileImage ? "bg-white" : t.well
                      }`}
                    >
                      {log.userProfileImage ? (
                        <AvatarImage
                          src={log.userProfileImage}
                          alt=""
                          width={36}
                          height={36}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">
                          {icon}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-on-surface">
                          {title}
                        </p>
                        {isCritical && (
                          <span className="badge-error !px-1.5 !py-0 !text-[9px]">
                            Critical
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-on-surface-variant">
                        {log.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Lower ops row */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="panel p-4 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface">Safety pulse</h2>
            <span className="badge badge-error">Emergency</span>
          </div>
          <div className="space-y-2.5">
            <StatRow
              label="High-risk sessions"
              value={metrics.weeklyHighRiskSessions || 0}
              tone="alert"
            />
            <StatRow
              label="Needs follow-up"
              value={metrics.needsFollowUpUsers || 0}
              tone="peach"
            />
            <StatRow
              label="Not recovered"
              value={metrics.notRecoveredUsersThisWeek || 0}
              tone="orchid"
            />
            <Link href="/emergency" className="soft-btn mt-1 w-full">
              Open emergency desk
            </Link>
          </div>
        </div>

        <div className="panel p-4 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface">Care programs</h2>
            <span className="badge-peach">Growth</span>
          </div>
          <div className="space-y-2.5">
            <StatRow
              label="Active wellness"
              value={metrics.activeWellnessPlans || 0}
              tone="mint"
            />
            <StatRow
              label="Wellness completion"
              value={`${metrics.avgWellnessCompletionRate || 0}%`}
              tone="sky"
            />
            <StatRow
              label="Assessments in progress"
              value={metrics.assessmentInProgressSessions || 0}
              tone="violet"
            />
            <Link href="/wellness" className="soft-btn mt-1 w-full">
              Manage wellness
            </Link>
          </div>
        </div>

        <div className="panel p-4 lg:col-span-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-on-surface">Jump to module</h2>
              <p className="text-[11px] text-on-surface-muted">
                Fast paths across the admin console
              </p>
            </div>
            <span className="badge-violet">Shortcuts</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <ModuleLink
              href="/users"
              icon="group"
              title="Users"
              subtitle="Accounts & status"
              tone="violet"
            />
            <ModuleLink
              href="/sessions"
              icon="medical_services"
              title="Sessions"
              subtitle="Therapy transcripts"
              tone="sky"
            />
            <ModuleLink
              href="/engagement"
              icon="monitoring"
              title="Engagement"
              subtitle="Mood & activities"
              tone="orchid"
            />
            <ModuleLink
              href="/ai-usage"
              icon="smart_toy"
              title="AI Usage"
              subtitle="Chat quotas"
              tone="violet"
            />
            <ModuleLink
              href="/consultations"
              icon="event_available"
              title="Consultations"
              subtitle="Bookings & schedule"
              tone="peach"
            />
            <ModuleLink
              href="/settings"
              icon="settings"
              title="Settings"
              subtitle="Crisis thresholds"
              tone="mint"
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col items-start justify-between gap-3 rounded-[20px] border border-border bg-white/85 px-4 py-3 shadow-xs sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {[
            { label: "API healthy", color: "#287D58" },
            { label: "Logs streaming", color: "#4F7FE8" },
            { label: "Auth protected", color: "#7863C6" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] font-medium text-on-surface">
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-on-surface-muted">
          Soul Discovery Admin · live metrics
        </p>
      </section>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogs } from "@/hooks/useLogs";
import { AvatarImage } from "@/components/ui/avatar-image";

function MiniStat({
  label,
  value,
  hint,
  icon,
  href,
  accent = "orchid",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: string;
  href: string;
  accent?: "orchid" | "lavender" | "alert" | "success";
}) {
  const accents = {
    orchid: "from-[#FFF0F6] to-white text-primary",
    lavender: "from-[#F4E8FF] to-white text-[#6A4FA8]",
    alert: "from-[#FFF0F2] to-white text-error",
    success: "from-[#EAF7EF] to-white text-success",
  }[accent];

  return (
    <Link
      href={href}
      className={`group relative flex min-h-[118px] flex-col justify-between overflow-hidden rounded-[20px] border border-border bg-gradient-to-br ${accents} p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card-hover`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 ring-1 ring-border shadow-xs">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </span>
        <span className="material-symbols-outlined text-[16px] text-on-surface-muted opacity-0 transition-opacity group-hover:opacity-100">
          arrow_outward
        </span>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-muted">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-on-surface">
          {value}
        </p>
        {hint ? (
          <p className="mt-1 text-[11px] text-on-surface-variant">{hint}</p>
        ) : null}
      </div>
    </Link>
  );
}

function ModuleLink({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-white/80 p-3.5 transition-all hover:border-primary/25 hover:bg-[#FFF0F6]"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#FFE5F0] text-primary ring-1 ring-border">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-on-surface">{title}</p>
        <p className="truncate text-[11px] text-on-surface-muted">{subtitle}</p>
      </div>
      <span className="material-symbols-outlined text-[18px] text-on-surface-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary">
        chevron_right
      </span>
    </Link>
  );
}

export default function DashboardPage() {
  const { metrics, trends, isLoading } = useAnalytics();
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

  const moodDelta = metrics.avgMoodScore - metrics.previousWeekAvgMoodScore;

  if (isLoading) {
    return (
      <div className="page-shell animate-pulse">
        <div className="h-28 rounded-[24px] border border-border bg-white/70" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 rounded-[20px] border border-border bg-white/70" />
          ))}
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
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-error/20 bg-error-container px-4 py-2.5 text-center text-sm text-on-error-container">
          <span className="material-symbols-outlined text-[18px] text-error">
            warning
          </span>
          <span>
            {metrics.totalEscalations} crisis escalation
            {metrics.totalEscalations === 1 ? "" : "s"} on record · monitoring
            active
          </span>
          <Link
            href="/emergency"
            className="ml-2 font-semibold text-error underline-offset-2 hover:underline"
          >
            Review
          </Link>
        </div>
      )}

      {/* Compact command bar */}
      <section className="relative overflow-hidden rounded-[24px] border border-border bg-white/90 px-5 py-4 shadow-card sm:px-6">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 120% at 0% 50%, rgba(255,229,240,0.85), transparent 55%), radial-gradient(ellipse 40% 100% at 100% 0%, rgba(241,234,255,0.7), transparent 50%)",
          }}
        />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              {todayLabel}
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-on-surface sm:text-2xl">
              {greeting} ·{" "}
              <span className="text-gradient-brand">Clinical overview</span>
            </h1>
            <p className="mt-1 text-xs text-on-surface-variant sm:text-sm">
              {metrics.weeklyActiveUsers} weekly active · {metrics.weeklySessions}{" "}
              sessions this week · {metrics.newUsersThisWeek} new users
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/users" className="soft-btn">
              <span className="material-symbols-outlined text-[16px]">group</span>
              Users
            </Link>
            <Link href="/emergency" className="soft-btn-primary">
              <span className="material-symbols-outlined text-[16px]">
                emergency
              </span>
              Alerts
            </Link>
            <Link
              href="/analytics"
              className="soft-btn !border-transparent !bg-[#F1EAFF] !text-[#6A4FA8] hover:!bg-[#E9DFFF]"
            >
              <span className="material-symbols-outlined text-[16px]">
                insights
              </span>
              Analytics
            </Link>
          </div>
        </div>
      </section>

      {/* Primary + secondary KPI denser grid */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-4">
        <MiniStat
          href="/users"
          icon="groups"
          label="Registered users"
          value={metrics.totalUsers}
          hint={`+${metrics.newUsersThisWeek} this week`}
          accent="orchid"
        />
        <MiniStat
          href="/sessions"
          icon="forum"
          label="Active sessions"
          value={metrics.activeSessions}
          hint={`${metrics.totalSessions} total lifetime`}
          accent="lavender"
        />
        <MiniStat
          href="/sessions"
          icon="psychology"
          label="Weekly sessions"
          value={metrics.weeklySessions}
          hint={`${metrics.avgSessionMinutes || 0} min avg`}
          accent="orchid"
        />
        <MiniStat
          href="/emergency"
          icon="emergency"
          label="Escalations / week"
          value={metrics.escalationsThisWeek}
          hint={`${metrics.totalEscalations} all-time`}
          accent={metrics.escalationsThisWeek > 0 ? "alert" : "success"}
        />
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MiniStat
          href="/wellness"
          icon="spa"
          label="Wellness plans"
          value={metrics.activeWellnessPlans || 0}
          hint={`${metrics.totalWellnessEnrollments || 0} enrolled`}
          accent="lavender"
        />
        <MiniStat
          href="/consultations"
          icon="event_available"
          label="Consultations"
          value={metrics.upcomingConsultations || 0}
          hint={`${metrics.totalConsultations || 0} total`}
          accent="orchid"
        />
        <MiniStat
          href="/assessments"
          icon="quiz"
          label="Assessments"
          value={metrics.assessmentCompletionsThisWeek || 0}
          hint={`${metrics.totalAssessmentCompletions || 0} completed`}
          accent="lavender"
        />
        <MiniStat
          href="/analytics"
          icon="mood"
          label="Avg mood"
          value={`${metrics.avgMoodScore || 0}`}
          hint={
            moodDelta === 0
              ? "vs last week · flat"
              : `vs last week · ${moodDelta > 0 ? "+" : ""}${moodDelta}`
          }
          accent="success"
        />
        <MiniStat
          href="/analytics"
          icon="fitness_center"
          label="Activities / week"
          value={metrics.weeklyActivities || 0}
          hint={`${metrics.weeklyActivityCompletionRate || 0}% completion`}
          accent="orchid"
        />
        <MiniStat
          href="/analytics"
          icon="favorite"
          label="Benefit rate"
          value={`${Math.round(metrics.recoveryRate || 0)}%`}
          hint={`${metrics.benefitedUsersThisWeek || 0} benefited`}
          accent="lavender"
        />
      </section>

      {/* Chart + activity + ops */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Bar chart — readable even at zero */}
        <div className="panel flex flex-col p-5 xl:col-span-7">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold tracking-tight text-on-surface">
                Session volume
              </h2>
              <p className="mt-0.5 text-xs text-on-surface-muted">
                Therapy sessions started per day · last 7 days
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-border bg-[#FFF8FB] px-3 py-1.5 text-right">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-on-surface-muted">
                  Week total
                </p>
                <p className="text-lg font-bold leading-none text-primary">
                  {weekTotal}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-white px-3 py-1.5 text-right">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-on-surface-muted">
                  Messages
                </p>
                <p className="text-lg font-bold leading-none text-on-surface">
                  {metrics.weeklyMessageCount || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex h-[220px] items-end gap-2 sm:gap-3">
            {weekDays.map((day) => {
              const pct = Math.max((day.count / maxCount) * 100, day.count === 0 ? 6 : 12);
              const active = hoveredDay === day._id;
              return (
                <div
                  key={day._id}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  onMouseEnter={() => setHoveredDay(day._id)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <div className="relative flex w-full flex-1 items-end justify-center">
                    {active && (
                      <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-border bg-white px-2 py-1 text-[10px] font-semibold text-on-surface shadow-popover">
                        {day.count} session{day.count === 1 ? "" : "s"}
                      </div>
                    )}
                    <div
                      className={`w-full max-w-[44px] rounded-t-xl transition-all duration-300 ${
                        day.count > 0
                          ? "bg-gradient-to-t from-[#9F376F] via-[#B74783] to-[#D9B8F5]"
                          : "bg-gradient-to-t from-[#EADCE5] to-[#F5F2FF]"
                      } ${active ? "opacity-100 ring-2 ring-primary/20" : "opacity-90"}`}
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
            <p className="mt-3 rounded-xl border border-dashed border-border bg-[#FFF8FB] px-3 py-2 text-center text-[11px] text-on-surface-muted">
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
            <Link
              href="/logs"
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="flex-1 divide-y divide-border">
            {isLogsLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-[#F1E9EF]" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-1/3 rounded bg-[#F1E9EF]" />
                    <div className="h-2 w-3/4 rounded bg-[#F1E9EF]" />
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
                const tone = isCritical
                  ? "bg-error-container text-error"
                  : isWarning
                  ? "bg-warning-container text-warning"
                  : "bg-primary-container text-primary";
                const icon = isCritical
                  ? "priority_high"
                  : isWarning
                  ? "shield"
                  : log.category === "AUTH"
                  ? "login"
                  : "info";
                const title =
                  log.category === "CRISIS"
                    ? "Emergency"
                    : log.category === "AUTH"
                    ? "Access"
                    : log.category === "SECURITY"
                    ? "Security"
                    : "System";

                return (
                  <div
                    key={log.id || log._id}
                    className="flex gap-3 px-4 py-3 transition-colors hover:bg-[#FFF0F6]/70"
                  >
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-border ${
                        log.userProfileImage ? "bg-white" : tone
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
        <div className="panel p-4 lg:col-span-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface">Safety pulse</h2>
            <span className="badge badge-error">Emergency</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between rounded-xl bg-[#FFF0F2] px-3 py-2.5">
              <span className="text-xs text-on-surface-variant">High-risk sessions</span>
              <span className="text-sm font-bold text-error">
                {metrics.weeklyHighRiskSessions || 0}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#FFF8FB] px-3 py-2.5">
              <span className="text-xs text-on-surface-variant">Needs follow-up</span>
              <span className="text-sm font-bold text-on-surface">
                {metrics.needsFollowUpUsers || 0}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#FFF8FB] px-3 py-2.5">
              <span className="text-xs text-on-surface-variant">Not recovered</span>
              <span className="text-sm font-bold text-on-surface">
                {metrics.notRecoveredUsersThisWeek || 0}
              </span>
            </div>
            <Link href="/emergency" className="soft-btn mt-1 w-full">
              Open emergency desk
            </Link>
          </div>
        </div>

        <div className="panel p-4 lg:col-span-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface">Care programs</h2>
            <span className="badge badge-primary">Growth</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between rounded-xl bg-[#F4E8FF]/70 px-3 py-2.5">
              <span className="text-xs text-on-surface-variant">Active wellness</span>
              <span className="text-sm font-bold text-on-surface">
                {metrics.activeWellnessPlans || 0}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#FFF8FB] px-3 py-2.5">
              <span className="text-xs text-on-surface-variant">
                Wellness completion
              </span>
              <span className="text-sm font-bold text-on-surface">
                {metrics.avgWellnessCompletionRate || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#FFF8FB] px-3 py-2.5">
              <span className="text-xs text-on-surface-variant">
                Assessments in progress
              </span>
              <span className="text-sm font-bold text-on-surface">
                {metrics.assessmentInProgressSessions || 0}
              </span>
            </div>
            <Link href="/wellness" className="soft-btn mt-1 w-full">
              Manage wellness
            </Link>
          </div>
        </div>

        <div className="panel p-4 lg:col-span-4">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-on-surface">Jump to module</h2>
            <p className="text-[11px] text-on-surface-muted">
              Fast paths across the admin console
            </p>
          </div>
          <div className="space-y-2">
            <ModuleLink
              href="/users"
              icon="group"
              title="Users"
              subtitle="Accounts & status"
            />
            <ModuleLink
              href="/sessions"
              icon="medical_services"
              title="Sessions"
              subtitle="Therapy transcripts"
            />
            <ModuleLink
              href="/consultations"
              icon="event_available"
              title="Consultations"
              subtitle="Bookings & schedule"
            />
            <ModuleLink
              href="/settings"
              icon="settings"
              title="Settings"
              subtitle="Crisis thresholds"
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col items-start justify-between gap-3 rounded-[20px] border border-border bg-white/80 px-4 py-3 shadow-xs sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {[
            "API healthy",
            "Logs streaming",
            "Auth protected",
          ].map((label) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[11px] font-medium text-on-surface">{label}</span>
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

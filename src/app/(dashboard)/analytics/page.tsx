"use client";

import React from "react";
import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricTile } from "@/components/layout/ScreenHero";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/** Brand orchid #B74783 */
const BRAND_ORCHID: [number, number, number] = [183, 71, 131];
const BRAND_INK: [number, number, number] = [73, 38, 61];
const BRAND_MUTED: [number, number, number] = [121, 90, 112];
const BRAND_SOFT_BG: [number, number, number] = [255, 248, 251];
const BRAND_BORDER: [number, number, number] = [234, 220, 229];
const BRAND_ALT_ROW: [number, number, number] = [247, 232, 243];

const formatNumber = (value: number) => value.toLocaleString();
const formatPercent = (value: number) => `${Math.round(value)}%`;
const formatMoodChange = (value: number) => `${value > 0 ? "+" : ""}${value}`;

const getLastTableY = (doc: jsPDF, fallback: number) => {
  const tableDoc = doc as jsPDF & { lastAutoTable?: { finalY?: number } };
  return tableDoc.lastAutoTable?.finalY ?? fallback;
};

const ensurePageSpace = (doc: jsPDF, y: number, requiredHeight: number) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + requiredHeight <= pageHeight - 18) return y;
  doc.addPage();
  return 18;
};

const addSectionTitle = (doc: jsPDF, title: string, y: number) => {
  const safeY = ensurePageSpace(doc, y, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND_INK);
  doc.text(title, 14, safeY);
  doc.setDrawColor(...BRAND_ORCHID);
  doc.setLineWidth(0.8);
  doc.line(14, safeY + 3, 196, safeY + 3);
  return safeY + 9;
};

const addWrappedText = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 5
) => {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
};

const addMetricCard = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  title: string,
  value: string,
  note: string,
  accent: [number, number, number] = BRAND_ORCHID
) => {
  doc.setFillColor(...BRAND_SOFT_BG);
  doc.setDrawColor(...BRAND_BORDER);
  doc.roundedRect(x, y, width, 24, 2, 2, "FD");
  doc.setFillColor(...accent);
  doc.rect(x, y, 2, 24, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_MUTED);
  doc.text(title.toUpperCase(), x + 5, y + 6);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_INK);
  doc.text(value, x + 5, y + 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...BRAND_MUTED);
  doc.text(doc.splitTextToSize(note, width - 8), x + 5, y + 20);
};

function ProgressRing({
  value,
  max = 100,
  size = 96,
  stroke = 9,
  label,
  sublabel,
  color = "#7863C6",
  color2 = "#4F7FE8",
  track = "#ECE6F7",
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label: string;
  sublabel?: string;
  color?: string;
  color2?: string;
  track?: string;
}) {
  const gradId = `ring-${React.useId().replace(/:/g, "")}`;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, max === 0 ? 0 : (value / max) * 100));
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={color2} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={track}
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black tracking-tight text-[#401B36]">
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-bold text-on-surface">{label}</p>
        {sublabel ? (
          <p className="text-[10px] text-on-surface-muted">{sublabel}</p>
        ) : null}
      </div>
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  detail,
  color = "from-[#7863C6] to-[#4F7FE8]",
}: {
  label: string;
  value: number;
  max: number;
  detail?: string;
  color?: string;
}) {
  const pct = max <= 0 ? 0 : Math.max(4, Math.round((value / max) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-2">
        <p className="truncate text-sm font-medium capitalize text-on-surface">
          {label}
        </p>
        <p className="shrink-0 text-xs font-bold text-on-surface">
          {formatNumber(value)}
          {detail ? (
            <span className="ml-1 font-medium text-on-surface-muted">{detail}</span>
          ) : null}
        </p>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#ECE6F7]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

type Tone = "violet" | "sky" | "peach" | "mint" | "orchid" | "alert";

const toneWell: Record<Tone, string> = {
  violet: "bg-[#F0EAFE] text-[#7863C6]",
  sky: "bg-[#EEF4FF] text-[#4F7FE8]",
  peach: "bg-[#FFF1E9] text-[#C46B4A]",
  mint: "bg-[#EAF7EF] text-[#287D58]",
  orchid: "bg-[#FFE5F0] text-[#B74783]",
  alert: "bg-[#FFF0F2] text-[#B4233D]",
};

const toneSolid: Record<Tone, string> = {
  violet: "#7863C6",
  sky: "#4F7FE8",
  peach: "#C46B4A",
  mint: "#287D58",
  orchid: "#B74783",
  alert: "#B4233D",
};

function GlassStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
      <span
        aria-hidden
        className="absolute inset-y-2 left-0 w-1 rounded-r-full"
        style={{ backgroundColor: accent }}
      />
      <p className="pl-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#E4D7F5]">
        {label}
      </p>
      <p className="mt-0.5 pl-1 text-xl font-black tracking-tight text-white">{value}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { metrics, trends, aiUsage, isLoading } = useAnalytics();
  const [hoveredDay, setHoveredDay] = React.useState<string | null>(null);

  const weekDays = React.useMemo(() => {
    const raw = trends.sessionsPerDay || [];
    const map = new Map(raw.map((d) => [d._id, d.count]));
    const padded = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const id = d.toISOString().split("T")[0];
      padded.push({
        _id: id,
        count: map.get(id) || 0,
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }
    return padded;
  }, [trends.sessionsPerDay]);

  const weekTotal = React.useMemo(
    () => weekDays.reduce((s, d) => s + d.count, 0),
    [weekDays]
  );
  const maxDay = React.useMemo(
    () => Math.max(...weekDays.map((d) => d.count), 1),
    [weekDays]
  );

  const moodDelta = metrics.avgMoodScore - metrics.previousWeekAvgMoodScore;
  const moodCoverage =
    metrics.totalUsers > 0
      ? Math.round((metrics.outcomeTrackedUsers / metrics.totalUsers) * 100)
      : 0;

  const activityMax = React.useMemo(() => {
    const list = trends.activityBreakdown || [];
    return Math.max(...list.map((i) => i.count || 0), 1);
  }, [trends.activityBreakdown]);

  const wellnessMax = React.useMemo(() => {
    const list = trends.wellnessByGoal || [];
    return Math.max(...list.map((i: any) => i.count || 0), 1);
  }, [trends.wellnessByGoal]);

  const assessmentMax = React.useMemo(() => {
    const list = trends.assessmentsBySlug || [];
    return Math.max(...list.map((i: any) => i.count || 0), 1);
  }, [trends.assessmentsBySlug]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const generatedAt = new Date();
    const periodStart = new Date(generatedAt.getTime() - 7 * 24 * 60 * 60 * 1000);
    const reportPeriod = `${periodStart.toLocaleDateString()} - ${generatedAt.toLocaleDateString()}`;
    const recommendations = [
      metrics.notRecoveredUsersThisWeek > 0
        ? `${metrics.notRecoveredUsersThisWeek} tracked user(s) are not recovered this week. Prioritize follow-up, review recent sessions, and encourage a low-friction check-in.`
        : "No tracked users met the not-recovered definition this week.",
      metrics.outcomeTrackedUsers < metrics.totalUsers
        ? `Only ${moodCoverage}% of total users had enough mood check-ins for outcome tracking. Prompt more users to log mood at least twice weekly.`
        : "Total users have enough mood data for stronger outcome tracking.",
      metrics.weeklyHighRiskSessions > 0 || metrics.escalationsThisWeek > 0
        ? "Review high-risk sessions and emergency logs to confirm safety workflows were completed and documented."
        : "No high-risk sessions or emergency escalations were detected in the weekly analytics window.",
      metrics.weeklyActivities > 0 && metrics.weeklyActivityCompletionRate < 60
        ? "Activity completion is below 60%. Consider shorter calming activities and clearer post-session nudges."
        : "Activity completion is stable. Keep surfacing activities after stressful or high-intensity conversations.",
    ];

    doc.setFillColor(...BRAND_ORCHID);
    doc.rect(0, 0, 210, 38, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("Soul Discovery", 14, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(255, 240, 246);
    doc.text("Weekly Operational Impact Report", 14, 26);
    doc.setFontSize(10);
    doc.text(`Report period: ${reportPeriod}`, 14, 32);
    doc.text(`Generated: ${generatedAt.toLocaleString()}`, 132, 32);

    let y = 50;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...BRAND_INK);
    doc.text("Executive Summary", 14, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND_MUTED);
    const summaryText =
      metrics.outcomeTrackedUsers > 0
        ? `Soul Discovery supported ${formatNumber(metrics.weeklyActiveUsers)} active user(s) this week across ${formatNumber(metrics.weeklySessions)} therapy session(s), ${formatNumber(metrics.weeklyMessageCount)} chat message(s), and ${formatNumber(metrics.weeklyActivities)} logged therapeutic activity item(s). Based on users with at least two mood check-ins this week, ${formatNumber(metrics.benefitedUsersThisWeek)} user(s) showed measurable benefit, while ${formatNumber(metrics.notRecoveredUsersThisWeek)} user(s) are not recovered and should be prioritized for follow-up.`
        : `Soul Discovery supported ${formatNumber(metrics.weeklyActiveUsers)} active user(s) this week across ${formatNumber(metrics.weeklySessions)} therapy session(s), ${formatNumber(metrics.weeklyMessageCount)} chat message(s), and ${formatNumber(metrics.weeklyActivities)} logged therapeutic activity item(s). No users had enough mood check-ins for reliable weekly outcome classification, so recovery metrics should be treated as unavailable rather than zero-impact.`;
    y = addWrappedText(doc, summaryText, 14, y, 182, 5) + 6;

    addMetricCard(doc, 14, y, 42, "Benefited", formatNumber(metrics.benefitedUsersThisWeek), "Improved mood by 5+ points");
    addMetricCard(doc, 60, y, 42, "Not recovered", formatNumber(metrics.notRecoveredUsersThisWeek), "Low mood and no clear gain", [229, 115, 115]);
    addMetricCard(doc, 106, y, 42, "Weekly active", formatNumber(metrics.weeklyActiveUsers), "Sessions, moods, or activities");
    addMetricCard(doc, 152, y, 44, "Benefit rate", formatPercent(metrics.recoveryRate), "Of tracked mood users");
    y += 34;

    y = addSectionTitle(doc, "Weekly Impact Outcomes", y);
    autoTable(doc, {
      startY: y,
      headStyles: { fillColor: BRAND_ORCHID, textColor: [255, 255, 255], fontStyle: "bold" },
      bodyStyles: { textColor: BRAND_INK },
      alternateRowStyles: { fillColor: BRAND_ALT_ROW },
      styles: { fontSize: 8, cellPadding: 2.2 },
      head: [["Outcome", "Value", "How to read it"]],
      body: [
        ["People benefited this week", formatNumber(metrics.benefitedUsersThisWeek), "Users with at least two weekly mood entries whose latest score improved by 5+ points."],
        ["People not recovered this week", formatNumber(metrics.notRecoveredUsersThisWeek), "Tracked users whose latest mood remains below 50 and did not improve by 5+ points."],
        ["Users needing follow-up", formatNumber(metrics.needsFollowUpUsers), "Tracked users whose latest weekly mood score is still below 50."],
        ["Tracked outcome users", formatNumber(metrics.outcomeTrackedUsers), "Users with enough mood data to compare first vs latest weekly mood."],
        ["Average mood change", formatMoodChange(metrics.averageMoodChange), "Average first-to-latest weekly mood movement among tracked users."],
        ["Weekly benefit rate", formatPercent(metrics.recoveryRate), "Benefited users divided by tracked outcome users."],
      ],
    });

    y = getLastTableY(doc, y) + 12;
    y = addSectionTitle(doc, "System Usage", y);
    autoTable(doc, {
      startY: y,
      headStyles: { fillColor: BRAND_ORCHID, textColor: [255, 255, 255], fontStyle: "bold" },
      bodyStyles: { textColor: BRAND_INK },
      alternateRowStyles: { fillColor: BRAND_ALT_ROW },
      styles: { fontSize: 8, cellPadding: 2.2 },
      head: [["Metric", "All time", "This week", "Notes"]],
      body: [
        ["Registered users", formatNumber(metrics.totalUsers), `+${formatNumber(metrics.newUsersThisWeek)}`, `${formatNumber(metrics.newUsersThisMonth)} new user(s) this month.`],
        ["Therapy sessions", formatNumber(metrics.totalSessions), formatNumber(metrics.weeklySessions), `${formatNumber(metrics.weeklyCompletedSessions)} completed this week.`],
        ["Chat messages", "-", formatNumber(metrics.weeklyMessageCount), `${formatNumber(metrics.avgMessagesPerSession)} average message(s) per weekly session.`],
        ["Therapeutic activities", formatNumber(metrics.totalActivities), formatNumber(metrics.weeklyActivities), `${formatPercent(metrics.weeklyActivityCompletionRate)} completion rate this week.`],
        ["Mood check-ins", formatNumber(metrics.totalMoodEntries), formatNumber(metrics.outcomeTrackedUsers), "Weekly value counts users with comparable mood data, not raw entries."],
        ["Average session duration", `${formatNumber(metrics.avgSessionMinutes)} min`, "-", "Average across sessions with two or more messages."],
      ],
    });

    y = getLastTableY(doc, y) + 12;
    y = addSectionTitle(doc, "Mood, Recovery, and Safety", y);
    autoTable(doc, {
      startY: y,
      headStyles: { fillColor: BRAND_ORCHID, textColor: [255, 255, 255], fontStyle: "bold" },
      bodyStyles: { textColor: BRAND_INK },
      alternateRowStyles: { fillColor: BRAND_ALT_ROW },
      styles: { fontSize: 8, cellPadding: 2.2 },
      head: [["Area", "Value", "Operational meaning"]],
      body: [
        ["Current weekly mood average", `${metrics.avgMoodScore}/100`, "Average mood score from all mood entries in the current 7-day window."],
        ["Previous weekly mood average", `${metrics.previousWeekAvgMoodScore}/100`, "Baseline from the 7 days before this report window."],
        ["Mood trend", formatMoodChange(moodDelta), "Difference between current and previous weekly mood averages."],
        ["High-risk therapy sessions", formatNumber(metrics.weeklyHighRiskSessions), "Weekly sessions with risk or crisis scores above the configured threshold."],
        ["Emergency escalations", formatNumber(metrics.escalationsThisWeek), `${formatNumber(metrics.totalEscalations)} total emergency events recorded.`],
      ],
    });

    y = getLastTableY(doc, y) + 12;
    y = addSectionTitle(doc, "Therapeutic Activity Breakdown", y);
    autoTable(doc, {
      startY: y,
      headStyles: { fillColor: BRAND_ORCHID, textColor: [255, 255, 255], fontStyle: "bold" },
      bodyStyles: { textColor: BRAND_INK },
      alternateRowStyles: { fillColor: BRAND_ALT_ROW },
      styles: { fontSize: 8, cellPadding: 2.2 },
      head: [["Activity type", "Logged", "Completed", "Minutes"]],
      body: trends.activityBreakdown.length
        ? trends.activityBreakdown.map((item) => [
            item._id,
            formatNumber(item.count),
            formatNumber(item.completedCount),
            formatNumber(item.totalMinutes || 0),
          ])
        : [["No activity data", "0", "0", "0"]],
    });

    y = getLastTableY(doc, y) + 12;
    y = addSectionTitle(doc, "Recommended Admin Actions", y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND_INK);
    recommendations.forEach((item) => {
      y = ensurePageSpace(doc, y, 12);
      doc.setFillColor(...BRAND_ORCHID);
      doc.circle(16, y - 1.5, 1.2, "F");
      y = addWrappedText(doc, item, 20, y, 176, 5) + 2;
    });

    y = addSectionTitle(doc, "Data Definitions", y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND_MUTED);
    [
      "Benefited users: users with at least two mood check-ins this week whose latest score improved by 5 or more points from their first weekly score.",
      "Not recovered users: tracked users whose latest weekly mood score remains below 50 and whose mood did not improve by at least 5 points.",
      "Needs follow-up users: tracked users whose latest weekly mood score is below 50, even if they improved.",
      "Weekly active users: unique users with a therapy session, mood check-in, or logged therapeutic activity in the report window.",
    ].forEach((item) => {
      y = ensurePageSpace(doc, y, 10);
      y = addWrappedText(doc, `- ${item}`, 14, y, 182, 4.5) + 1;
    });

    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...BRAND_MUTED);
      doc.text(`Soul Discovery Analytics Report - Page ${page} of ${totalPages}`, 14, 288);
      doc.text("Generated from live admin analytics data", 145, 288);
    }

    doc.save(
      `Soul_Discovery_Weekly_Impact_Report_${generatedAt.toISOString().split("T")[0]}.pdf`
    );
  };

  if (isLoading) {
    return (
      <div className="page-shell animate-pulse">
        <div className="h-44 rounded-[28px] bg-gradient-to-br from-[#401B36]/85 to-[#5B3FA8]/70" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-[22px] border border-border bg-white/80" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="h-[320px] rounded-[22px] border border-border bg-white/70 xl:col-span-4" />
          <div className="h-[320px] rounded-[22px] border border-border bg-white/70 xl:col-span-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell !space-y-4">
      <PageHeader
        tone="plum"
        eyebrow="Intelligence console"
        title="Operational Analytics"
        description="Live usage, clinical impact, mood outcomes, and safety signals across Soul Discovery."
        meta={
          <>
            <span className="badge-violet">7-day window</span>
            <span className="badge-sky">
              {formatNumber(metrics.weeklyActiveUsers)} weekly active
            </span>
            <span className="badge-peach">PDF ready</span>
          </>
        }
        actions={
          <button
            type="button"
            onClick={exportToPDF}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#401B36] shadow-lifted transition-all hover:bg-[#F0EAFE] disabled:opacity-45"
          >
            <span className="material-symbols-outlined text-[16px] text-[#C46B4A]">
              picture_as_pdf
            </span>
            Download PDF Report
          </button>
        }
        aside={
          <div className="relative grid w-full max-w-[320px] shrink-0 grid-cols-2 gap-2 lg:w-[320px]">
            <GlassStat
              label="Users"
              value={formatNumber(metrics.totalUsers)}
              accent="#7863C6"
            />
            <GlassStat
              label="Week sessions"
              value={formatNumber(metrics.weeklySessions)}
              accent="#4F7FE8"
            />
            <GlassStat
              label="Avg mood"
              value={`${metrics.avgMoodScore}`}
              accent="#C46B4A"
            />
            <GlassStat
              label="Benefit rate"
              value={formatPercent(metrics.recoveryRate)}
              accent="#287D58"
            />
          </div>
        }
      />

      {/* KPI mosaic */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MetricTile
          icon="group"
          label="Users"
          value={formatNumber(metrics.totalUsers)}
          hint={`+${formatNumber(metrics.newUsersThisWeek)} this week`}
          tone="violet"
        />
        <MetricTile
          icon="forum"
          label="Live sessions"
          value={formatNumber(metrics.activeSessions)}
          hint={`${formatNumber(metrics.totalSessions)} lifetime`}
          tone="sky"
          spark={weekDays.map((d) => d.count)}
        />
        <MetricTile
          icon="psychology"
          label="Week sessions"
          value={formatNumber(metrics.weeklySessions)}
          hint={`${formatNumber(metrics.weeklyMessageCount)} messages`}
          tone="violet"
          spark={weekDays.map((d) => d.count)}
        />
        <MetricTile
          icon="mood"
          label="Avg mood"
          value={`${metrics.avgMoodScore}`}
          hint={
            moodDelta === 0
              ? "vs last week · flat"
              : `vs last week · ${formatMoodChange(moodDelta)}`
          }
          tone="peach"
        />
        <MetricTile
          icon="favorite"
          label="Benefit rate"
          value={formatPercent(metrics.recoveryRate)}
          hint={`${formatNumber(metrics.benefitedUsersThisWeek)} benefited`}
          tone="mint"
        />
        <MetricTile
          icon="emergency"
          label="Escalations"
          value={formatNumber(metrics.escalationsThisWeek)}
          hint={`${formatNumber(metrics.weeklyHighRiskSessions)} high-risk`}
          tone={metrics.escalationsThisWeek > 0 ? "alert" : "orchid"}
        />
      </section>

      {aiUsage && (
        <section className="panel p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-on-surface">AI chat capacity</h2>
              <p className="text-[11px] text-on-surface-muted">
                OpenRouter quotas for {aiUsage.dayKey} / {aiUsage.monthKey} (UTC)
              </p>
            </div>
            <Link href="/ai-usage" className="soft-btn-violet text-xs">
              Full AI usage
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-[#F8F5FC] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-muted">
                Today
              </p>
              <p className="mt-1 text-2xl font-bold text-on-surface">
                {formatNumber(aiUsage.globalDay)}
                <span className="text-sm font-normal text-on-surface-muted">
                  {" "}
                  / {formatNumber(aiUsage.dailyLimit)}
                </span>
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-[#FFF0F6] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-muted">
                This month
              </p>
              <p className="mt-1 text-2xl font-bold text-on-surface">
                {formatNumber(aiUsage.globalMonth)}
                <span className="text-sm font-normal text-on-surface-muted">
                  {" "}
                  / {formatNumber(aiUsage.monthlyLimit)}
                </span>
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-white px-4 py-3 sm:col-span-2">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-on-surface-muted">
                Message sources (7d)
              </p>
              <div className="flex flex-wrap gap-2">
                {(aiUsage.messageSources || []).length === 0 && (
                  <span className="text-xs text-on-surface-muted">No chat this week</span>
                )}
                {(aiUsage.messageSources || []).map((s) => (
                  <span
                    key={s.source}
                    className="rounded-full border border-border px-3 py-1 text-xs font-semibold capitalize"
                  >
                    {s.source}: {formatNumber(s.count)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Rings + chart */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="panel p-5 xl:col-span-4">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-on-surface">Health rings</h2>
              <p className="text-[11px] text-on-surface-muted">
                Completion, coverage, and recovery signals
              </p>
            </div>
            <span className="badge-violet">Signals</span>
          </div>
          <div className="flex flex-wrap items-start justify-around gap-4 rounded-2xl bg-gradient-to-br from-[#F7F4FF] via-white to-[#EEF4FF] py-4">
            <ProgressRing
              value={metrics.weeklyActivityCompletionRate || 0}
              label="Activities"
              sublabel="Week completion"
              color="#B74783"
              color2="#C46B4A"
            />
            <ProgressRing
              value={moodCoverage}
              label="Mood coverage"
              sublabel="Tracked users"
              color="#7863C6"
              color2="#4F7FE8"
            />
            <ProgressRing
              value={metrics.recoveryRate || 0}
              label="Benefit"
              sublabel="Of tracked"
              color="#287D58"
              color2="#4F7FE8"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-[#C46B4A]/20 bg-[#FFF1E9] px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#C46B4A]">
                Follow-up
              </p>
              <p className="text-lg font-bold text-[#401B36]">
                {formatNumber(metrics.needsFollowUpUsers)}
              </p>
            </div>
            <div className="rounded-xl border border-[#B4233D]/20 bg-[#FFF0F2] px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#B4233D]/80">
                Not recovered
              </p>
              <p className="text-lg font-bold text-[#B4233D]">
                {formatNumber(metrics.notRecoveredUsersThisWeek)}
              </p>
            </div>
          </div>
        </div>

        <div className="panel flex flex-col p-5 xl:col-span-8">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-on-surface">Session velocity</h2>
                <span className="badge-sky">7 days</span>
              </div>
              <p className="text-[11px] text-on-surface-muted">
                Therapy sessions started per day
              </p>
            </div>
            <div className="flex gap-2">
              <div className="rounded-xl border border-[#7863C6]/25 bg-[#F0EAFE] px-3 py-1.5 text-right">
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#5B3FA8]/80">
                  Week total
                </p>
                <p className="text-lg font-bold leading-none text-[#5B3FA8]">{weekTotal}</p>
              </div>
              <div className="rounded-xl border border-[#4F7FE8]/25 bg-[#EEF4FF] px-3 py-1.5 text-right">
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#315FC2]/80">
                  Avg / day
                </p>
                <p className="text-lg font-bold leading-none text-[#315FC2]">
                  {Math.round((weekTotal / 7) * 10) / 10}
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex h-[210px] items-end gap-2 sm:gap-3">
            {weekDays.map((day, idx) => {
              const pct = Math.max(
                (day.count / maxDay) * 100,
                day.count === 0 ? 5 : 10
              );
              const active = hoveredDay === day._id;
              const isSky = idx % 2 === 0;
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
                    <div
                      className={`w-full max-w-[48px] rounded-t-xl transition-all duration-300 ${
                        day.count > 0
                          ? isSky
                            ? "bg-gradient-to-t from-[#315FC2] via-[#4F7FE8] to-[#A9C4FF]"
                            : "bg-gradient-to-t from-[#5B3FA8] via-[#7863C6] to-[#C9BBF3]"
                          : "bg-gradient-to-t from-[#E7E1F3] to-[#F5F2FF]"
                      } ${active ? "ring-2 ring-[#7863C6]/30" : ""}`}
                      style={{ height: `${pct}%`, minHeight: 8 }}
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
        </div>
      </section>

      {/* Impact + product grid */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="panel p-5 lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-on-surface">Clinical impact</h2>
              <p className="text-[11px] text-on-surface-muted">Mood outcomes this week</p>
            </div>
            <span className="badge-violet">Outcomes</span>
          </div>
          <div className="space-y-3">
            {(
              [
                {
                  label: "Benefited",
                  value: metrics.benefitedUsersThisWeek,
                  tone: "mint",
                  icon: "trending_up",
                },
                {
                  label: "Needs follow-up",
                  value: metrics.needsFollowUpUsers,
                  tone: "peach",
                  icon: "priority_high",
                },
                {
                  label: "Not recovered",
                  value: metrics.notRecoveredUsersThisWeek,
                  tone: "alert",
                  icon: "trending_down",
                },
                {
                  label: "Tracked users",
                  value: metrics.outcomeTrackedUsers,
                  tone: "sky",
                  icon: "donut_large",
                },
              ] as { label: string; value: number; tone: Tone; icon: string }[]
            ).map((row) => (
              <div
                key={row.label}
                className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-border bg-white px-3 py-2.5 pl-4"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1"
                  style={{ backgroundColor: toneSolid[row.tone] }}
                />
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneWell[row.tone]}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {row.icon}
                    </span>
                  </span>
                  <span className="text-sm font-medium text-on-surface">{row.label}</span>
                </div>
                <span className="text-lg font-bold text-on-surface">
                  {formatNumber(row.value)}
                </span>
              </div>
            ))}
            <div
              className="relative overflow-hidden rounded-2xl px-4 py-3 text-white"
              style={{
                backgroundImage:
                  "linear-gradient(130deg, #401B36 0%, #5B3FA8 100%)",
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#E4D7F5]">
                Average mood change
              </p>
              <p className="mt-1 text-3xl font-black tracking-tight">
                {formatMoodChange(metrics.averageMoodChange)}
              </p>
              <div
                aria-hidden
                className="absolute -right-4 -top-6 h-24 w-6 rotate-[24deg] bg-[#C46B4A]/70"
              />
              <div
                aria-hidden
                className="absolute right-4 -top-6 h-24 w-3 rotate-[24deg] bg-[#4F7FE8]/80"
              />
            </div>
          </div>
        </div>

        <div className="panel p-5 lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-on-surface">Product stack</h2>
              <p className="text-[11px] text-on-surface-muted">
                Wellness · consults · assessments
              </p>
            </div>
            <span className="badge-sky">Programs</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {(
              [
                {
                  label: "Wellness active",
                  value: metrics.activeWellnessPlans || 0,
                  hint: `${metrics.avgWellnessCompletionRate || 0}% avg`,
                  icon: "spa",
                  tone: "mint",
                },
                {
                  label: "Enrollments",
                  value: metrics.totalWellnessEnrollments || 0,
                  hint: `${metrics.completedWellnessPlans || 0} done`,
                  icon: "verified",
                  tone: "violet",
                },
                {
                  label: "Upcoming consults",
                  value: metrics.upcomingConsultations || 0,
                  hint: `${metrics.totalConsultations || 0} total`,
                  icon: "event_available",
                  tone: "peach",
                },
                {
                  label: "Assessments / wk",
                  value: metrics.assessmentCompletionsThisWeek || 0,
                  hint: `${metrics.assessmentInProgressSessions || 0} in progress`,
                  icon: "quiz",
                  tone: "sky",
                },
              ] as {
                label: string;
                value: number;
                hint: string;
                icon: string;
                tone: Tone;
              }[]
            ).map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-border bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-card"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneWell[card.tone]}`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {card.icon}
                  </span>
                </span>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-on-surface-muted">
                  {card.label}
                </p>
                <p className="mt-1 text-2xl font-black text-on-surface">
                  {formatNumber(card.value)}
                </p>
                <p className="text-[11px] text-on-surface-variant">{card.hint}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5 lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-on-surface">Safety desk</h2>
              <p className="text-[11px] text-on-surface-muted">Risk & emergency posture</p>
            </div>
            <span className="badge badge-error">Monitor</span>
          </div>
          <div className="space-y-2.5">
            <div className="rounded-2xl bg-[#FFF0F2] px-3.5 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">High-risk sessions</span>
                <span className="text-xl font-black text-[#B4233D]">
                  {formatNumber(metrics.weeklyHighRiskSessions)}
                </span>
              </div>
            </div>
            <div className="rounded-2xl bg-[#FFF1E9] px-3.5 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Escalations / week</span>
                <span className="text-xl font-black text-[#C46B4A]">
                  {formatNumber(metrics.escalationsThisWeek)}
                </span>
              </div>
            </div>
            <div className="rounded-2xl bg-[#F0EAFE] px-3.5 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">All-time escalations</span>
                <span className="text-xl font-black text-[#5B3FA8]">
                  {formatNumber(metrics.totalEscalations)}
                </span>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Link href="/emergency" className="soft-btn-violet flex-1">
                Emergency
              </Link>
              <Link href="/logs" className="soft-btn flex-1">
                Logs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Breakdowns with bars */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="panel p-5 xl:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-on-surface">
                Therapeutic activities
              </h2>
              <p className="text-[11px] text-on-surface-muted">
                Started vs completed by type
              </p>
            </div>
            <span className="badge-violet">Activity</span>
          </div>
          {trends.activityBreakdown.length === 0 ? (
            <div className="empty-state py-8">
              <div className="empty-state-icon">
                <span className="material-symbols-outlined">self_improvement</span>
              </div>
              <p className="text-xs text-on-surface-muted">No activity data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trends.activityBreakdown.map((item: any, i: number) => (
                <div key={i} className="space-y-2">
                  <BarRow
                    label={(item._id || "activity").replace(/_/g, " ")}
                    value={item.count}
                    max={activityMax}
                    detail={`· ${formatNumber(item.completedCount)} done`}
                    color="from-[#7863C6] to-[#4F7FE8]"
                  />
                  <p className="text-[10px] text-on-surface-muted">
                    {formatNumber(item.totalMinutes || 0)} minutes invested
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel p-5 xl:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-on-surface">Wellness goals</h2>
              <p className="text-[11px] text-on-surface-muted">Enrollments by goal</p>
            </div>
            <span className="badge-peach">Goals</span>
          </div>
          {(trends.wellnessByGoal || []).length === 0 ? (
            <div className="empty-state py-8">
              <div className="empty-state-icon">
                <span className="material-symbols-outlined">spa</span>
              </div>
              <p className="text-xs text-on-surface-muted">No wellness data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(trends.wellnessByGoal || []).map((item: any, i: number) => (
                <BarRow
                  key={i}
                  label={(item._id || "custom").replace(/_/g, " ")}
                  value={item.count}
                  max={wellnessMax}
                  detail={`· ${Math.round(item.avgCompletion || 0)}%`}
                  color="from-[#B74783] to-[#C46B4A]"
                />
              ))}
            </div>
          )}
        </div>

        <div className="panel p-5 xl:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-on-surface">
                Assessments · 30 days
              </h2>
              <p className="text-[11px] text-on-surface-muted">Completions by instrument</p>
            </div>
            <span className="badge-sky">Instruments</span>
          </div>
          {(trends.assessmentsBySlug || []).length === 0 ? (
            <div className="empty-state py-8">
              <div className="empty-state-icon">
                <span className="material-symbols-outlined">assignment</span>
              </div>
              <p className="text-xs text-on-surface-muted">No completions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(trends.assessmentsBySlug || []).map((item: any, i: number) => (
                <div key={item.slug || i}>
                  <BarRow
                    label={item.title || item.slug}
                    value={item.count}
                    max={assessmentMax}
                    color="from-[#4F7FE8] to-[#7863C6]"
                  />
                  <p className="mt-1 text-[10px] text-on-surface-muted">{item.slug}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Usage strip */}
      <section className="panel overflow-hidden">
        <div className="panel-header">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Engagement snapshot</h2>
            <p className="text-[11px] text-on-surface-muted">
              Lifetime vs weekly operational load
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard" className="soft-btn">
              Dashboard
            </Link>
            <Link href="/logs" className="soft-btn-sky">
              View logs
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-6">
          {(
            [
              {
                label: "Avg session",
                value: `${formatNumber(metrics.avgSessionMinutes)}m`,
                tone: "violet",
              },
              {
                label: "Msgs / session",
                value: formatNumber(metrics.avgMessagesPerSession),
                tone: "sky",
              },
              {
                label: "Week activities",
                value: formatNumber(metrics.weeklyActivities),
                tone: "peach",
              },
              {
                label: "Mood entries",
                value: formatNumber(metrics.totalMoodEntries),
                tone: "orchid",
              },
              {
                label: "New users / mo",
                value: formatNumber(metrics.newUsersThisMonth),
                tone: "mint",
              },
              {
                label: "Completed sessions",
                value: formatNumber(metrics.weeklyCompletedSessions),
                tone: "violet",
              },
            ] as { label: string; value: string; tone: Tone }[]
          ).map((cell) => (
            <div key={cell.label} className="relative bg-white px-4 py-4">
              <span
                aria-hidden
                className="absolute inset-x-4 top-0 h-0.5 rounded-b-full"
                style={{ backgroundColor: toneSolid[cell.tone] }}
              />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-muted">
                {cell.label}
              </p>
              <p className="mt-1 text-xl font-bold text-on-surface">{cell.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

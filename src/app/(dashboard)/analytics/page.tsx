"use client";

import React from "react";
import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";
import { PageHeader } from "@/components/layout/PageHeader";
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

const addWrappedText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5) => {
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

type MetricTone = "orchid" | "lavender" | "blush" | "alert";

const METRIC_TONES: Record<
  MetricTone,
  { wash: string; iconBg: string; chip: string; value: string; glow: string }
> = {
  orchid: {
    wash: "from-[#FFF0F6] via-white to-white",
    iconBg: "bg-[#FFE5F0] text-primary",
    chip: "bg-[#FFE5F0] text-[#9F376F]",
    value: "text-on-surface",
    glow: "rgba(183,71,131,0.18)",
  },
  lavender: {
    wash: "from-[#F4E8FF] via-white to-white",
    iconBg: "bg-[#F1EAFF] text-[#7A5FB8]",
    chip: "bg-[#F1EAFF] text-[#6A4FA8]",
    value: "text-on-surface",
    glow: "rgba(154,120,220,0.22)",
  },
  blush: {
    wash: "from-[#F7E8F3] via-white to-white",
    iconBg: "bg-[#FFF0F6] text-primary",
    chip: "bg-[#FFF0F6] text-primary",
    value: "text-on-surface",
    glow: "rgba(183,71,131,0.14)",
  },
  alert: {
    wash: "from-[#FFF0F2] via-white to-white",
    iconBg: "bg-error-container text-error",
    chip: "bg-error-container text-error",
    value: "text-error",
    glow: "rgba(180,35,61,0.18)",
  },
};

function MetricCard({
  tone,
  icon,
  chip,
  label,
  value,
  description,
}: {
  tone: MetricTone;
  icon: string;
  chip: string;
  label: string;
  value: React.ReactNode;
  description: string;
}) {
  const t = METRIC_TONES[tone];
  return (
    <div
      className={`group relative overflow-hidden rounded-[22px] border border-border bg-gradient-to-br ${t.wash} p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card-hover`}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-40 blur-2xl"
        style={{ background: t.glow }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${t.iconBg} transition-transform duration-300 group-hover:scale-105`}
        >
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.04em] ${t.chip}`}
        >
          {chip}
        </span>
      </div>
      <p className="relative mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-muted">
        {label}
      </p>
      <p className={`relative mt-1.5 text-[1.75rem] font-bold leading-none tracking-tight ${t.value}`}>
        {value}
      </p>
      <p className="relative mt-2 text-[11px] leading-snug text-on-surface-variant">
        {description}
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { metrics, trends, isLoading } = useAnalytics();

  const exportToPDF = () => {
    const doc = new jsPDF();
    const generatedAt = new Date();
    const periodStart = new Date(generatedAt.getTime() - 7 * 24 * 60 * 60 * 1000);
    const reportPeriod = `${periodStart.toLocaleDateString()} - ${generatedAt.toLocaleDateString()}`;
    const moodCoverage = metrics.totalUsers > 0
      ? Math.round((metrics.outcomeTrackedUsers / metrics.totalUsers) * 100)
      : 0;

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

    // Header
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

    // Executive summary
    let y = 50;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...BRAND_INK);
    doc.text("Executive Summary", 14, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND_MUTED);
    const summaryText = metrics.outcomeTrackedUsers > 0
      ? `Soul Discovery supported ${formatNumber(metrics.weeklyActiveUsers)} active user(s) this week across ${formatNumber(metrics.weeklySessions)} therapy session(s), ${formatNumber(metrics.weeklyMessageCount)} chat message(s), and ${formatNumber(metrics.weeklyActivities)} logged therapeutic activity item(s). Based on users with at least two mood check-ins this week, ${formatNumber(metrics.benefitedUsersThisWeek)} user(s) showed measurable benefit, while ${formatNumber(metrics.notRecoveredUsersThisWeek)} user(s) are not recovered and should be prioritized for follow-up.`
      : `Soul Discovery supported ${formatNumber(metrics.weeklyActiveUsers)} active user(s) this week across ${formatNumber(metrics.weeklySessions)} therapy session(s), ${formatNumber(metrics.weeklyMessageCount)} chat message(s), and ${formatNumber(metrics.weeklyActivities)} logged therapeutic activity item(s). No users had enough mood check-ins for reliable weekly outcome classification, so recovery metrics should be treated as unavailable rather than zero-impact.`;
    y = addWrappedText(doc, summaryText, 14, y, 182, 5) + 6;

    addMetricCard(doc, 14, y, 42, "Benefited", formatNumber(metrics.benefitedUsersThisWeek), "Improved mood by 5+ points");
    addMetricCard(doc, 60, y, 42, "Not recovered", formatNumber(metrics.notRecoveredUsersThisWeek), "Low mood and no clear gain", [229, 115, 115]);
    addMetricCard(doc, 106, y, 42, "Weekly active", formatNumber(metrics.weeklyActiveUsers), "Sessions, moods, or activities");
    addMetricCard(doc, 152, y, 44, "Benefit rate", formatPercent(metrics.recoveryRate), "Of tracked mood users");
    y += 34;

    // Weekly impact outcomes
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
        ["Mood trend", formatMoodChange(metrics.avgMoodScore - metrics.previousWeekAvgMoodScore), "Difference between current and previous weekly mood averages."],
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
    const definitions = [
      "Benefited users: users with at least two mood check-ins this week whose latest score improved by 5 or more points from their first weekly score.",
      "Not recovered users: tracked users whose latest weekly mood score remains below 50 and whose mood did not improve by at least 5 points.",
      "Needs follow-up users: tracked users whose latest weekly mood score is below 50, even if they improved.",
      "Weekly active users: unique users with a therapy session, mood check-in, or logged therapeutic activity in the report window.",
    ];
    definitions.forEach((item) => {
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

    doc.save(`Soul_Discovery_Weekly_Impact_Report_${generatedAt.toISOString().split("T")[0]}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="page-shell animate-pulse">
        <div className="h-36 rounded-[28px] border border-border bg-white/70" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-[22px] border border-border bg-white/70" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-64 rounded-[22px] border border-border bg-white/70 lg:col-span-2" />
          <div className="h-64 rounded-[22px] border border-border bg-white/70" />
        </div>
      </div>
    );
  }

  const screenMoodCoverage = metrics.totalUsers > 0
    ? Math.round((metrics.outcomeTrackedUsers / metrics.totalUsers) * 100)
    : 0;

  const coreStats: Array<{
    label: string;
    value: number;
    description: string;
    icon: string;
    chip: string;
    tone: MetricTone;
  }> = [
    {
      label: "Total Users",
      value: metrics.totalUsers,
      description: "Registered Soul Discovery users",
      icon: "group",
      chip: "All time",
      tone: "orchid",
    },
    {
      label: "Active Sessions",
      value: metrics.activeSessions,
      description: "Open therapy sessions with messages",
      icon: "forum",
      chip: "Live",
      tone: "lavender",
    },
    {
      label: "Therapy Sessions",
      value: metrics.totalSessions,
      description: "Total AI therapy conversations",
      icon: "psychology",
      chip: "All time",
      tone: "blush",
    },
    {
      label: "Emergency Events",
      value: metrics.totalEscalations,
      description: "Triggered emergency alerts",
      icon: "emergency",
      chip: "Safety",
      tone: metrics.totalEscalations > 0 ? "alert" : "orchid",
    },
  ];

  const productStats: Array<{
    label: string;
    value: number;
    description: string;
    icon: string;
    chip: string;
    tone: MetricTone;
  }> = [
    {
      label: "Wellness Enrollments",
      value: metrics.totalWellnessEnrollments || 0,
      description: `${metrics.activeWellnessPlans || 0} active · ${metrics.avgWellnessCompletionRate || 0}% avg completion`,
      icon: "spa",
      chip: "Wellness",
      tone: "lavender",
    },
    {
      label: "Consultations",
      value: metrics.totalConsultations || 0,
      description: `${metrics.upcomingConsultations || 0} upcoming · ${metrics.completedConsultations || 0} completed`,
      icon: "event_available",
      chip: "Bookings",
      tone: "orchid",
    },
    {
      label: "Mood Check-ins",
      value: metrics.totalMoodEntries,
      description: `Weekly avg ${metrics.avgMoodScore}/100`,
      icon: "mood",
      chip: "Mood",
      tone: "blush",
    },
    {
      label: "Activities Logged",
      value: metrics.totalActivities,
      description: `${metrics.weeklyActivityCompletionRate}% weekly completion`,
      icon: "self_improvement",
      chip: "Activities",
      tone: "lavender",
    },
    {
      label: "Assessment Completions",
      value: metrics.totalAssessmentCompletions || 0,
      description: `${metrics.assessmentCompletionsThisWeek || 0} this week · ${metrics.assessmentInProgressSessions || 0} in progress`,
      icon: "assignment_turned_in",
      chip: "Assessments",
      tone: "orchid",
    },
  ];

  const impactStats: Array<{
    label: string;
    value: number | string;
    description: string;
    icon: string;
    chip: string;
    tone: MetricTone;
  }> = [
    {
      label: "Benefited This Week",
      value: metrics.benefitedUsersThisWeek,
      description: "Mood improved by 5+ points",
      icon: "trending_up",
      chip: "Impact",
      tone: "orchid",
    },
    {
      label: "Not Recovered",
      value: metrics.notRecoveredUsersThisWeek,
      description: "Low mood with no clear improvement",
      icon: "trending_down",
      chip: "Follow-up",
      tone: metrics.notRecoveredUsersThisWeek > 0 ? "alert" : "blush",
    },
    {
      label: "Needs Follow-up",
      value: metrics.needsFollowUpUsers,
      description: "Latest mood is still below 50",
      icon: "priority_high",
      chip: "Priority",
      tone: metrics.needsFollowUpUsers > 0 ? "alert" : "lavender",
    },
    {
      label: "Mood Coverage",
      value: `${screenMoodCoverage}%`,
      description: "Total users with comparable mood data",
      icon: "donut_large",
      chip: "Coverage",
      tone: "blush",
    },
  ];

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Insights"
        title="Operational Analytics"
        description="System usage, therapy activity, and emergency overview."
        meta={
          <>
            <span className="badge badge-primary">Weekly impact</span>
            <span className="badge badge-neutral">
              {formatNumber(metrics.weeklyActiveUsers)} active this week
            </span>
          </>
        }
        actions={
          <button type="button" onClick={exportToPDF} className="soft-btn-primary">
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            Download PDF Report
          </button>
        }
      />

      {/* Core stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {coreStats.map((item) => (
          <MetricCard
            key={item.label}
            tone={item.tone}
            icon={item.icon}
            chip={item.chip}
            label={item.label}
            value={item.value.toLocaleString()}
            description={item.description}
          />
        ))}
      </div>

      {/* Product stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {productStats.map((item) => (
          <MetricCard
            key={item.label}
            tone={item.tone}
            icon={item.icon}
            chip={item.chip}
            label={item.label}
            value={item.value.toLocaleString()}
            description={item.description}
          />
        ))}
      </div>

      {/* Impact stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {impactStats.map((item) => (
          <MetricCard
            key={item.label}
            tone={item.tone}
            icon={item.icon}
            chip={item.chip}
            label={item.label}
            value={typeof item.value === "number" ? item.value.toLocaleString() : item.value}
            description={item.description}
          />
        ))}
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <div className="panel-header">
            <div className="flex items-center gap-2.5">
              <div className="stat-icon !h-9 !w-9 !rounded-xl">
                <span className="material-symbols-outlined text-[18px]">self_improvement</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-on-surface">
                  Therapeutic Activity Breakdown
                </h3>
                <p className="text-[11px] text-on-surface-muted">Started vs completed by type</p>
              </div>
            </div>
          </div>

          <div className="space-y-0 divide-y divide-border px-5 py-1">
            {trends.activityBreakdown.length === 0 ? (
              <div className="empty-state py-10">
                <div className="empty-state-icon">
                  <span className="material-symbols-outlined text-[28px]">self_improvement</span>
                </div>
                <p className="text-sm font-semibold text-on-surface">No activity data</p>
                <p className="text-xs text-on-surface-muted">Logged activities will appear here.</p>
              </div>
            ) : (
              trends.activityBreakdown.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-3.5">
                  <div>
                    <div className="text-sm font-medium capitalize text-on-surface">{item._id}</div>
                    <div className="mt-0.5 text-xs text-on-surface-muted">
                      {formatNumber(item.totalMinutes || 0)} minutes spent
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div className="text-on-surface-variant">
                      <span className="font-semibold text-on-surface">{formatNumber(item.count)}</span>{" "}
                      Started
                    </div>
                    <div className="text-on-surface-variant">
                      <span className="font-semibold text-primary">
                        {formatNumber(item.completedCount)}
                      </span>{" "}
                      Completed
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="flex items-center gap-2.5">
              <div className="stat-icon !h-9 !w-9 !rounded-xl">
                <span className="material-symbols-outlined text-[18px]">spa</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-on-surface">Wellness Goals</h3>
                <p className="text-[11px] text-on-surface-muted">Enrollments by goal</p>
              </div>
            </div>
          </div>
          <div className="space-y-0 divide-y divide-border px-5 py-1">
            {(trends.wellnessByGoal || []).length === 0 ? (
              <div className="empty-state py-10">
                <div className="empty-state-icon">
                  <span className="material-symbols-outlined text-[28px]">spa</span>
                </div>
                <p className="text-sm font-semibold text-on-surface">No wellness data</p>
                <p className="text-xs text-on-surface-muted">Enrollments will sync here.</p>
              </div>
            ) : (
              (trends.wellnessByGoal || []).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-3">
                  <div className="text-sm font-medium capitalize text-on-surface">
                    {(item._id || "custom").replace(/_/g, " ")}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    <span className="font-semibold text-on-surface">{formatNumber(item.count)}</span>
                    {" · "}
                    {Math.round(item.avgCompletion || 0)}% avg
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2.5">
            <div className="stat-icon !h-9 !w-9 !rounded-xl">
              <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-on-surface">
                Assessment Completions (30 days)
              </h3>
              <p className="text-[11px] text-on-surface-muted">By assessment slug</p>
            </div>
          </div>
        </div>
        <div className="space-y-0 divide-y divide-border px-5 py-1">
          {(trends.assessmentsBySlug || []).length === 0 ? (
            <div className="empty-state py-10">
              <div className="empty-state-icon">
                <span className="material-symbols-outlined text-[28px]">assignment</span>
              </div>
              <p className="text-sm font-semibold text-on-surface">No completions</p>
              <p className="text-xs text-on-surface-muted">
                No assessment completions in the last 30 days.
              </p>
            </div>
          ) : (
            (trends.assessmentsBySlug || []).map((item: any, index: number) => (
              <div
                key={item.slug || index}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <div className="text-sm font-medium text-on-surface">
                    {item.title || item.slug}
                  </div>
                  <div className="text-[11px] text-on-surface-muted">{item.slug}</div>
                </div>
                <div className="text-xs font-semibold text-on-surface">
                  {formatNumber(item.count)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2.5">
            <div className="stat-icon !h-9 !w-9 !rounded-xl">
              <span className="material-symbols-outlined text-[18px]">monitor_heart</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-on-surface">System Overview</h3>
              <p className="text-[11px] text-on-surface-muted">
                High-level operational health of Soul Discovery
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-0 divide-y divide-border px-5 py-1">
          <div className="flex justify-between py-3.5 text-xs">
            <span className="text-on-surface-variant">System Status</span>
            <span className="badge badge-success text-[10px]">Operational</span>
          </div>
          <div className="flex justify-between py-3.5 text-xs">
            <span className="text-on-surface-variant">API Health</span>
            <span className="badge badge-success text-[10px]">Stable</span>
          </div>
          <div className="flex justify-between py-3.5 text-xs">
            <span className="text-on-surface-variant">Emergency System</span>
            <span className="badge badge-primary text-[10px]">Active</span>
          </div>
        </div>

        <div className="border-t border-border bg-[#FFF8FB]/60 px-5 py-4">
          <Link href="/logs" className="soft-btn-primary w-full sm:w-auto">
            <span className="material-symbols-outlined text-[16px]">description</span>
            View Detailed Logs
          </Link>
        </div>
      </div>
    </div>
  );
}

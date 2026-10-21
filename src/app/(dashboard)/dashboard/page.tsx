"use client";

import React from "react";
import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogs } from "@/hooks/useLogs";
import { AvatarImage } from "@/components/ui/avatar-image";
import { PageHeader } from "@/components/layout/PageHeader";

export default function DashboardPage() {
  const { metrics, trends, isLoading } = useAnalytics();
  const { logs: recentLogs, isLoading: isLogsLoading } = useLogs({
    category: "ALL",
    severity: "ALL",
    page: 1,
    limit: 3
  });
  const [hoveredPoint, setHoveredPoint] = React.useState<any | null>(null);

  // Pad the sessions per day to guarantee exactly 7 consecutive days are shown
  const data = React.useMemo(() => {
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
      });
    }
    return padded;
  }, [trends.sessionsPerDay]);

  const maxCount = React.useMemo(() => {
    return data.length > 0 ? Math.max(...data.map(d => d.count), 5) : 5;
  }, [data]);

  const parsedPoints = React.useMemo(() => {
    return data.map((item, idx) => {
      const x = 10 + (idx / (data.length - 1 || 1)) * 80;
      const y = 80 - (item.count / maxCount) * 60;
      return { x, y, ...item };
    });
  }, [data, maxCount]);

  const pointsString = React.useMemo(() => {
    return parsedPoints.map(p => `${p.x},${p.y}`).join(" ");
  }, [parsedPoints]);

  const areaPointsString = React.useMemo(() => {
    return parsedPoints.length > 0
      ? `${pointsString} ${parsedPoints[parsedPoints.length - 1].x},80 10,80`
      : "";
  }, [parsedPoints, pointsString]);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse font-sans text-on-surface">
        <div className="h-10 w-48 bg-surface border border-border rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-surface border border-border rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-[350px] bg-surface border border-border rounded-xl"></div>
          <div className="h-[350px] bg-surface border border-border rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Calculate high alert banner based on emergency counts
  const showCrisisAlert = metrics.totalEscalations > 0;

  return (
    <>
      {/* Crisis Banner */}
      {showCrisisAlert && (
        <div className="bg-error-container text-on-error-container border border-error/20 px-4 py-2.5 text-center text-sm flex justify-center items-center gap-2 mb-6 rounded-xl font-sans">
          <span className="material-symbols-outlined text-[18px] text-error">warning</span>
          <span>SYSTEM NOTICE: {metrics.totalEscalations} crisis escalation logs recorded. Monitoring systems active.</span>
        </div>
      )}

      <PageHeader
        title="System Overview"
        description="Real-time status of the Soul Discovery clinical network."
        actions={
          <>
            <Link href="/users">
              <button className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border text-on-surface font-medium hover:bg-surface-variant transition-colors text-xs font-sans">
                <span className="material-symbols-outlined text-[16px]">group</span>
                View Users
              </button>
            </Link>
            <Link href="/emergency">
              <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-error text-error-foreground font-medium hover:opacity-90 transition-opacity shadow-sm text-xs font-sans">
                <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
                Review Alerts
              </button>
            </Link>
          </>
        }
      />

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5 font-sans">
        <div className="card card-hover p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="w-9 h-9 rounded-2xl bg-primary-container flex items-center justify-center border border-border">
              <span className="material-symbols-outlined text-primary text-[18px]">groups</span>
            </div>
            <span className="text-primary/95 text-[11px] font-medium tracking-wide">Users</span>
          </div>
          <h3 className="text-on-surface-variant/70 uppercase tracking-widest font-normal text-[9px] mb-1">Total Registered</h3>
          <p className="text-2xl font-semibold text-on-surface">{metrics.totalUsers}</p>
        </div>

        <div className="card card-hover p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="w-9 h-9 rounded-2xl bg-primary-container flex items-center justify-center border border-border">
              <span className="material-symbols-outlined text-primary text-[18px]">person_check</span>
            </div>
            <span className="text-primary/95 text-[11px] font-medium tracking-wide">Active</span>
          </div>
          <h3 className="text-on-surface-variant/70 uppercase tracking-widest font-normal text-[9px] mb-1">Active Sessions</h3>
          <p className="text-2xl font-semibold text-on-surface">{metrics.activeSessions}</p>
        </div>

        <div className="card card-hover p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="w-9 h-9 rounded-2xl bg-primary-container flex items-center justify-center border border-border">
              <span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
            </div>
            <span className="text-primary/95 text-[11px] font-medium tracking-wide">Therapy</span>
          </div>
          <h3 className="text-on-surface-variant/70 uppercase tracking-widest font-normal text-[9px] mb-1">Sessions</h3>
          <p className="text-2xl font-semibold text-on-surface">{metrics.totalSessions}</p>
        </div>

        <div className="card border-error/25 p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="w-9 h-9 rounded-2xl bg-error-container flex items-center justify-center border border-error/15">
              <span className="material-symbols-outlined text-error text-[18px]">emergency</span>
            </div>
            <span className="text-error/95 text-[11px] font-medium tracking-wide">Emergency</span>
          </div>
          <h3 className="text-error/70 uppercase tracking-widest font-normal text-[9px] mb-1">Dispatches</h3>
          <p className="text-2xl font-semibold text-error">{metrics.escalationsThisWeek} This Week</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-sans">
        {/* Chart Section */}
        <div className="lg:col-span-2 card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-semibold text-on-surface">Weekly Usage Trends</h3>
              <p className="text-xs text-on-surface-variant/80 mt-1">Number of active therapy sessions per day this week.</p>
            </div>
          </div>
          
          {/* Dynamic SVG Plotting */}
          <div className="flex-1 w-full min-h-[220px] relative mt-4 border-l border-b border-border flex items-end justify-between px-4 pb-2">
            {/* Grid background lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-4 pb-6">
              <div className="w-full border-t border-border/30 h-0"></div>
              <div className="w-full border-t border-border/30 h-0"></div>
              <div className="w-full border-t border-border/30 h-0"></div>
              <div className="w-full border-t border-border/30 h-0"></div>
            </div>

            {data.length > 0 ? (
              <div className="absolute inset-0 p-4 pb-6">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Filled Area */}
                  {areaPointsString && (
                    <polygon
                      points={areaPointsString}
                      fill="url(#chartGradient)"
                    />
                  )}

                  {/* Line path */}
                  {pointsString && (
                    <polyline
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={pointsString}
                    />
                  )}

                  {/* Interactive Circles & Hover Rings */}
                  {parsedPoints.map((p, idx) => (
                    <g key={idx}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        fill="var(--primary)"
                        fillOpacity="0.3"
                        className="transition-all duration-200"
                      />
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="2.2"
                        fill="var(--primary)"
                        stroke="var(--surface)"
                        strokeWidth="1"
                      />
                      {/* Invisible hover trigger */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="10"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  ))}
                </svg>

                {/* Live Tooltip */}
                {hoveredPoint && (
                  <div
                    className="absolute bg-surface-bright border border-border rounded-lg p-2.5 shadow-popover z-20 pointer-events-none transition-all duration-150 font-sans text-[10px]"
                    style={{
                      left: `${hoveredPoint.x}%`,
                      top: `${hoveredPoint.y}%`,
                      transform: "translate(-50%, -120%)",
                    }}
                  >
                    <div className="text-on-surface-variant/70 font-semibold uppercase tracking-wider font-mono">
                      {new Date(hoveredPoint._id).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-xs font-bold text-on-surface mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      {hoveredPoint.count} Therapy Sessions
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-[10px] text-on-surface-variant/60 absolute inset-0 flex items-center justify-center font-mono">
                No session data yet
              </span>
            )}

            {/* X-axis labels */}
            {parsedPoints.length > 0 && parsedPoints.map((p, idx) => (
              <div
                key={idx}
                className="absolute text-[9px] font-mono text-on-surface-variant/80 select-none pb-1 pointer-events-none"
                style={{
                  left: `${p.x}%`,
                  bottom: "0px",
                  transform: "translateX(-50%) translateY(22px)",
                }}
              >
                {new Date(p._id).toLocaleDateString("en-US", { weekday: "short" })}
              </div>
            ))}
          </div>
        </div>

        {/* Security & Activity Section */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-on-surface">Recent Alerts & Activity</h3>
              <span className="material-symbols-outlined text-outline">history</span>
            </div>
            
            <div className="space-y-5">
              {isLogsLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-surface-container-high/30 border border-border flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-surface-container-high/50"></div>
                    </div>
                    <div className="flex-1 space-y-2 py-0.5">
                      <div className="h-3 bg-surface-container-high/50 rounded w-1/3"></div>
                      <div className="h-2 bg-surface-container-high/40 rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              ) : recentLogs.length === 0 ? (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40 mb-2">description</span>
                  <p className="text-xs text-on-surface-variant/85">No recent logs recorded.</p>
                </div>
              ) : (
                recentLogs.map((log: any) => {
                  const isCritical = log.severity === "CRITICAL" || log.category === "CRISIS";
                  const isWarning = log.severity === "WARNING" || log.category === "SECURITY";
                  
                  const bgClass = isCritical 
                    ? "bg-error/10 border border-error/20" 
                    : isWarning 
                    ? "bg-warning/10 border border-warning/20" 
                    : "bg-primary/10 border border-primary/20";
                    
                  const iconClass = isCritical 
                    ? "text-error" 
                    : isWarning 
                    ? "text-warning" 
                    : "text-primary";
                    
                  const iconName = isCritical 
                    ? "priority_high" 
                    : isWarning 
                    ? "shield" 
                    : log.category === "AUTH" 
                    ? "login" 
                    : "info";

                  const titleText = log.category === "CRISIS"
                    ? "Emergency Alert Handled"
                    : log.category === "AUTH"
                    ? "User Access Logged"
                    : log.category === "SECURITY"
                    ? "Security Alert Logged"
                    : "System Activity Logged";

                  return (
                    <div key={log.id || log._id} className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border overflow-hidden ${log.userProfileImage ? 'bg-surface-dim' : bgClass}`}>
                          {log.userProfileImage ? (
                            <AvatarImage src={log.userProfileImage} alt="User" width={32} height={32} className="w-full h-full object-cover" />
                          ) : (
                            <span className={`material-symbols-outlined ${iconClass} text-[15px]`}>
                              {iconName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-on-surface">{titleText}</p>
                        <p className="text-[10px] text-on-surface-variant/85 mt-0.5 font-normal leading-relaxed">
                          {log.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Link href="/logs">
            <button className="w-full mt-6 py-2 text-center text-xs font-semibold text-primary border border-primary/20 rounded-full hover:bg-primary/10 transition-colors font-sans">
              View All Logs
            </button>
          </Link>
        </div>
      </div>

      {/* Operational Details Footer */}
      <div className="mt-8 p-5 card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-sans">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[11px] text-on-surface font-normal">Secure Connection</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span className="text-[11px] text-on-surface font-normal">Activity Logs Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span className="text-[11px] text-on-surface font-normal">System Speed: Fast</span>
          </div>
        </div>
        <div className="text-[11px] text-on-surface-variant/80 font-normal">
          Last System Check: Passed today.
        </div>
      </div>
    </>
  );
}

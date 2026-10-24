"use client";

import Link from "next/link";
import { useAiUsage } from "@/hooks/useAiUsage";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricTile } from "@/components/layout/ScreenHero";
import { AvatarImage } from "@/components/ui/avatar-image";

const formatNum = (n: number) => n.toLocaleString();

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className="mt-2">
      <div className="mb-1 flex justify-between text-[11px] text-on-surface-muted">
        <span>
          {formatNum(used)} / {formatNum(limit)}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#F3EEF8]">
        <div
          className={`h-full rounded-full ${
            pct >= 90 ? "bg-[#B4233D]" : pct >= 70 ? "bg-[#C46B4A]" : "bg-[#7863C6]"
          }`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </div>
  );
}

export default function AiUsagePage() {
  const { data, isLoading, isError, refetch } = useAiUsage();

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Usage"
        description="OpenRouter chat quota — global day/month caps and top members for the current UTC month."
        tone="orchid"
        actions={
          <button type="button" className="soft-btn-violet" onClick={() => refetch()}>
            Refresh
          </button>
        }
      />

      {isLoading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <span className="h-9 w-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-error/20 bg-error-container/40 p-6 text-sm text-error">
          Could not load AI usage.{" "}
          <button type="button" className="underline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {data && (
        <>
          <p className="text-xs text-on-surface-muted">
            Period · day <strong>{data.period.dayKey}</strong> · month{" "}
            <strong>{data.period.monthKey}</strong> (UTC)
          </p>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
              <MetricTile
                label="Global today"
                value={formatNum(data.usage.globalDay)}
                hint={`${formatNum(data.usage.globalDayRemaining)} remaining`}
                icon="today"
                tone="violet"
              />
              <UsageBar used={data.usage.globalDay} limit={data.limits.globalDaily} />
            </div>
            <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
              <MetricTile
                label="Global this month"
                value={formatNum(data.usage.globalMonth)}
                hint={`${formatNum(data.usage.globalMonthRemaining)} remaining`}
                icon="calendar_month"
                tone="orchid"
              />
              <UsageBar used={data.usage.globalMonth} limit={data.limits.globalMonthly} />
            </div>
            <MetricTile
              label="Daily cap"
              value={formatNum(data.limits.globalDaily)}
              hint="All members combined"
              icon="speed"
              tone="sky"
            />
            <MetricTile
              label="Per-user monthly"
              value={formatNum(data.limits.userMonthly)}
              hint="Accepted AI messages"
              icon="person"
              tone="mint"
            />
          </div>

          <section className="rounded-2xl border border-border bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-on-surface">Top users this month</h2>
              <Link href="/sessions" className="text-xs font-semibold text-primary">
                View sessions
              </Link>
            </div>

            {data.topUsers.length === 0 ? (
              <p className="text-sm text-on-surface-muted">
                No AI chat usage recorded for this month yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-[11px] uppercase tracking-wider text-on-surface-muted">
                      <th className="pb-2 font-semibold">Member</th>
                      <th className="pb-2 font-semibold">Used</th>
                      <th className="pb-2 font-semibold">Remaining</th>
                      <th className="pb-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topUsers.map((u) => (
                      <tr key={u.periodKey} className="border-b border-border/60">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary-container text-xs font-bold text-primary">
                              {u.profileImage ? (
                                <AvatarImage
                                  src={u.profileImage}
                                  alt={u.name}
                                  width={36}
                                  height={36}
                                />
                              ) : (
                                u.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-on-surface">{u.name}</p>
                              <p className="truncate text-[11px] text-on-surface-muted">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 font-semibold text-on-surface">
                          {u.count}
                          <span className="font-normal text-on-surface-muted"> / {u.limit}</span>
                        </td>
                        <td className="py-3 text-on-surface-variant">{u.remaining}</td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                              u.status === "suspended"
                                ? "bg-error-container text-error"
                                : "bg-[#EAF7EF] text-[#287D58]"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

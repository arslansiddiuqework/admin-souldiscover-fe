"use client";

import Link from "next/link";
import { useEngagement } from "@/hooks/useEngagement";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricTile } from "@/components/layout/ScreenHero";
import { AvatarImage } from "@/components/ui/avatar-image";

const formatNum = (n: number) => n.toLocaleString();

export default function EngagementPage() {
  const { data, isLoading, isError, refetch } = useEngagement();

  const moodChecks = data?.mood.perDay.reduce((s, d) => s + d.count, 0) || 0;
  const avgMood =
    data?.mood.perDay.length
      ? Math.round(
          data.mood.perDay.reduce((s, d) => s + d.avgScore, 0) /
            data.mood.perDay.length
        )
      : 0;
  const activityTotal =
    data?.activities.breakdown.reduce((s, a) => s + a.count, 0) || 0;
  const attentionCount = data?.mood.needsAttention.length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Engagement"
        description="Mood check-ins, activities, and chat channels — mirrors what members see on Progress and Dashboard."
        tone="mint"
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
          Could not load engagement data.{" "}
          <button type="button" className="underline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile
              label="Mood check-ins (7d)"
              value={formatNum(moodChecks)}
              hint="Across all members"
              icon="sentiment_satisfied"
              tone="mint"
            />
            <MetricTile
              label="Avg mood score"
              value={avgMood}
              hint="Weekly day averages"
              icon="monitor_heart"
              tone="violet"
            />
            <MetricTile
              label="Activities logged"
              value={formatNum(activityTotal)}
              hint="Last 7 days"
              icon="fitness_center"
              tone="sky"
            />
            <MetricTile
              label="Needs attention"
              value={attentionCount}
              hint="Low mood (&lt;40) this week"
              icon="priority_high"
              tone="alert"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-white p-5 shadow-xs">
              <h2 className="mb-4 text-sm font-bold text-on-surface">Mood by day</h2>
              <div className="space-y-2">
                {data.mood.perDay.length === 0 && (
                  <p className="text-sm text-on-surface-muted">No mood entries this week.</p>
                )}
                {data.mood.perDay.map((d) => (
                  <div key={d.date} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-xs text-on-surface-muted">
                      {d.date.slice(5)}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F3EEF8]">
                      <div
                        className="h-full rounded-full bg-[#7863C6]"
                        style={{
                          width: `${Math.min(100, Math.max(8, d.avgScore))}%`,
                        }}
                      />
                    </div>
                    <span className="w-16 text-right text-xs font-semibold text-on-surface">
                      {d.avgScore} · {d.count}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-white p-5 shadow-xs">
              <h2 className="mb-4 text-sm font-bold text-on-surface">Activity mix</h2>
              <div className="space-y-2">
                {data.activities.breakdown.length === 0 && (
                  <p className="text-sm text-on-surface-muted">No activities this week.</p>
                )}
                {data.activities.breakdown.map((a) => (
                  <div
                    key={a._id}
                    className="flex items-center justify-between rounded-xl bg-[#F8F5FC] px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold capitalize text-on-surface">
                        {a._id || "other"}
                      </p>
                      <p className="text-[11px] text-on-surface-muted">
                        {a.completedCount}/{a.count} completed · {a.totalMinutes || 0} min
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary">{a.count}</span>
                  </div>
                ))}
              </div>

              <h3 className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-on-surface-muted">
                Chat channels
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.chat.messageSources.length === 0 && (
                  <p className="text-sm text-on-surface-muted">No chat messages this week.</p>
                )}
                {data.chat.messageSources.map((s) => (
                  <span
                    key={s.source}
                    className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold capitalize text-on-surface"
                  >
                    {s.source}: {s.count}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-white p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-on-surface">Needs attention</h2>
                <Link href="/users" className="text-xs font-semibold text-primary">
                  Open users
                </Link>
              </div>
              <div className="space-y-2">
                {data.mood.needsAttention.length === 0 && (
                  <p className="text-sm text-on-surface-muted">
                    No members with sustained low mood scores this week.
                  </p>
                )}
                {data.mood.needsAttention.map((u) => (
                  <div
                    key={u.userId}
                    className="flex items-center gap-3 rounded-xl border border-border/80 px-3 py-2.5"
                  >
                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary-container text-xs font-bold text-primary">
                      {u.profileImage ? (
                        <AvatarImage src={u.profileImage} alt={u.name} width={36} height={36} />
                      ) : (
                        u.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-on-surface">{u.name}</p>
                      <p className="truncate text-[11px] text-on-surface-muted">
                        {u.latestMood} · score {u.latestScore} · {u.lowCount} low check-ins
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-white p-5 shadow-xs">
              <h2 className="mb-4 text-sm font-bold text-on-surface">Recent mood check-ins</h2>
              <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                {data.mood.recent.map((m, i) => (
                  <div
                    key={`${m.userId}-${m.timestamp}-${i}`}
                    className="flex items-start justify-between gap-3 rounded-xl bg-[#FFF8FB] px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-on-surface">{m.name}</p>
                      <p className="text-[11px] text-on-surface-muted">
                        {m.mood} · {m.source || "app"} ·{" "}
                        {new Date(m.timestamp).toLocaleString()}
                      </p>
                      {m.note ? (
                        <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant">
                          {m.note}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-primary ring-1 ring-border">
                      {m.score}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

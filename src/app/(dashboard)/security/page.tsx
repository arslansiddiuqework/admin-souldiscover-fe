"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { securityService } from "@/services/securityService";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricTile } from "@/components/layout/ScreenHero";

export default function SecurityPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["security-overview"],
    queryFn: securityService.getOverview,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security"
        description="Authentication failures, permission denials, MFA posture, and privileged admin actions — from real audit events only."
        tone="plum"
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
          Could not load security overview.{" "}
          <button type="button" className="underline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile
              label="Failed logins (7d)"
              value={data.metrics.failedLogins}
              icon="gpp_bad"
              tone="alert"
            />
            <MetricTile
              label="Permission denials"
              value={data.metrics.permissionDenials}
              icon="block"
              tone="peach"
            />
            <MetricTile
              label="MFA failures"
              value={data.metrics.mfaFailures}
              icon="phonelink_lock"
              tone="orchid"
            />
            <MetricTile
              label="Admins with MFA"
              value={`${data.metrics.adminsWithMfa}/${data.metrics.activeAdmins}`}
              hint={
                data.metrics.superAdminsWithoutMfa
                  ? `${data.metrics.superAdminsWithoutMfa} superAdmin without MFA`
                  : "All superAdmins covered or none active"
              }
              icon="verified_user"
              tone="mint"
            />
          </div>

          {data.warnings.length > 0 && (
            <section className="space-y-2">
              {data.warnings.map((w) => (
                <div
                  key={w.code}
                  className="rounded-2xl border border-[#C46B4A]/30 bg-[#FFF1E9] px-4 py-3 text-sm text-[#C46B4A]"
                >
                  <strong className="font-semibold">{w.code}</strong> — {w.message}
                </div>
              ))}
            </section>
          )}

          <section className="rounded-2xl border border-border bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-on-surface">
                Recent WARNING / CRITICAL events
              </h2>
              <Link href="/logs" className="text-xs font-semibold text-primary">
                Full logs
              </Link>
            </div>
            {data.recentEvents.length === 0 ? (
              <p className="text-sm text-on-surface-muted">
                No elevated security events in the last {data.windowDays} days.
              </p>
            ) : (
              <div className="max-h-[420px] space-y-2 overflow-y-auto">
                {data.recentEvents.map((e) => (
                  <div
                    key={e._id}
                    className="rounded-xl border border-border/70 px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#FFF0F2] px-2 py-0.5 text-[10px] font-bold uppercase text-[#B4233D]">
                        {e.severity}
                      </span>
                      <span className="text-[10px] font-semibold uppercase text-on-surface-muted">
                        {e.category} · {e.action}
                      </span>
                      <span className="ml-auto text-[10px] text-on-surface-muted">
                        {new Date(e.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-on-surface">{e.description}</p>
                    <p className="mt-0.5 text-[11px] text-on-surface-muted">
                      {e.email || e.actorType}
                      {e.ip ? ` · ${e.ip}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useWellness } from "@/hooks/useWellness";
import { wellnessService } from "@/services/wellnessService";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers";
import { PageHeader } from "@/components/layout/PageHeader";

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
    limit: 10,
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

  return (
    <div className="flex flex-col gap-4 w-full font-sans text-on-surface">
      <PageHeader
        title="Wellness Plans"
        description="Track user enrollments, completion rates, and plan progress."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Total", value: summary.totalEnrollments },
          { label: "Active", value: summary.active },
          { label: "Completed", value: summary.completed },
          { label: "Paused", value: summary.paused },
          { label: "Avg Completion", value: `${summary.avgCompletionRate}%` },
        ].map((card) => (
          <div key={card.label} className="card p-4">
            <div className="text-[10px] uppercase tracking-wider text-on-surface-variant/70 font-semibold">
              {card.label}
            </div>
            <div className="text-xl font-bold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 card p-4">
        <div className="field-shell">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/80 text-lg">
            search
          </span>
          <input
            className="field-input py-2.5 pl-11 pr-4 text-xs"
            placeholder="Search user, plan, goal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="field-select text-xs"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="admin-table-head">
              <tr>
                <th className="table-head-cell px-6">User</th>
                <th className="table-head-cell px-6">Plan</th>
                <th className="table-head-cell px-6">Status</th>
                <th className="table-head-cell px-6">Progress</th>
                <th className="table-head-cell px-6">Streak</th>
                <th className="table-head-cell px-6">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-on-surface-variant/70">
                    Loading wellness plans...
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-on-surface-variant/70">
                    No wellness enrollments yet. Plans sync when users create or update them in the app.
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr
                    key={plan._id}
                    className="hover:bg-[#FFF0F6] cursor-pointer"
                    onClick={() => openDetail(plan)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold">{plan.user?.name || "Unknown"}</div>
                      <div className="text-[10px] text-on-surface-variant/70">{plan.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium">{plan.title}</div>
                      <div className="text-[10px] text-on-surface-variant/70 capitalize">
                        {plan.catalogSlug || plan.primaryGoal.replace(/_/g, " ")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge uppercase tracking-wider text-[10px] ${
                        plan.status === "completed"
                          ? "badge-success"
                          : plan.status === "paused"
                          ? "badge-warning"
                          : "badge-primary"
                      }`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {plan.completionRate}% ({plan.tasksCompleted}/{plan.tasksTotal})
                    </td>
                    <td className="px-6 py-4 text-xs">{plan.currentStreak}d</td>
                    <td className="px-6 py-4 text-[10px] font-mono text-on-surface-variant/80">
                      {new Date(plan.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs">
          <span className="text-on-surface-variant/80">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
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
            <p className="text-on-surface-variant/70">Loading...</p>
          ) : (
            <>
              <div className="bg-surface-dim p-4 rounded-xl border border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/80">User</span>
                  <span className="font-semibold">{detail?.user?.name || selected?.user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/80">Status</span>
                  <span className="font-semibold capitalize">{detail?.plan?.status || selected?.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/80">Goal</span>
                  <span className="font-semibold capitalize">
                    {(detail?.plan?.primaryGoal || selected?.primaryGoal || "").replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/80">Completion</span>
                  <span className="font-semibold">
                    {detail?.plan?.completionRate ?? selected?.completionRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/80">Streak</span>
                  <span className="font-semibold">
                    {detail?.plan?.currentStreak ?? selected?.currentStreak} / longest{" "}
                    {detail?.plan?.longestStreak ?? selected?.longestStreak}
                  </span>
                </div>
              </div>

              {detail?.plan?.assessment && (
                <div>
                  <h4 className="text-[10px] uppercase font-semibold tracking-wider text-on-surface-variant/80 mb-2">
                    Assessment
                  </h4>
                  <div className="bg-surface-dim p-4 rounded-xl border border-border space-y-2">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant/80">Stress</span>
                      <span>{detail.plan.assessment.stressLevel ?? "—"}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant/80">Sleep</span>
                      <span className="capitalize">{detail.plan.assessment.sleepQuality || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant/80">Daily time</span>
                      <span>{detail.plan.assessment.dailyTime || "—"}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
}

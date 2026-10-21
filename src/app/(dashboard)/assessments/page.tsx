"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAssessments } from "@/hooks/useAssessments";
import {
  assessmentService,
  type AssessmentResultRow,
} from "@/services/assessmentService";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/providers";
import { PageHeader } from "@/components/layout/PageHeader";

type TabId = "catalog" | "completions";

function statusBadge(status: string) {
  if (status === "published") return "badge-success";
  if (status === "coming_soon") return "badge-info";
  if (status === "archived") return "badge-neutral";
  return "badge-warning";
}

export default function AssessmentsAdminPage() {
  const [tab, setTab] = useState<TabId>("catalog");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [results, setResults] = useState<AssessmentResultRow[]>([]);
  const [resultsPage, setResultsPage] = useState(1);
  const [resultsTotalPages, setResultsTotalPages] = useState(1);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [funnel, setFunnel] = useState({
    inProgressSessions: 0,
    abandonedSessions: 0,
  });
  const { showToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { assessments, pagination, summary, isLoading } = useAssessments({
    search: debouncedSearch,
    status,
    page,
    limit: 12,
  });

  const loadResults = useCallback(async () => {
    setResultsLoading(true);
    try {
      const data = await assessmentService.getResults({
        page: resultsPage,
        limit: 15,
      });
      setResults(data.results || []);
      setResultsTotalPages(data.pagination?.totalPages || 1);
      setFunnel(
        data.funnel || { inProgressSessions: 0, abandonedSessions: 0 }
      );
    } catch {
      showToast("Failed to load assessment completions", "error");
      setResults([]);
    } finally {
      setResultsLoading(false);
    }
  }, [resultsPage, showToast]);

  useEffect(() => {
    if (tab === "completions") void loadResults();
  }, [tab, loadResults]);

  const openDetail = async (slug: string) => {
    setSelectedSlug(slug);
    setDetailLoading(true);
    try {
      const data = await assessmentService.getDetail(slug);
      setDetail(data.assessment || data);
    } catch {
      showToast("Failed to load assessment details", "error");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const railFilters = [
    { id: "all", label: "All instruments", count: pagination.total },
    { id: "published", label: "Published", count: summary.published },
    { id: "coming_soon", label: "Coming soon", count: summary.coming_soon },
    { id: "draft", label: "Draft", count: summary.draft },
    { id: "archived", label: "Archived", count: summary.archived },
  ] as const;

  return (
    <div className="page-shell !space-y-4">
      <PageHeader
        eyebrow="Clinical library"
        title="Assessment instruments"
        description="Browse and audit the instrument shelf. Private answer payloads are never exposed here."
        meta={
          <span className="badge badge-neutral">
            {summary.totalCompletions} completions logged
          </span>
        }
        actions={
          <div className="flex gap-1 rounded-lg border border-border bg-white p-0.5">
            {(
              [
                { id: "catalog" as const, label: "Library", icon: "menu_book" },
                {
                  id: "completions" as const,
                  label: "Results",
                  icon: "table_chart",
                },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  tab === t.id
                    ? "bg-[#49263D] text-white"
                    : "text-[#795A70] hover:bg-[#F7F0F5] hover:text-[#49263D]"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        }
      />

      {tab === "catalog" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Left rail — clinical filter nav */}
          <aside className="h-fit rounded-2xl border border-[#E2D8DF] bg-[#FAF7F9] p-3 lg:sticky lg:top-4">
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#927C8B]">
              Filters
            </p>
            <nav className="space-y-0.5">
              {railFilters.map((f) => {
                const active = status === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setStatus(f.id);
                      setPage(1);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-[12px] transition-colors ${
                      active
                        ? "bg-white font-semibold text-[#49263D] shadow-sm ring-1 ring-[#EADCE5]"
                        : "text-[#795A70] hover:bg-white/70 hover:text-[#49263D]"
                    }`}
                  >
                    <span>{f.label}</span>
                    <span
                      className={`tabular-nums text-[10px] ${
                        active ? "text-primary" : "text-[#927C8B]"
                      }`}
                    >
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-4 space-y-2 border-t border-[#EADCE5] pt-3">
              <p className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#927C8B]">
                Shelf summary
              </p>
              <div className="rounded-xl bg-white px-3 py-2.5 ring-1 ring-[#EADCE5]">
                <p className="text-[10px] text-[#927C8B]">Live</p>
                <p className="text-lg font-bold tabular-nums text-[#49263D]">
                  {summary.published}
                </p>
              </div>
              <div className="rounded-xl bg-white px-3 py-2.5 ring-1 ring-[#EADCE5]">
                <p className="text-[10px] text-[#927C8B]">Validated</p>
                <p className="text-[11px] font-medium text-[#49263D]">
                  Open an instrument to review clinical flags
                </p>
              </div>
            </div>
          </aside>

          {/* Library shelf */}
          <div className="min-w-0 space-y-3">
            <div className="field-shell max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant/80">
                search
              </span>
              <input
                className="field-input py-2.5 pl-11 pr-4 text-xs"
                placeholder="Search title or slug…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-44 animate-pulse rounded-xl border border-[#E2D8DF] bg-[#F7F0F5]/60"
                  />
                ))}
              </div>
            ) : assessments.length === 0 ? (
              <div className="empty-state rounded-2xl border border-dashed border-[#E2D8DF] bg-white py-14">
                <div className="empty-state-icon">
                  <span className="material-symbols-outlined text-[28px]">quiz</span>
                </div>
                <p className="text-sm font-semibold text-on-surface">No assessments found</p>
                <p className="max-w-xs text-xs text-on-surface-variant">
                  Try adjusting search or status filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {assessments.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => void openDetail(a.slug)}
                    className="group flex flex-col overflow-hidden rounded-xl border border-[#E2D8DF] bg-white text-left transition-all hover:border-[#49263D]/25 hover:shadow-[0_10px_28px_rgba(73,38,61,0.08)]"
                  >
                    {/* Spine accent — library shelf metaphor */}
                    <div className="flex h-1.5 w-full bg-[#49263D]">
                      <span
                        className={`h-full ${
                          a.status === "published"
                            ? "w-full bg-[#B74783]"
                            : a.status === "coming_soon"
                              ? "w-2/3 bg-[#9658B7]"
                              : "w-1/3 bg-[#C4A8B8]"
                        }`}
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`badge capitalize text-[9px] ${statusBadge(a.status)}`}
                        >
                          {a.status.replace("_", " ")}
                        </span>
                        <span className="font-mono text-[10px] text-[#927C8B]">
                          v{a.version}
                        </span>
                      </div>
                      <h3 className="mt-2.5 line-clamp-2 text-[14px] font-bold leading-snug tracking-tight text-[#49263D] group-hover:text-primary">
                        {a.title}
                      </h3>
                      <p className="mt-1 truncate font-mono text-[10px] text-[#927C8B]">
                        {a.slug}
                      </p>

                      <div className="mt-auto flex items-end justify-between gap-2 border-t border-[#F0E8ED] pt-3">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-[#927C8B]">
                            Completions
                          </p>
                          <p className="text-base font-bold tabular-nums text-[#49263D]">
                            {a.completions}
                          </p>
                        </div>
                        <div className="text-right">
                          {a.clinicallyValidated ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#287D58]">
                              <span className="material-symbols-outlined text-[14px]">
                                verified
                              </span>
                              Clinical
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#927C8B]">Not validated</span>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 truncate text-[10px] text-[#795A70]">
                        {a.licenseSource || "License TBD"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#795A70]">
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="soft-btn"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="soft-btn"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "completions" && (
        <div className="space-y-3">
          {/* Funnel strip — clinical, flat, ink-led */}
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-[#E2D8DF] bg-[#E2D8DF]">
            {[
              {
                label: "Saved results",
                value: summary.totalCompletions,
                hint: "Completed instruments",
              },
              {
                label: "In progress",
                value: funnel.inProgressSessions,
                hint: "Open sessions",
              },
              {
                label: "Abandoned",
                value: funnel.abandonedSessions,
                hint: "Dropped mid-flow",
              },
            ].map((cell) => (
              <div key={cell.label} className="bg-white px-4 py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#927C8B]">
                  {cell.label}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-[#49263D]">
                  {cell.value}
                </p>
                <p className="mt-0.5 text-[11px] text-[#795A70]">{cell.hint}</p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E2D8DF] bg-white">
            <div className="flex items-center justify-between border-b border-[#E2D8DF] bg-[#FAF7F9] px-4 py-3">
              <div>
                <h2 className="text-sm font-bold text-[#49263D]">Results ledger</h2>
                <p className="text-[11px] text-[#795A70]">
                  Scores & labels only — answers omitted
                </p>
              </div>
              <span className="text-[11px] font-medium text-[#927C8B]">
                {results.length} on page
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead>
                  <tr className="border-b border-[#E2D8DF] text-[10px] font-bold uppercase tracking-[0.1em] text-[#927C8B]">
                    <th className="px-4 py-2.5 font-bold">Member</th>
                    <th className="px-4 py-2.5 font-bold">Instrument</th>
                    <th className="px-4 py-2.5 font-bold">Interpretation</th>
                    <th className="px-4 py-2.5 font-bold">Score</th>
                    <th className="px-4 py-2.5 font-bold">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E8ED]">
                  {resultsLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-xs text-[#795A70]"
                      >
                        Loading completions…
                      </td>
                    </tr>
                  ) : results.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-state py-12">
                          <div className="empty-state-icon">
                            <span className="material-symbols-outlined text-[28px]">
                              assignment_turned_in
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-on-surface">
                            No saved completions yet
                          </p>
                          <p className="max-w-xs text-xs text-on-surface-variant">
                            Completions appear once members finish an instrument.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    results.map((r) => (
                      <tr
                        key={r.resultId}
                        className="transition-colors hover:bg-[#FAF7F9]"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#49263D] text-[11px] font-bold text-white">
                              {(r.user.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-[12px] font-semibold text-[#49263D]">
                                {r.user.name}
                              </div>
                              <div className="text-[10px] text-[#927C8B]">
                                {r.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[12px] font-medium text-[#49263D]">
                            {r.title}
                          </div>
                          <div className="font-mono text-[10px] text-[#927C8B]">
                            {r.assessmentSlug} · v{r.instrumentVersion}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#795A70]">
                          {r.interpretationLabel || r.scoringMethod || "—"}
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px] font-semibold tabular-nums text-[#49263D]">
                          {r.totalScore != null && r.maxScore != null
                            ? `${r.totalScore}/${r.maxScore}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-[11px] tabular-nums text-[#795A70]">
                          {r.completedAt
                            ? new Date(r.completedAt).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {resultsTotalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2D8DF] px-4 py-3 text-xs text-[#795A70]">
                <span>
                  Page {resultsPage} of {resultsTotalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={resultsPage <= 1}
                    onClick={() => setResultsPage((p) => Math.max(1, p - 1))}
                    className="soft-btn"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={resultsPage >= resultsTotalPages}
                    onClick={() => setResultsPage((p) => p + 1)}
                    className="soft-btn"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            <p className="border-t border-[#E2D8DF] bg-[#FAF7F9] px-4 py-2.5 text-[11px] text-[#795A70]">
              Answer content is intentionally omitted for privacy.
            </p>
          </div>
        </div>
      )}

      <Drawer
        isOpen={Boolean(selectedSlug)}
        onClose={() => {
          setSelectedSlug(null);
          setDetail(null);
        }}
        title={detail?.title || "Assessment detail"}
      >
        {detailLoading ? (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-xl bg-[#F7F0F5]" />
            <div className="h-40 animate-pulse rounded-xl bg-[#F7F0F5]" />
          </div>
        ) : detail ? (
          <div className="space-y-4 text-sm">
            <dl className="space-y-3 rounded-xl border border-[#E2D8DF] bg-[#FAF7F9] p-4 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-[#927C8B]">Slug / Version</dt>
                <dd className="font-mono font-semibold text-[#49263D]">
                  {detail.slug} · {detail.version}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[#927C8B]">Status</dt>
                <dd className="capitalize font-semibold text-[#49263D]">
                  {String(detail.status || "").replace("_", " ")}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[#927C8B]">Completions</dt>
                <dd className="font-semibold tabular-nums text-[#49263D]">
                  {detail.completions ?? 0}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[#927C8B]">Questions</dt>
                <dd className="font-semibold tabular-nums text-[#49263D]">
                  {detail.questionCount ?? detail.questions?.length ?? 0}
                </dd>
              </div>
            </dl>

            <div className="rounded-xl border border-[#E2D8DF] p-4 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#927C8B]">
                License
              </p>
              <p className="mt-1 font-medium text-[#49263D]">
                {detail.license?.source || detail.licenseSource}
              </p>
              {detail.license?.notes ? (
                <p className="mt-1 text-[#795A70]">{detail.license.notes}</p>
              ) : null}
              {detail.note ? (
                <p className="mt-3 rounded-lg border border-amber-200/50 bg-amber-50 p-2.5 text-amber-900/80">
                  {detail.note}
                </p>
              ) : null}
            </div>

            {Array.isArray(detail.questions) && detail.questions.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#927C8B]">
                  Question structure (no answers)
                </p>
                <ul className="max-h-64 space-y-2 overflow-y-auto">
                  {detail.questions.map((q: any) => (
                    <li
                      key={q.id}
                      className="rounded-lg border border-[#E2D8DF] bg-white p-2.5 text-xs"
                    >
                      <span className="font-mono font-medium text-[#49263D]">{q.id}</span>
                      <span className="text-[#927C8B]"> · {q.responseType}</span>
                      <div className="mt-1 line-clamp-2 text-[#795A70]">{q.text}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-on-surface-variant/70">No details available.</p>
        )}
      </Drawer>
    </div>
  );
}

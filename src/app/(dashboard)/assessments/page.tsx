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
import { MetricTile } from "@/components/layout/ScreenHero";

type TabId = "catalog" | "completions";

function statusBadge(status: string) {
  if (status === "published") return "badge-success";
  if (status === "coming_soon") return "badge-sky";
  if (status === "archived") return "badge-neutral";
  return "badge-warning";
}

/** Spine colour per status — shelf metaphor, violet-led */
function spineClass(status: string) {
  if (status === "published") return "bg-gradient-to-r from-[#5B3FA8] to-[#7C69EF]";
  if (status === "coming_soon") return "bg-gradient-to-r from-[#315FC2] to-[#4F7FE8]";
  if (status === "archived") return "bg-[#C9BFD6]";
  return "bg-gradient-to-r from-[#C46B4A] to-[#E39B7D]";
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
    { id: "all", label: "All instruments", count: pagination.total, dot: "bg-[#7863C6]" },
    { id: "published", label: "Published", count: summary.published, dot: "bg-[#287D58]" },
    { id: "coming_soon", label: "Coming soon", count: summary.coming_soon, dot: "bg-[#4F7FE8]" },
    { id: "draft", label: "Draft", count: summary.draft, dot: "bg-[#C46B4A]" },
    { id: "archived", label: "Archived", count: summary.archived, dot: "bg-[#B5A8C4]" },
  ] as const;

  return (
    <div className="page-shell !space-y-4">
      <PageHeader
        tone="violet"
        eyebrow="Clinical library"
        title="Assessment instruments"
        description="Browse and audit the instrument shelf. Private answer payloads are never exposed here."
        meta={
          <span className="badge badge-violet">
            {summary.totalCompletions} completions logged
          </span>
        }
        actions={
          <div className="flex gap-1 rounded-full border border-[#E3DBF5] bg-white/90 p-1 shadow-xs">
            {(
              [
                { id: "catalog" as const, label: "Library", icon: "menu_book" },
                { id: "completions" as const, label: "Results", icon: "table_chart" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all ${
                  tab === t.id
                    ? "bg-gradient-to-r from-[#7C69EF] to-[#7863C6] text-white shadow-violet"
                    : "text-[#795A70] hover:bg-[#F0EAFE] hover:text-[#5B3FA8]"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile
          tone="violet"
          icon="menu_book"
          label="Instruments"
          value={pagination.total}
          hint="On the shelf"
          spark={[2, 3, 3, 4, 4, 5, 5, 6]}
        />
        <MetricTile
          tone="mint"
          icon="verified"
          label="Published"
          value={summary.published}
          hint="Live to members"
          spark={[1, 2, 2, 3, 4, 4, 5, 6]}
        />
        <MetricTile
          tone="sky"
          icon="hourglass_top"
          label="Coming soon"
          value={summary.coming_soon}
          hint="In the pipeline"
          spark={[3, 3, 4, 3, 4, 5, 4, 5]}
        />
        <MetricTile
          tone="peach"
          icon="edit_note"
          label="Draft"
          value={summary.draft}
          hint="Awaiting review"
          spark={[4, 3, 4, 2, 3, 2, 3, 2]}
        />
      </div>

      {tab === "catalog" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[236px_minmax(0,1fr)]">
          {/* Left rail */}
          <aside className="h-fit overflow-hidden rounded-[22px] border border-[#E3DBF5] bg-white shadow-card lg:sticky lg:top-4">
            <div className="bg-gradient-to-br from-[#49263D] via-[#3F2A66] to-[#5B3FA8] px-4 py-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D9CCFF]">
                Library index
              </p>
              <p className="mt-0.5 text-sm font-bold text-white">Filter by status</p>
            </div>
            <nav className="space-y-0.5 p-2">
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
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-[12px] transition-all ${
                      active
                        ? "bg-[#F0EAFE] font-semibold text-[#5B3FA8] ring-1 ring-[#D9CCFF]"
                        : "text-[#795A70] hover:bg-[#F8F5FF] hover:text-[#49263D]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${f.dot}`} />
                      {f.label}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                        active ? "bg-white text-[#7863C6]" : "bg-[#F4F0F8] text-[#927C8B]"
                      }`}
                    >
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="space-y-2 border-t border-[#EDE7F7] p-3">
              <div className="rounded-xl bg-[#EAF7EF] px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#287D58]">
                  Live now
                </p>
                <p className="text-lg font-bold tabular-nums text-[#49263D]">
                  {summary.published}
                </p>
              </div>
              <div className="rounded-xl bg-[#EEF4FF] px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#315FC2]">
                  Clinical flags
                </p>
                <p className="text-[11px] font-medium leading-snug text-[#49263D]">
                  Open an instrument to review validation and licensing
                </p>
              </div>
            </div>
          </aside>

          {/* Shelf */}
          <div className="min-w-0 space-y-3">
            <div className="field-shell max-w-md !rounded-full !border-[#E3DBF5]">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-[#7863C6]">
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
                    className="h-48 animate-pulse rounded-[20px] border border-[#E3DBF5] bg-[#F0EAFE]/60"
                  />
                ))}
              </div>
            ) : assessments.length === 0 ? (
              <div className="empty-state rounded-[22px] border border-dashed border-[#D9CCFF] bg-white py-14">
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
                    className="group flex flex-col overflow-hidden rounded-[20px] border border-[#E3DBF5] bg-white text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-[#B8A9FF] hover:shadow-[0_14px_34px_rgba(120,99,198,0.18)]"
                  >
                    <div className={`h-2 w-full ${spineClass(a.status)}`} />
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`badge capitalize text-[9px] ${statusBadge(a.status)}`}
                        >
                          {a.status.replace("_", " ")}
                        </span>
                        <span className="rounded-md bg-[#F4F0F8] px-1.5 py-0.5 font-mono text-[10px] text-[#795A70]">
                          v{a.version}
                        </span>
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-[14px] font-bold leading-snug tracking-tight text-[#49263D] group-hover:text-[#5B3FA8]">
                        {a.title}
                      </h3>
                      <p className="mt-1 truncate font-mono text-[10px] text-[#927C8B]">
                        {a.slug}
                      </p>

                      <div className="mt-auto flex items-end justify-between gap-2 border-t border-[#EDE7F7] pt-3">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-[#927C8B]">
                            Completions
                          </p>
                          <p className="text-lg font-bold tabular-nums text-[#7863C6]">
                            {a.completions}
                          </p>
                        </div>
                        <div className="text-right">
                          {a.clinicallyValidated ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF7EF] px-2 py-1 text-[10px] font-semibold text-[#287D58]">
                              <span className="material-symbols-outlined text-[13px]">
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
                    className="soft-btn-violet"
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricTile
              tone="violet"
              icon="assignment_turned_in"
              label="Saved results"
              value={summary.totalCompletions}
              hint="Completed instruments"
            />
            <MetricTile
              tone="sky"
              icon="pending_actions"
              label="In progress"
              value={funnel.inProgressSessions}
              hint="Open sessions"
              spark={[2, 3, 3, 4, 3, 4, 5, 4]}
            />
            <MetricTile
              tone="peach"
              icon="logout"
              label="Abandoned"
              value={funnel.abandonedSessions}
              hint="Dropped mid-flow"
              spark={[5, 4, 4, 3, 3, 2, 3, 2]}
            />
          </div>

          <div className="overflow-hidden rounded-[22px] border border-[#E3DBF5] bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-[#E3DBF5] bg-gradient-to-r from-[#F0EAFE] to-[#FAF8FF] px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-[#49263D]">Results ledger</h2>
                <p className="text-[11px] text-[#795A70]">
                  Scores & labels only — answers omitted
                </p>
              </div>
              <span className="badge badge-violet">{results.length} on page</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead>
                  <tr className="border-b border-[#EDE7F7] bg-[#FAF8FF] text-[10px] font-bold uppercase tracking-[0.1em] text-[#927C8B]">
                    <th className="px-5 py-3 font-bold">Member</th>
                    <th className="px-4 py-3 font-bold">Instrument</th>
                    <th className="px-4 py-3 font-bold">Interpretation</th>
                    <th className="px-4 py-3 font-bold">Score</th>
                    <th className="px-4 py-3 font-bold">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1ECF9]">
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
                        className="transition-colors hover:bg-[#F8F5FF]"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#49263D] text-[11px] font-bold text-white ring-2 ring-[#F0EAFE]">
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
                        <td className="px-4 py-3">
                          <span className="rounded-lg bg-[#F0EAFE] px-2 py-1 font-mono text-[12px] font-bold tabular-nums text-[#5B3FA8]">
                            {r.totalScore != null && r.maxScore != null
                              ? `${r.totalScore}/${r.maxScore}`
                              : "—"}
                          </span>
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
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EDE7F7] px-5 py-3 text-xs text-[#795A70]">
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
                    className="soft-btn-violet"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            <p className="flex items-center gap-1.5 border-t border-[#EDE7F7] bg-[#FAF8FF] px-5 py-2.5 text-[11px] text-[#795A70]">
              <span className="material-symbols-outlined text-[14px] text-[#7863C6]">
                lock
              </span>
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
            <div className="h-24 animate-pulse rounded-xl bg-[#F0EAFE]" />
            <div className="h-40 animate-pulse rounded-xl bg-[#F0EAFE]" />
          </div>
        ) : detail ? (
          <div className="space-y-4 text-sm">
            <dl className="space-y-3 rounded-2xl border border-[#E3DBF5] bg-[#F8F5FF] p-4 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-[#927C8B]">Slug / Version</dt>
                <dd className="font-mono font-semibold text-[#49263D]">
                  {detail.slug} · {detail.version}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[#927C8B]">Status</dt>
                <dd className="capitalize font-semibold text-[#5B3FA8]">
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

            <div className="rounded-2xl border border-[#E3DBF5] p-4 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7863C6]">
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
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7863C6]">
                  Question structure (no answers)
                </p>
                <ul className="max-h-64 space-y-2 overflow-y-auto">
                  {detail.questions.map((q: any) => (
                    <li
                      key={q.id}
                      className="rounded-xl border border-[#E3DBF5] border-l-[3px] border-l-[#7863C6] bg-white p-2.5 text-xs"
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

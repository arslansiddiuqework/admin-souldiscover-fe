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
    limit: 10,
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

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Clinical"
        title="Assessment Center"
        description="Catalog metadata, publication status, and completion tracking. Private answer payloads are never exposed here."
        meta={
          <span className="badge badge-primary">{summary.totalCompletions} completions</span>
        }
        actions={
          <div className="flex gap-2">
            {(
              [
                { id: "catalog" as const, label: "Catalog" },
                { id: "completions" as const, label: "Completions" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={tab === t.id ? "soft-btn-primary" : "soft-btn"}
              >
                {t.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Published", value: summary.published },
          { label: "Coming soon", value: summary.coming_soon },
          { label: "Draft", value: summary.draft },
          { label: "Archived", value: summary.archived },
          { label: "Completions", value: summary.totalCompletions },
        ].map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-[20px] border border-border bg-white/90 p-4 shadow-card"
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 80% 80% at 0% 0%, rgba(255,229,240,0.7), transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="text-[10px] uppercase tracking-wider text-on-surface-variant/70 font-semibold">
                {card.label}
              </div>
              <div className="text-xl font-bold mt-1.5 text-on-surface">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {tab === "completions" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-[20px] border border-border bg-white/90 p-4 shadow-card">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 80% 80% at 0% 0%, rgba(241,234,255,0.8), transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="text-[10px] uppercase tracking-wider text-on-surface-variant/70 font-semibold">
                In progress
              </div>
              <div className="text-xl font-bold mt-1.5">{funnel.inProgressSessions}</div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[20px] border border-border bg-white/90 p-4 shadow-card">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 80% 80% at 0% 0%, rgba(255,229,240,0.7), transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="text-[10px] uppercase tracking-wider text-on-surface-variant/70 font-semibold">
                Abandoned
              </div>
              <div className="text-xl font-bold mt-1.5">{funnel.abandonedSessions}</div>
            </div>
          </div>
        </div>
      )}

      {tab === "catalog" && (
      <>
      <div className="filter-bar">
        <div className="field-shell">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/80 text-lg">
            search
          </span>
          <input
            className="field-input py-2.5 pl-11 pr-4 text-xs"
            placeholder="Search assessments..."
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
          <option value="published">Published</option>
          <option value="coming_soon">Coming soon</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="text-sm font-semibold text-on-surface">Instrument catalog</h2>
            <p className="text-[11px] text-on-surface-variant/70 mt-0.5">
              Publication status and clinical validation
            </p>
          </div>
          <span className="badge badge-neutral">{pagination.total} instruments</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="admin-table-head">
              <tr>
                <th className="table-head-cell px-6">Assessment</th>
                <th className="table-head-cell px-6">Status</th>
                <th className="table-head-cell px-6">Version</th>
                <th className="table-head-cell px-6">Clinical</th>
                <th className="table-head-cell px-6">Completions</th>
                <th className="table-head-cell px-6">License</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-on-surface-variant/70">
                    Loading assessments...
                  </td>
                </tr>
              ) : assessments.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <span className="material-symbols-outlined text-[28px]">quiz</span>
                      </div>
                      <p className="text-sm font-semibold text-on-surface">No assessments found</p>
                      <p className="text-xs text-on-surface-variant max-w-xs">
                        Try adjusting search or status filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                assessments.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-[#FFF0F6]/80 cursor-pointer transition-colors"
                    onClick={() => void openDetail(a.slug)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{a.title}</div>
                      <div className="text-[11px] text-on-surface-variant/70">{a.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge capitalize text-[10px] ${
                        a.status === "published"
                          ? "badge-success"
                          : a.status === "coming_soon"
                          ? "badge-info"
                          : a.status === "archived"
                          ? "badge-neutral"
                          : "badge-warning"
                      }`}>
                        {a.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">{a.version}</td>
                    <td className="px-6 py-4 text-xs">
                      {a.clinicallyValidated ? (
                        <span className="badge badge-success text-[10px]">Validated</span>
                      ) : (
                        <span className="badge badge-neutral text-[10px]">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">{a.completions}</td>
                    <td className="px-6 py-4 text-xs max-w-[220px] truncate">{a.licenseSource}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="pagination-bar text-xs">
            <span className="text-on-surface-variant/70">
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
      </>
      )}

      {tab === "completions" && (
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2 className="text-sm font-semibold text-on-surface">Saved completions</h2>
              <p className="text-[11px] text-on-surface-variant/70 mt-0.5">
                Answer content is intentionally omitted for privacy
              </p>
            </div>
            <span className="badge badge-neutral">{results.length} on page</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="admin-table-head">
                <tr>
                  <th className="table-head-cell px-6">User</th>
                  <th className="table-head-cell px-6">Assessment</th>
                  <th className="table-head-cell px-6">Result</th>
                  <th className="table-head-cell px-6">Score</th>
                  <th className="table-head-cell px-6">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {resultsLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-xs text-on-surface-variant/70"
                    >
                      Loading completions...
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <div className="empty-state-icon">
                          <span className="material-symbols-outlined text-[28px]">assignment_turned_in</span>
                        </div>
                        <p className="text-sm font-semibold text-on-surface">No saved completions yet</p>
                        <p className="text-xs text-on-surface-variant max-w-xs">
                          Completions appear here once members finish an instrument.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  results.map((r) => (
                    <tr key={r.resultId} className="hover:bg-[#FFF0F6]/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary-container ring-1 ring-border flex items-center justify-center font-semibold text-sm text-primary flex-shrink-0">
                            {(r.user.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{r.user.name}</div>
                            <div className="text-[11px] text-on-surface-variant/70">
                              {r.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{r.title}</div>
                        <div className="text-[11px] text-on-surface-variant/70">
                          {r.assessmentSlug} · v{r.instrumentVersion}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {r.interpretationLabel || r.scoringMethod || "—"}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {r.totalScore != null && r.maxScore != null
                          ? `${r.totalScore}/${r.maxScore}`
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-xs">
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
            <div className="pagination-bar text-xs">
              <span className="text-on-surface-variant/70">
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
          <p className="px-5 py-3 text-[11px] text-on-surface-variant/70 border-t border-border bg-[#FFF8FB]/40">
            Answer content is intentionally omitted for privacy.
          </p>
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
          <p className="text-xs text-on-surface-variant/70">Loading...</p>
        ) : detail ? (
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-[10px] uppercase text-on-surface-variant/70">Slug / Version</div>
              <div>
                {detail.slug} · {detail.version}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-on-surface-variant/70">Status</div>
              <div className="capitalize">{String(detail.status || "").replace("_", " ")}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-on-surface-variant/70">License</div>
              <div>{detail.license?.source || detail.licenseSource}</div>
              {detail.license?.notes && (
                <p className="text-xs text-on-surface-variant/80 mt-1">{detail.license.notes}</p>
              )}
            </div>
            <div>
              <div className="text-[10px] uppercase text-on-surface-variant/70">Questions</div>
              <div>{detail.questionCount ?? detail.questions?.length ?? 0}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-on-surface-variant/70">Completions</div>
              <div>{detail.completions ?? 0}</div>
            </div>
            {Array.isArray(detail.questions) && detail.questions.length > 0 && (
              <div>
                <div className="text-[10px] uppercase text-on-surface-variant/70 mb-2">
                  Question structure (no user answers)
                </div>
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {detail.questions.map((q: any) => (
                    <li key={q.id} className="rounded bg-[#FFF8FB]/80 p-2 text-xs">
                      <span className="font-medium">{q.id}</span>
                      <span className="text-on-surface-variant/70"> · {q.responseType}</span>
                      <div className="mt-1 text-on-surface-variant/90 line-clamp-2">{q.text}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {detail.note && (
              <p className="text-xs text-amber-200/90 border border-amber-200/20 rounded p-3">
                {detail.note}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-on-surface-variant/70">No details available.</p>
        )}
      </Drawer>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useAssessments } from "@/hooks/useAssessments";
import { assessmentService } from "@/services/assessmentService";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/providers";

export default function AssessmentsAdminPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
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

  const { assessments, pagination, summary, isLoading } = useAssessments({
    search: debouncedSearch,
    status,
    page,
    limit: 10,
  });

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
    <div className="flex flex-col gap-4 w-full font-inter text-on-surface">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-on-surface">
          Assessment Center
        </h2>
        <p className="text-xs text-on-surface-variant/80 mt-1">
          Manage catalog metadata, publication status, and aggregate usage. Individual mental health
          responses are not shown here by default. Scoring rule changes require a new instrument
          version.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Published", value: summary.published },
          { label: "Coming soon", value: summary.coming_soon },
          { label: "Draft", value: summary.draft },
          { label: "Archived", value: summary.archived },
          { label: "Completions", value: summary.totalCompletions },
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
        <div className="relative rounded bg-surface-dim border border-outline-variant">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/80 text-lg">
            search
          </span>
          <input
            className="w-full bg-transparent border-none py-2.5 pl-11 pr-4 text-xs outline-none"
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
          className="rounded bg-surface-dim border border-outline-variant py-2.5 px-3 text-xs outline-none"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="coming_soon">Coming soon</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-white/[0.04] border-b border-white/[0.06]">
              <tr>
                <th className="px-6 py-3 text-xs text-on-surface-variant/70 font-semibold">
                  Assessment
                </th>
                <th className="px-6 py-3 text-xs text-on-surface-variant/70 font-semibold">
                  Status
                </th>
                <th className="px-6 py-3 text-xs text-on-surface-variant/70 font-semibold">
                  Version
                </th>
                <th className="px-6 py-3 text-xs text-on-surface-variant/70 font-semibold">
                  Clinical
                </th>
                <th className="px-6 py-3 text-xs text-on-surface-variant/70 font-semibold">
                  Completions
                </th>
                <th className="px-6 py-3 text-xs text-on-surface-variant/70 font-semibold">
                  License
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-on-surface-variant/70">
                    Loading assessments...
                  </td>
                </tr>
              ) : assessments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-on-surface-variant/70">
                    No assessments found.
                  </td>
                </tr>
              ) : (
                assessments.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-white/[0.03] cursor-pointer"
                    onClick={() => void openDetail(a.slug)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{a.title}</div>
                      <div className="text-[11px] text-on-surface-variant/70">{a.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-xs capitalize">{a.status.replace("_", " ")}</td>
                    <td className="px-6 py-4 text-xs">{a.version}</td>
                    <td className="px-6 py-4 text-xs">
                      {a.clinicallyValidated ? "Validated" : "No"}
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
          <div className="flex items-center justify-between px-6 py-3 border-t border-white/[0.06]">
            <span className="text-xs text-on-surface-variant/70">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-xs px-3 py-1.5 rounded border border-white/10 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs px-3 py-1.5 rounded border border-white/10 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

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
                    <li key={q.id} className="rounded bg-white/[0.04] p-2 text-xs">
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

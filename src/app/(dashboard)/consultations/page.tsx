"use client";

import React, { useEffect, useState } from "react";
import { useConsultations } from "@/hooks/useConsultations";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/providers";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ConsultationsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    consultations,
    pagination,
    summary,
    isLoading,
    updateStatus,
    isUpdatingStatus,
  } = useConsultations({
    search: debouncedSearch,
    status,
    page,
    limit: 10,
  });

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Clinical"
        title="Consultations"
        description="Track psychologist booking requests, session timing, and payment status across the care network."
        meta={
          <span className="badge badge-primary">{summary.totalBookings} bookings</span>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Total", value: summary.totalBookings },
          { label: "Scheduled", value: summary.scheduled },
          { label: "Upcoming", value: summary.upcoming },
          { label: "Completed", value: summary.completed },
          { label: "Cancelled", value: summary.cancelled },
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

      <div className="filter-bar">
        <div className="field-shell">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/80 text-lg">
            search
          </span>
          <input
            className="field-input py-2.5 pl-11 pr-4 text-xs"
            placeholder="Search client, reason, psychologist..."
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
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="text-sm font-semibold text-on-surface">Bookings</h2>
            <p className="text-[11px] text-on-surface-variant/70 mt-0.5">
              Appear when members book from Pricing or Dashboard
            </p>
          </div>
          <span className="badge badge-neutral">{pagination.total} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="admin-table-head">
              <tr>
                <th className="table-head-cell px-6">Client</th>
                <th className="table-head-cell px-6">Psychologist</th>
                <th className="table-head-cell px-6">When</th>
                <th className="table-head-cell px-6">Status</th>
                <th className="table-head-cell px-6">Payment</th>
                <th className="table-head-cell px-6">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-on-surface-variant/70">
                    Loading consultations...
                  </td>
                </tr>
              ) : consultations.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <span className="material-symbols-outlined text-[28px]">event_busy</span>
                      </div>
                      <p className="text-sm font-semibold text-on-surface">No bookings yet</p>
                      <p className="text-xs text-on-surface-variant max-w-sm">
                        They appear here when users book from Pricing / Dashboard.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                consultations.map((booking) => (
                  <tr
                    key={booking._id}
                    className="hover:bg-[#FFF0F6]/80 cursor-pointer transition-colors"
                    onClick={() => setSelected(booking)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary-container ring-1 ring-border flex items-center justify-center font-semibold text-sm text-primary flex-shrink-0">
                          {(booking.clientName || "C").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-semibold">{booking.clientName}</div>
                          <div className="text-[10px] text-on-surface-variant/70">{booking.clientEmail}</div>
                          {booking.user && (
                            <div className="text-[10px] text-on-surface-variant/55 mt-0.5">
                              Account: {booking.user.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">{booking.psychologistName}</td>
                    <td className="px-6 py-4 text-xs">
                      <div>{booking.date}</div>
                      <div className="text-[10px] text-on-surface-variant/70">{booking.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge uppercase tracking-wider text-[10px] ${
                        booking.status === "completed"
                          ? "badge-success"
                          : booking.status === "cancelled"
                          ? "badge-error"
                          : "badge-primary"
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge badge-neutral text-[10px] uppercase">
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant/80 max-w-[220px] truncate">
                      {booking.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar text-xs">
          <span className="text-on-surface-variant/80">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="soft-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="soft-btn"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Drawer
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.clientName || "Booking"}
        subtitle={selected?.clientEmail || ""}
      >
        <div className="space-y-4 text-xs">
          <div className="bg-surface-dim p-4 rounded-xl border border-border space-y-2">
            <div className="flex justify-between">
              <span className="text-on-surface-variant/80">Psychologist</span>
              <span className="font-semibold">{selected?.psychologistName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant/80">Date / Time</span>
              <span className="font-semibold">
                {selected?.date} · {selected?.time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant/80">Duration</span>
              <span className="font-semibold">{selected?.durationMinutes} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant/80">Price</span>
              <span className="font-semibold">${selected?.priceUsd}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant/80">Status</span>
              <select
                value={selected?.status || "scheduled"}
                disabled={isUpdatingStatus}
                onChange={async (e) => {
                  try {
                    const next = e.target.value as "scheduled" | "completed" | "cancelled";
                    await updateStatus({ id: selected._id, status: next });
                    setSelected((prev: any) => (prev ? { ...prev, status: next } : null));
                    showToast("Booking status updated", "success");
                  } catch {
                    showToast("Failed to update status", "error");
                  }
                }}
                className="field-select text-[10px] font-semibold uppercase py-1 px-2"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase font-semibold tracking-wider text-on-surface-variant/80 mb-2">
              Reason
            </h4>
            <p className="bg-surface-dim p-4 rounded-xl border border-border leading-relaxed">
              {selected?.reason || "—"}
            </p>
          </div>

          {selected?.notes && (
            <div>
              <h4 className="text-[10px] uppercase font-semibold tracking-wider text-on-surface-variant/80 mb-2">
                Notes
              </h4>
              <p className="bg-surface-dim p-4 rounded-xl border border-border leading-relaxed">
                {selected.notes}
              </p>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useConsultations } from "@/hooks/useConsultations";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/providers";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricTile } from "@/components/layout/ScreenHero";

const STATUS_CHIPS = [
  { id: "all", label: "All" },
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

function statusStyle(status: string) {
  if (status === "completed")
    return { pill: "bg-[#EAF7EF] text-[#287D58] border-[#287D58]/25", bar: "bg-[#287D58]" };
  if (status === "cancelled")
    return { pill: "bg-[#FFF0F2] text-[#B4233D] border-[#B4233D]/25", bar: "bg-[#B4233D]" };
  return { pill: "bg-[#FFF1E9] text-[#C46B4A] border-[#C46B4A]/30", bar: "bg-[#C46B4A]" };
}

function paymentStyle(payment: string) {
  const p = String(payment || "").toLowerCase();
  if (p === "paid" || p === "completed" || p === "succeeded")
    return "bg-[#EAF7EF] text-[#287D58] border-[#287D58]/25";
  if (p === "failed" || p === "refunded")
    return "bg-[#FFF0F2] text-[#B4233D] border-[#B4233D]/25";
  return "bg-[#EEF4FF] text-[#315FC2] border-[#4F7FE8]/25";
}

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
        tone="peach"
        eyebrow="Booking desk"
        title="Consultations"
        description="Track psychologist booking requests, session timing, and payment status across the care network."
        meta={
          <span className="badge badge-peach">{summary.totalBookings} bookings</span>
        }
        aside={
          <div className="relative hidden h-28 w-44 shrink-0 lg:block">
            <div className="absolute inset-0 rounded-[26px] bg-gradient-to-br from-[#FDBA74]/50 via-[#FFE5D6] to-[#F0EAFE] blur-xl" />
            <div className="relative flex h-full flex-col justify-between rounded-[24px] border border-[#F3D5C6] bg-white/90 p-3.5 shadow-lifted">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-[20px] text-[#C46B4A]">
                  event_available
                </span>
                <span className="rounded-full bg-[#FFF1E9] px-2 py-0.5 text-[10px] font-bold text-[#C46B4A]">
                  Next up
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums text-[#49263D]">
                  {summary.upcoming}
                </p>
                <p className="text-[11px] text-[#795A70]">upcoming sessions</p>
              </div>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricTile
          tone="peach"
          icon="calendar_month"
          label="Total"
          value={summary.totalBookings}
          spark={[2, 3, 3, 4, 5, 4, 6, 7]}
        />
        <MetricTile
          tone="sky"
          icon="event"
          label="Scheduled"
          value={summary.scheduled}
          spark={[3, 2, 4, 3, 5, 4, 5, 6]}
        />
        <MetricTile
          tone="violet"
          icon="schedule"
          label="Upcoming"
          value={summary.upcoming}
          spark={[1, 2, 2, 3, 3, 4, 4, 5]}
        />
        <MetricTile
          tone="mint"
          icon="task_alt"
          label="Completed"
          value={summary.completed}
          spark={[1, 1, 2, 3, 3, 4, 5, 6]}
        />
        <MetricTile
          tone="alert"
          icon="event_busy"
          label="Cancelled"
          value={summary.cancelled}
          spark={[3, 2, 3, 2, 2, 1, 2, 1]}
        />
      </div>

      {/* Desk toolbar */}
      <div className="flex flex-col gap-3 rounded-[22px] border border-[#F3D5C6] bg-gradient-to-r from-[#FFF8F3] to-white p-3.5 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div className="field-shell w-full lg:max-w-md !rounded-full !border-[#F3D5C6]">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-[#C46B4A]">
            search
          </span>
          <input
            className="field-input py-2.5 pl-11 pr-4 text-xs"
            placeholder="Search client, reason, psychologist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => {
                setStatus(chip.id);
                setPage(1);
              }}
              className={`rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-all ${
                status === chip.id
                  ? "border-transparent bg-gradient-to-r from-[#C46B4A] to-[#E08A66] text-white shadow-[0_8px_20px_rgba(196,107,74,0.3)]"
                  : "border-[#F3D5C6] bg-white text-[#795A70] hover:bg-[#FFF1E9] hover:text-[#C46B4A]"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-[#F3D5C6] bg-white shadow-card">
        <div className="flex items-center justify-between gap-3 border-b border-[#F3D5C6] bg-[#FFF8F3] px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-[#49263D]">Bookings</h2>
            <p className="mt-0.5 text-[11px] text-[#795A70]">
              Appear when members book from Pricing or Dashboard
            </p>
          </div>
          <span className="badge badge-peach">{pagination.total} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead>
              <tr className="border-b border-[#F8E6DC] bg-[#FFFBF8]">
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#A8745C]">Client</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#A8745C]">Psychologist</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#A8745C]">When</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#A8745C]">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#A8745C]">Payment</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#A8745C]">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FBEDE4]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-[#795A70]">
                    Loading consultations...
                  </td>
                </tr>
              ) : consultations.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1E9] text-[#C46B4A] ring-1 ring-[#F3D5C6]">
                        <span className="material-symbols-outlined text-[28px]">event_busy</span>
                      </div>
                      <p className="text-sm font-semibold text-on-surface">No bookings yet</p>
                      <p className="max-w-sm text-xs text-on-surface-variant">
                        They appear here when users book from Pricing / Dashboard.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                consultations.map((booking) => {
                  const st = statusStyle(booking.status);
                  return (
                    <tr
                      key={booking._id}
                      className="group cursor-pointer transition-colors hover:bg-[#FFF8F3]"
                      onClick={() => setSelected(booking)}
                    >
                      <td className="relative px-6 py-4">
                        <span
                          className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${st.bar}`}
                        />
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFE5D6] to-[#FFF1E9] text-sm font-bold text-[#C46B4A] ring-2 ring-white shadow-xs">
                            {(booking.clientName || "C").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-[#49263D]">
                              {booking.clientName}
                            </div>
                            <div className="text-[10px] text-[#927C8B]">
                              {booking.clientEmail}
                            </div>
                            {booking.user && (
                              <div className="mt-0.5 text-[10px] text-[#A8745C]">
                                Account: {booking.user.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-[#49263D]">
                        {booking.psychologistName}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="font-semibold text-[#49263D]">{booking.date}</div>
                        <div className="text-[10px] text-[#C46B4A]">{booking.time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`badge border uppercase tracking-wider text-[10px] ${st.pill}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`badge border text-[10px] uppercase ${paymentStyle(
                            booking.paymentStatus
                          )}`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="max-w-[220px] truncate px-6 py-4 text-xs text-[#795A70]">
                        {booking.reason}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#F3D5C6] bg-[#FFFBF8] px-5 py-3.5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[#795A70]">
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
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C46B4A] to-[#E08A66] px-3.5 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(196,107,74,0.28)] transition-all disabled:pointer-events-none disabled:opacity-45"
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
          <div className="space-y-2.5 rounded-2xl border border-[#F3D5C6] bg-[#FFF8F3] p-4">
            <div className="flex justify-between">
              <span className="text-[#A8745C]">Psychologist</span>
              <span className="font-semibold text-[#49263D]">{selected?.psychologistName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A8745C]">Date / Time</span>
              <span className="font-semibold text-[#49263D]">
                {selected?.date} · {selected?.time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A8745C]">Duration</span>
              <span className="font-semibold text-[#49263D]">{selected?.durationMinutes} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A8745C]">Price</span>
              <span className="font-semibold text-[#C46B4A]">${selected?.priceUsd}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A8745C]">Status</span>
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
                className="field-select px-2 py-1 text-[10px] font-semibold uppercase"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#C46B4A]">
              Reason
            </h4>
            <p className="rounded-2xl border border-[#F3D5C6] bg-white p-4 leading-relaxed text-[#49263D]">
              {selected?.reason || "—"}
            </p>
          </div>

          {selected?.notes && (
            <div>
              <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#C46B4A]">
                Notes
              </h4>
              <p className="rounded-2xl border border-[#F3D5C6] bg-white p-4 leading-relaxed text-[#49263D]">
                {selected.notes}
              </p>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}

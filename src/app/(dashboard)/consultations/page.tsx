"use client";

import React, { useEffect, useState } from "react";
import { useConsultations } from "@/hooks/useConsultations";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
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
    <div className="flex flex-col gap-4 w-full font-sans text-on-surface">
      <PageHeader
        title="Consultations"
        description="Track psychologist booking requests and session status."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Total", value: summary.totalBookings },
          { label: "Scheduled", value: summary.scheduled },
          { label: "Upcoming", value: summary.upcoming },
          { label: "Completed", value: summary.completed },
          { label: "Cancelled", value: summary.cancelled },
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

      <div className="card overflow-hidden">
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
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-on-surface-variant/70">
                    No bookings yet. They appear here when users book from Pricing / Dashboard.
                  </td>
                </tr>
              ) : (
                consultations.map((booking) => (
                  <tr
                    key={booking._id}
                    className="hover:bg-[#FFF0F6] cursor-pointer"
                    onClick={() => setSelected(booking)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold">{booking.clientName}</div>
                      <div className="text-[10px] text-on-surface-variant/70">{booking.clientEmail}</div>
                      {booking.user && (
                        <div className="text-[10px] text-on-surface-variant/55 mt-0.5">
                          Account: {booking.user.name}
                        </div>
                      )}
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
                    <td className="px-6 py-4 text-[10px] uppercase text-on-surface-variant/80">
                      {booking.paymentStatus}
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

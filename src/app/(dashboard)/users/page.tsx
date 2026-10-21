"use client";

import React, { useState, useEffect } from "react";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { Drawer } from "@/components/ui/Drawer";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers";
import { useSearchParams } from "next/navigation";
import { AvatarImage } from "@/components/ui/avatar-image";
import { PageHeader } from "@/components/layout/PageHeader";

function hasActiveAlert(user: any) {
  const risk = user?.lastEscalation?.riskLevel;
  return risk === "HIGH" || risk === "CRITICAL";
}

export default function UsersPage() {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(querySearch);
  const [debouncedSearch, setDebouncedSearch] = useState(querySearch);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { showToast } = useToast();
  const { adminUser } = useAuth();

  useEffect(() => {
    if (querySearch) {
      setSearch(querySearch);
      setDebouncedSearch(querySearch);
    }
  }, [querySearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    users,
    pagination,
    isLoading,
    deleteUser,
    updateUserStatus,
    isUpdatingStatus,
  } = useUsers({
    search: debouncedSearch,
    status,
    page,
    limit: 10,
  });

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userDetail, setUserDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);

  const openUser = async (user: any) => {
    setSelectedUser(user);
    setDetailLoading(true);
    try {
      const detail = await userService.getUserDetail(user._id);
      setUserDetail(detail);
    } catch {
      setUserDetail(null);
      showToast("Could not load full user detail", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsActionPending(true);
    try {
      await deleteUser(userToDelete._id);
      showToast(`User account deleted permanently`, "success");
      setSelectedUser(null);
      setUserDetail(null);
    } catch {
      showToast("Failed to delete user.", "error");
    } finally {
      setIsActionPending(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full font-sans text-on-surface">
      <PageHeader
        title="Users"
        description="Manage all registered user accounts."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 card p-4">
        <div className="field-shell">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/80 text-lg">search</span>
          <input
            type="text"
            className="field-input py-2.5 pl-11 pr-4 text-xs"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="admin-table-head">
              <tr>
                <th className="table-head-cell px-6">User</th>
                <th className="table-head-cell px-6">Status</th>
                <th className="table-head-cell px-6">Emergency</th>
                <th className="table-head-cell px-6">Registered</th>
                <th className="table-head-cell px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-on-surface-variant/70">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-on-surface-variant/70">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr
                    key={user._id}
                    className="hover:bg-[#FFF0F6] transition-colors cursor-pointer group"
                    onClick={() => openUser(user)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-dim border border-outline-variant flex items-center justify-center font-semibold text-xs text-primary shadow-sm overflow-hidden">
                          {user.profileImage ? (
                            <AvatarImage src={user.profileImage} alt={user.name} width={32} height={32} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors">
                            {user.name}
                          </div>
                          <div className="text-[10px] text-on-surface-variant/70">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.status === "suspended" ? (
                        <span className="badge badge-error uppercase tracking-wider text-[10px]">
                          suspended
                        </span>
                      ) : (
                        <span className="badge badge-success uppercase tracking-wider text-[10px]">
                          active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {hasActiveAlert(user) ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-error text-on-error uppercase tracking-wider animate-pulse">
                          {user.lastEscalation.riskLevel}
                        </span>
                      ) : user.hasEmergencyContacts ? (
                        <span className="text-[10px] text-on-surface-variant/80">
                          Contacts set
                        </span>
                      ) : (
                        <span className="text-[10px] text-on-surface-variant/80">Stable</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[10px] font-mono text-on-surface-variant/80">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openUser(user)}
                          className="p-1.5 border border-outline-variant hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                        {adminUser?.role === "superAdmin" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserToDelete(user);
                            }}
                            className="p-1.5 border border-outline-variant hover:bg-error/10 hover:border-error/40 text-error rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-surface-dim/50 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between font-sans text-xs">
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
        isOpen={!!selectedUser}
        onClose={() => {
          setSelectedUser(null);
          setUserDetail(null);
        }}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-surface-dim border border-outline-variant flex items-center justify-center font-bold text-[10px] text-primary shadow-sm overflow-hidden flex-shrink-0">
              {selectedUser?.profileImage ? (
                <AvatarImage src={selectedUser.profileImage} alt={selectedUser.name} width={28} height={28} className="w-full h-full object-cover" />
              ) : (
                (selectedUser?.name || "Unknown").charAt(0).toUpperCase()
              )}
            </div>
            <span>{selectedUser?.name || "User Details"}</span>
          </div>
        }
        subtitle={`User ID: ${selectedUser?._id || "N/A"}`}
      >
        <div className="space-y-6 font-sans text-xs text-on-surface">
          {detailLoading && (
            <p className="text-on-surface-variant/70">Loading full profile...</p>
          )}

          <div className="bg-surface-dim p-4 rounded-xl border border-border space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant/80">Email</span>
              <span className="font-semibold text-on-surface">{selectedUser?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant/80 font-medium">Status</span>
              <select
                value={selectedUser?.status || "active"}
                disabled={isUpdatingStatus}
                onChange={async (e) => {
                  try {
                    const newStatus = e.target.value as "active" | "suspended";
                    await updateUserStatus({ id: selectedUser._id, status: newStatus });
                    setSelectedUser((prev: any) => (prev ? { ...prev, status: newStatus } : null));
                    showToast("User status updated successfully", "success");
                  } catch (err: any) {
                    showToast(err.response?.data?.message || "Failed to update status", "error");
                  }
                }}
                className={`field-select text-[10px] font-semibold uppercase tracking-wider py-1 w-auto min-w-[7rem] ${
                  (selectedUser?.status || "active") === "suspended"
                    ? "text-error border-error/30"
                    : "text-primary border-primary/30"
                }`}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant/80">AI Companion</span>
              <span className="font-semibold">
                {userDetail?.user?.aiName || selectedUser?.aiName || "Maya"} ·{" "}
                {userDetail?.user?.aiBehavior || selectedUser?.aiBehavior || "supportive"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant/80">Emergency Alert</span>
              <span className="font-semibold">
                {hasActiveAlert(selectedUser)
                  ? `${selectedUser.lastEscalation.riskLevel} (${selectedUser.lastEscalation.outcome})`
                  : "None"}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase font-semibold tracking-wider text-on-surface-variant/80 mb-2">
              Activity Snapshot
            </h4>
            <div className="bg-surface-dim p-4 rounded-xl border border-border space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-on-surface-variant/80">Registered</span>
                <span>
                  {selectedUser?.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant/80">Sessions</span>
                <span>{selectedUser?.sessionCount || userDetail?.sessions?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant/80">Mood entries</span>
                <span>{userDetail?.mood?.totalEntries ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant/80">Weekly mood avg</span>
                <span>
                  {userDetail?.mood ? `${userDetail.mood.weeklyAvgScore}/100` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant/80">Activities logged</span>
                <span>{userDetail?.activity?.totalEntries ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant/80">Wellness plans</span>
                <span>{userDetail?.wellnessPlans?.length ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant/80">Consultations</span>
                <span>{userDetail?.consultations?.length ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant/80">Assessments</span>
                <span>{userDetail?.assessments?.totalCompletions ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant/80">Assessments in progress</span>
                <span>{userDetail?.assessments?.inProgressSessions ?? "—"}</span>
              </div>
            </div>
          </div>

          {userDetail?.mood?.recent?.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase font-semibold tracking-wider text-on-surface-variant/80 mb-2">
                Recent Mood
              </h4>
              <div className="bg-surface-dim p-4 rounded-xl border border-border space-y-2">
                {userDetail.mood.recent.map((m: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span>
                      {m.mood || "Check-in"} · {m.score}/100
                    </span>
                    <span className="text-on-surface-variant/70">
                      {m.timestamp ? new Date(m.timestamp).toLocaleDateString() : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userDetail?.activity?.recent?.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase font-semibold tracking-wider text-on-surface-variant/80 mb-2">
                Recent Activity
              </h4>
              <div className="bg-surface-dim p-4 rounded-xl border border-border space-y-2">
                {userDetail.activity.recent.map((a: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span>
                      {a.name || a.type}
                      {a.completed ? "" : " · open"}
                    </span>
                    <span className="text-on-surface-variant/70">
                      {a.timestamp ? new Date(a.timestamp).toLocaleDateString() : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userDetail?.assessments?.recent?.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase font-semibold tracking-wider text-on-surface-variant/80 mb-2">
                Assessment Completions
              </h4>
              <div className="bg-surface-dim p-4 rounded-xl border border-border space-y-2">
                {userDetail.assessments.recent.map((r: any) => (
                  <div key={r.resultId} className="flex justify-between gap-3 text-[11px]">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{r.title}</div>
                      <div className="text-on-surface-variant/70">
                        {r.interpretationLabel || r.scoringMethod || "Completed"}
                      </div>
                    </div>
                    <span className="shrink-0 text-on-surface-variant/70">
                      {r.completedAt
                        ? new Date(r.completedAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userDetail?.sessions?.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase font-semibold tracking-wider text-on-surface-variant/80 mb-2">
                Recent Therapy Sessions
              </h4>
              <div className="bg-surface-dim p-4 rounded-xl border border-border space-y-2">
                {userDetail.sessions.slice(0, 8).map((s: any) => (
                  <div key={s.sessionId} className="flex justify-between text-[11px]">
                    <span className="truncate">{s.title || "Session"}</span>
                    <span className="text-on-surface-variant/70 capitalize">
                      {s.status} · {s.messageCount} msgs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userDetail?.emergencyContacts?.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase font-semibold tracking-wider text-on-surface-variant/80 mb-2">
                Emergency Contacts
              </h4>
              <div className="bg-surface-dim p-4 rounded-xl border border-border space-y-2">
                {userDetail.emergencyContacts.map((c: any, idx: number) => (
                  <div key={idx} className="flex justify-between gap-3">
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-[10px] text-on-surface-variant/70">{c.relationship}</div>
                    </div>
                    <div className="text-right text-[10px] text-on-surface-variant/80">
                      <div>{c.phone || c.whatsapp || "—"}</div>
                      <div className="capitalize">{c.preferredMethod || ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userDetail?.wellnessPlans?.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase font-semibold tracking-wider text-on-surface-variant/80 mb-2">
                Wellness Plans
              </h4>
              <div className="bg-surface-dim p-4 rounded-xl border border-border space-y-2">
                {userDetail.wellnessPlans.map((p: any) => (
                  <div key={p.planId || p._id} className="flex justify-between">
                    <span>{p.title}</span>
                    <span className="text-on-surface-variant/80">
                      {p.status} · {p.completionRate}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userDetail?.consultations?.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase font-semibold tracking-wider text-on-surface-variant/80 mb-2">
                Consultations
              </h4>
              <div className="bg-surface-dim p-4 rounded-xl border border-border space-y-2">
                {userDetail.consultations.map((c: any) => (
                  <div key={c.bookingId || c._id} className="flex justify-between">
                    <span>
                      {c.date} {c.time}
                    </span>
                    <span className="capitalize text-on-surface-variant/80">{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {adminUser?.role === "superAdmin" && (
            <div className="pt-4 border-t border-border flex gap-2">
              <Button variant="danger" className="flex-1" onClick={() => setUserToDelete(selectedUser)}>
                Delete User
              </Button>
            </div>
          )}
        </div>
      </Drawer>

      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete User Account"
        description={`Are you sure you want to permanently delete "${userToDelete?.name}"? This action cannot be undone.`}
        confirmText="Permanently Delete"
        isConfirming={isActionPending}
        variant="danger"
      />
    </div>
  );
}

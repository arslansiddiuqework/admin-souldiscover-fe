"use client";

import React, { useState, useEffect } from "react";
import { useUsers } from "@/hooks/useUsers";
import { sessionService } from "@/services/sessionService";
import { useAuth } from "@/hooks/useAuth";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/providers";
import { useSearchParams } from "next/navigation";
import { AvatarImage } from "@/components/ui/avatar-image";
import { PageHeader } from "@/components/layout/PageHeader";

export default function SessionsPage() {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(querySearch);
  const [debouncedSearch, setDebouncedSearch] = useState(querySearch);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { showToast } = useToast();
  const { adminUser } = useAuth();

  // Sync URL search params
  useEffect(() => {
    if (querySearch) {
      setSearch(querySearch);
      setDebouncedSearch(querySearch);
    }
  }, [querySearch]);

  // Debounce search term to prevent rapid refetching during typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Use users hook instead of sessions to group sessions by user
  const {
    users,
    pagination,
    isLoading
  } = useUsers({
    search: debouncedSearch,
    status: status === "all" ? undefined : status,
    page,
    limit: 12
  });

  const [selectedUserForSessions, setSelectedUserForSessions] = useState<any | null>(null);
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [isUserSessionsLoading, setIsUserSessionsLoading] = useState(false);

  const [inspectSession, setInspectSession] = useState<any | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Fetch a selected user's sessions
  const handleSelectUser = async (user: any) => {
    setSelectedUserForSessions(user);
    setIsUserSessionsLoading(true);
    try {
      const fetchedSessions = await sessionService.getUserSessions(user._id);
      setUserSessions(fetchedSessions);
    } catch (e) {
      console.error(e);
      showToast("Failed to fetch user's sessions", "error");
      setUserSessions([]);
    } finally {
      setIsUserSessionsLoading(false);
    }
  };

  // Inspect a specific session from the user's list
  const handleInspect = async (session: any) => {
    setIsDetailLoading(true);
    setInspectSession({ ...session, messages: [], isFetching: true });
    try {
      const detail = await sessionService.getSessionDetail(session.sessionId);
      setInspectSession({
        ...session,
        messages: detail.messages || [],
        isFetching: false
      });
    } catch (e) {
      console.error(e);
      setInspectSession({ ...session, messages: [], isFetching: false, error: true });
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Clinical"
        title="Sessions Directory"
        description="Browse therapy sessions grouped by member profiles — open a card to review history, risk flags, and secure transcripts."
        meta={
          <span className="badge badge-primary">{pagination.total} members</span>
        }
      />

      <div className="filter-bar">
        <div className="field-shell">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/80 text-lg">search</span>
          <input
            type="text"
            className="field-input py-2.5 pl-11 pr-4 text-xs"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="field-select text-xs"
        >
          <option value="all">All Users</option>
          <option value="active">Active Users</option>
          <option value="suspended">Suspended Users</option>
        </select>

        <div className="flex items-center justify-end text-xs text-on-surface-variant/80 font-medium px-1">
          Showing {users.length} of {pagination.total}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, idx) => (
            <div key={idx} className="h-52 rounded-[22px] border border-border bg-white/70 animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="empty-state-icon">
              <span className="material-symbols-outlined text-[28px]">group_off</span>
            </div>
            <p className="text-sm font-semibold text-on-surface">No users found</p>
            <p className="text-xs text-on-surface-variant max-w-xs">
              Adjust search parameters or filter criteria.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {users.map((user: any) => (
            <div
              key={user._id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] border border-border bg-white/90 p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover cursor-pointer"
              onClick={() => handleSelectUser(user)}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-90"
                style={{
                  backgroundImage:
                    "radial-gradient(ellipse 80% 70% at 0% 0%, rgba(255,229,240,0.95), transparent 55%), radial-gradient(ellipse 60% 50% at 100% 0%, rgba(241,234,255,0.7), transparent 50%)",
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-12 w-12 rounded-full bg-primary-container ring-1 ring-border flex items-center justify-center font-bold text-lg text-primary overflow-hidden group-hover:ring-primary/40 transition-colors flex-shrink-0">
                    {user.profileImage ? (
                      <AvatarImage src={user.profileImage} alt={user.name} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      (user.name || "U").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <h3 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                      {user.name || "Unknown User"}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant/75 mt-0.5 font-mono line-clamp-1">{user.email}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center rounded-2xl border border-border bg-white/70 p-3.5 mb-5 backdrop-blur-sm">
                  <div className="text-center flex-1 border-r border-border">
                    <div className="text-[10px] uppercase text-on-surface-variant/70 tracking-wider font-semibold">Sessions</div>
                    <div className="text-sm font-bold text-on-surface mt-1">{user.sessionCount || 0}</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-[10px] uppercase text-on-surface-variant/70 tracking-wider font-semibold">Status</div>
                    <div className="mt-1.5 flex justify-center">
                      <span className={`badge text-[9px] uppercase tracking-wider ${
                        user.status === "suspended" ? "badge-error" : "badge-success"
                      }`}>
                        {user.status || "Active"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="relative soft-btn w-full group-hover:border-primary/30 group-hover:bg-[#FFF0F6] group-hover:text-primary"
                onClick={(e) => { e.stopPropagation(); handleSelectUser(user); }}
              >
                <span className="material-symbols-outlined text-[15px]">list_alt</span>
                View Sessions
              </button>
            </div>
          ))}
        </div>
      )}

      {!isLoading && users.length > 0 && (
        <div className="panel">
          <div className="pagination-bar text-xs !border-t-0">
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
      )}

      {/* Drawer 1: User's Session List */}
      <Drawer
        isOpen={!!selectedUserForSessions && !inspectSession}
        onClose={() => setSelectedUserForSessions(null)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-full bg-primary-container ring-1 ring-border flex items-center justify-center font-bold text-sm text-primary overflow-hidden flex-shrink-0">
              {selectedUserForSessions?.profileImage ? (
                <AvatarImage src={selectedUserForSessions.profileImage} alt={selectedUserForSessions.name} width={40} height={40} className="w-full h-full object-cover" />
              ) : (
                (selectedUserForSessions?.name || "U").charAt(0).toUpperCase()
              )}
            </div>
            <span>{selectedUserForSessions?.name}&apos;s Sessions</span>
          </div>
        }
        subtitle={`${selectedUserForSessions?.email}`}
      >
        <div className="space-y-4 font-sans text-xs text-on-surface">
          {isUserSessionsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-surface border border-border rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : userSessions.length === 0 ? (
            <div className="empty-state py-10">
              <div className="empty-state-icon">
                <span className="material-symbols-outlined text-[24px]">inbox</span>
              </div>
              <p className="text-sm font-semibold text-on-surface">No sessions yet</p>
              <p className="text-xs text-on-surface-variant">This user has no recorded sessions.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userSessions.map((session) => (
                <div 
                  key={session.sessionId}
                  className="bg-surface-dim border border-border rounded-xl p-4 flex justify-between items-center hover:border-primary/40 cursor-pointer transition-colors group"
                  onClick={() => handleInspect({ ...session, userName: selectedUserForSessions.name, userProfileImage: selectedUserForSessions.profileImage })}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-[10px] text-on-surface-variant/70 uppercase">ID: {session.sessionId.substring(0,8)}</span>
                      <span className={`badge text-[9px] uppercase tracking-wider ${
                        session.status === "active" ? "badge-primary" : 
                        session.status === "completed" ? "badge-neutral" : 
                        "badge-warning"
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="text-[11px] flex items-center gap-1.5 text-on-surface">
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant">schedule</span>
                      {new Date(session.startTime || Date.now()).toLocaleDateString()} • {session.duration || "0m"}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {session.hasRisk && (
                      <span className="badge badge-error text-[9px] uppercase tracking-wider">
                        High Risk
                      </span>
                    )}
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[18px]">
                      chevron_right
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Drawer>

      {/* Drawer 2: Session Detail Inspect (Chat) */}
      <Drawer
        isOpen={!!inspectSession}
        onClose={() => setInspectSession(null)}
        title={
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setInspectSession(null)} 
              className="p-1 hover:bg-surface-container-high rounded-full transition-colors mr-1"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            </button>
            <div className="h-10 w-10 rounded-full bg-primary-container ring-1 ring-border flex items-center justify-center font-bold text-sm text-primary overflow-hidden flex-shrink-0">
              {inspectSession?.userProfileImage ? (
                <AvatarImage src={inspectSession.userProfileImage} alt={inspectSession.userName} width={40} height={40} className="w-full h-full object-cover" />
              ) : (
                (inspectSession?.userName || "U").charAt(0).toUpperCase()
              )}
            </div>
            <span>Chat History: {inspectSession?.userName}</span>
          </div>
        }
        subtitle={`Session ID: ${inspectSession?.sessionId}`}
      >
        <div className="space-y-6 font-sans text-xs text-on-surface">
          {/* Sentiment HUD */}
          <div className="bg-surface-dim p-4 rounded-xl border border-border flex justify-between items-center font-mono">
            <div>
              <div className="text-on-surface-variant/80 text-[10px] uppercase font-sans">Duration</div>
              <div className="text-sm font-semibold text-on-surface mt-1 font-sans">{inspectSession?.duration || "0m"}</div>
            </div>
            <div>
              <div className="text-on-surface-variant/80 text-[10px] uppercase text-right font-sans">Patient Status</div>
              <div className="text-sm font-semibold mt-1 text-right font-sans flex justify-end">
                <span className={`badge text-[10px] uppercase tracking-wide font-sans ${inspectSession?.hasRisk ? "badge-error" : "badge-success"}`}>
                  {inspectSession?.hasRisk ? "High Risk" : "Stable"}
                </span>
              </div>
            </div>
          </div>

          {/* Session Status Manager */}
          <div className="bg-surface-dim p-4 rounded-xl border border-border flex justify-between items-center">
            <span className="text-on-surface-variant/80 text-[10px] uppercase font-semibold tracking-wider">Session Status</span>
            {adminUser?.role === "superAdmin" ? (
              <select
                value={inspectSession?.status || "active"}
                onChange={async (e) => {
                  const newStatus = e.target.value as "active" | "completed" | "archived";
                  try {
                    await sessionService.updateSessionStatus(inspectSession.sessionId, newStatus);
                    showToast(`Session status updated to ${newStatus}`, "success");
                    setInspectSession((prev: any) => prev ? { ...prev, status: newStatus } : null);
                    // Also update it in the userSessions list
                    setUserSessions(prev => prev.map(s => s.sessionId === inspectSession.sessionId ? { ...s, status: newStatus } : s));
                  } catch (err) {
                    showToast("Failed to update session status.", "error");
                  }
                }}
                className="field-select text-xs py-1.5 w-auto min-w-[8rem]"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            ) : (
              <span className={`badge text-[10px] uppercase tracking-wider ${
                inspectSession?.status === "active" 
                  ? "badge-primary" 
                  : inspectSession?.status === "completed"
                  ? "badge-neutral"
                  : "badge-warning"
              }`}>
                {inspectSession?.status || "active"}
              </span>
            )}
          </div>

          {/* Transcript logs */}
          <div>
            <h4 className="text-[10px] uppercase font-semibold tracking-wider text-on-surface-variant/80 mb-3 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">chat</span>
              Chat Conversation History
            </h4>
            <div className="bg-surface-dim border border-border rounded-xl p-4 space-y-4 max-h-[360px] overflow-y-auto">
              {inspectSession?.isFetching ? (
                <div className="text-center text-on-surface-variant/50 py-8 animate-pulse text-[11px]">Loading transcript...</div>
              ) : !inspectSession?.hasRisk ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary-container ring-1 ring-border flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">lock</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-on-surface">Transcript Privacy Enabled</h5>
                    <p className="text-[10px] text-on-surface-variant/75 mt-1 leading-normal max-w-[240px] mx-auto">
                      To protect patient privacy, chat transcripts are securely encrypted. They are only accessible to administrators when a safety check flags the session as High Risk.
                    </p>
                  </div>
                </div>
              ) : !inspectSession?.messages || inspectSession.messages.length === 0 ? (
                <div className="text-center text-on-surface-variant/50 py-8 text-[11px]">No messages in this session.</div>
              ) : (
                inspectSession.messages.map((msg: any, idx: number) => (
                  <div key={idx} className={`space-y-1 ${msg.role === "user" ? "" : "text-right"}`}>
                    <div className="text-[9px] uppercase tracking-wider text-on-surface-variant/70 font-semibold font-mono">
                      {msg.role === "user" ? inspectSession.userName : "AI Therapist"} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className={`p-3 rounded-lg text-[11px] leading-relaxed max-w-[85%] inline-block text-left ${msg.role === "user"
                        ? "bg-surface border border-border text-on-surface"
                        : "bg-primary/10 border border-primary/20 text-primary"
                      }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Compliance dispatch block */}
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
            <div>
              <p className="font-semibold text-primary text-[11px]">Secure Conversation</p>
              <p className="text-[10px] text-on-surface-variant/80 mt-0.5">This conversation is private and securely encrypted.</p>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers";
import { authService } from "@/services/authService";
import { Edit2, Check, X, Camera, Trash2, User as UserIcon } from "lucide-react";
import { AvatarImage } from "@/components/ui/avatar-image";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ProfilePage() {
  const { adminUser, logout, isLoggingOut, updateProfile, isUpdatingProfile, deleteAvatar, isDeletingAvatar } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adminUser?.name) {
      setNameInput(adminUser.name);
    }
  }, [adminUser]);

  const handleSignOut = async () => {
    try {
      await logout();
      showToast("You have been signed out", "info");
      router.push("/login");
    } catch {
      showToast("Sign out failed", "error");
    }
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      showToast("Name cannot be empty", "error");
      return;
    }
    try {
      await updateProfile({ name: nameInput });
      setIsEditing(false);
      showToast("Name updated successfully", "success");
    } catch {
      showToast("Failed to update name", "error");
    }
  };

  const handleAvatarClick = () => {
    if (isUploading || isDeletingAvatar) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be less than 5MB", "error");
      return;
    }

    try {
      setIsUploading(true);
      const { imageUrl } = await authService.uploadAvatar(file);
      await updateProfile({ profileImage: imageUrl });
      showToast("Profile image updated successfully", "success");
    } catch (error: any) {
      console.error(error);
      showToast("Failed to upload profile picture", "error");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteAvatar = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!adminUser?.profileImage) return;

    try {
      await deleteAvatar();
      showToast("Profile image removed", "success");
    } catch (error: any) {
      console.error(error);
      showToast("Failed to delete profile picture", "error");
    }
  };

  const isAvatarBusy = isUploading || isDeletingAvatar;

  return (
    <div className="page-shell mx-auto max-w-3xl">
      <PageHeader
        tone="orchid"
        eyebrow="Account"
        title="Account Profile"
        description="Manage your admin account information and session access."
        meta={
          <>
            <span className="badge badge-success">Active session</span>
            {adminUser?.role ? (
              <span className="badge badge-primary">{adminUser.role}</span>
            ) : null}
          </>
        }
      />

      {/* Brand moment — the one place orchid leads */}
      <div className="overflow-hidden rounded-[28px] border border-[#EBDDF3] bg-white shadow-lifted">
        <div
          className="relative h-32 sm:h-36"
          style={{
            background:
              "radial-gradient(ellipse 60% 120% at 0% 0%, rgba(255,229,240,0.55), transparent 60%), radial-gradient(ellipse 50% 100% at 100% 100%, rgba(79,127,232,0.45), transparent 60%), linear-gradient(120deg, #B74783 0%, #9658B7 50%, #7863C6 100%)",
          }}
        >
          <span
            aria-hidden
            className="absolute -right-6 -top-10 h-40 w-40 rounded-full border border-white/20"
          />
          <span
            aria-hidden
            className="absolute right-10 top-6 h-20 w-20 rounded-full border border-white/25"
          />
          <span className="absolute left-5 top-4 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
            Soul Discovery Admin
          </span>
        </div>

        <div className="relative px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative flex-shrink-0">
              <div
                onClick={handleAvatarClick}
                className="group relative flex h-24 w-24 cursor-pointer select-none items-center justify-center overflow-hidden rounded-[28px] border-4 border-white bg-[#FFE5F0] text-lg font-semibold text-[#B74783] shadow-lifted transition-all hover:scale-[1.02]"
                title="Click to change profile picture"
              >
                {adminUser?.profileImage ? (
                  <AvatarImage
                    src={adminUser.profileImage}
                    alt={adminUser.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <UserIcon className="h-9 w-9 text-[#B74783]/70" />
                )}
                {isAvatarBusy ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-scrim">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-scrim opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              {adminUser?.profileImage ? (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={isAvatarBusy || isUpdatingProfile}
                  className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-error text-error-foreground transition-colors hover:bg-error/90 disabled:pointer-events-none disabled:opacity-60"
                  title="Delete profile picture"
                  aria-label="Delete profile picture"
                >
                  {isDeletingAvatar ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              ) : null}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              disabled={isAvatarBusy}
            />

            <div className="flex-1 pb-1">
              {isEditing ? (
                <div className="flex max-w-sm items-center gap-2">
                  <div className="field-shell flex-1">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="field-input px-3 py-2 text-sm"
                      disabled={isUpdatingProfile}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={isUpdatingProfile}
                    className="cursor-pointer rounded-xl bg-[#EAF7EF] p-2 text-[#287D58] transition-colors hover:bg-[#D5F0E0]"
                    title="Save changes"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(adminUser?.name || "");
                      setIsEditing(false);
                    }}
                    disabled={isUpdatingProfile}
                    className="cursor-pointer rounded-xl bg-error/10 p-2 text-error transition-colors hover:bg-error/20"
                    title="Cancel editing"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-[#49263D]">
                    {adminUser?.name || "Admin User"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer rounded-lg p-1.5 text-[#927C8B] transition-colors hover:bg-[#FFE5F0] hover:text-[#B74783]"
                    title="Edit name"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <p className="mt-0.5 text-xs font-semibold text-[#B74783]">
                {adminUser?.role || "Administrator"}
              </p>
            </div>
          </div>

          {/* Account Info — multi-hue tiles */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#DCE7FF] bg-[#EEF4FF] p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#315FC2]">
                <span className="material-symbols-outlined text-[14px]">mail</span>
                Email
              </p>
              <p className="mt-1.5 break-all text-xs font-semibold text-[#49263D]">
                {adminUser?.email || "Not available"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E3DBF5] bg-[#F0EAFE] p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5B3FA8]">
                <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                Role
              </p>
              <p className="mt-1.5 text-xs font-semibold text-[#49263D]">
                {adminUser?.role || "Administrator"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#CFEBDC] bg-[#EAF7EF] p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#287D58]">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                Last login
              </p>
              <p className="mt-1.5 font-mono text-xs font-semibold text-[#49263D]">
                {adminUser?.lastLogin || "Unknown"}
              </p>
            </div>
          </div>

          {/* Session Info */}
          <div className="mt-3 space-y-3 rounded-2xl border border-[#EBDDF3] bg-[#FDF8FC] p-4">
            <p className="label-eyebrow !text-[#B74783]">Session Information</p>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#795A70]">Status</span>
              <span className="badge badge-success text-[10px]">Active</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between border-t border-[#EBDDF3] pt-5">
            <p className="text-[10px] text-[#927C8B]">Manage your session securely</p>

            <Button variant="danger" isLoading={isLoggingOut} onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

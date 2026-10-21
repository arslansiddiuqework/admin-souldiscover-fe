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
    <div className="page-shell mx-auto max-w-2xl">
      <PageHeader
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

      {/* Profile Card */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2.5">
            <div className="stat-icon !h-9 !w-9 !rounded-xl">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-on-surface">Identity</h2>
              <p className="text-[11px] text-on-surface-muted">Avatar, name, and role</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          {/* Identity Section */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div
                onClick={handleAvatarClick}
                className="group relative flex h-16 w-16 cursor-pointer select-none items-center justify-center overflow-hidden rounded-full border border-border bg-[#FFF0F6] text-lg font-semibold text-primary shadow-md transition-all hover:border-primary/50"
                title="Click to change profile picture"
              >
                {adminUser?.profileImage ? (
                  <AvatarImage
                    src={adminUser.profileImage}
                    alt={adminUser.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <UserIcon className="h-7 w-7 text-on-surface-variant/70" />
                )}
                {isAvatarBusy ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-scrim">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-scrim opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Camera className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              {adminUser?.profileImage ? (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={isAvatarBusy || isUpdatingProfile}
                  className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full border border-surface bg-error text-error-foreground transition-colors hover:bg-error/90 disabled:pointer-events-none disabled:opacity-60"
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

            <div className="flex-1">
              {isEditing ? (
                <div className="flex max-w-sm items-center gap-2">
                  <div className="field-shell flex-1">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="field-input px-3 py-1.5 text-xs"
                      disabled={isUpdatingProfile}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={isUpdatingProfile}
                    className="cursor-pointer rounded-xl bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20"
                    title="Save changes"
                  >
                    <Check className="h-3.5 w-3.5" />
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
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-on-surface">
                    {adminUser?.name || "Admin User"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer rounded p-1 text-on-surface-variant transition-colors hover:bg-[#FFF0F6] hover:text-on-surface"
                    title="Edit name"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}
              <p className="mt-0.5 text-[11px] text-on-surface-muted">
                {adminUser?.role || "Administrator"}
              </p>
            </div>
          </div>

          {/* Account Info */}
          <div className="grid grid-cols-1 gap-3 border-t border-border pt-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-[#FFF8FB]/80 p-4">
              <p className="label-eyebrow">Email</p>
              <p className="mt-1 text-xs font-medium text-on-surface">
                {adminUser?.email || "Not available"}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-[#FFF8FB]/80 p-4">
              <p className="label-eyebrow">Role</p>
              <p className="mt-1 text-xs font-medium text-on-surface">
                {adminUser?.role || "Administrator"}
              </p>
            </div>
          </div>

          {/* Session Info */}
          <div className="space-y-3 rounded-2xl border border-border bg-[#FFF8FB]/80 p-4">
            <p className="label-eyebrow">Session Information</p>

            <div className="flex justify-between text-[11px]">
              <span className="text-on-surface-variant">Status</span>
              <span className="badge badge-success text-[10px]">Active</span>
            </div>

            <div className="flex justify-between text-[11px]">
              <span className="text-on-surface-variant">Last Login</span>
              <span className="font-mono text-on-surface">
                {adminUser?.lastLogin || "Unknown"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-border pt-5">
            <p className="text-[10px] text-on-surface-muted">Manage your session securely</p>

            <Button variant="danger" isLoading={isLoggingOut} onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

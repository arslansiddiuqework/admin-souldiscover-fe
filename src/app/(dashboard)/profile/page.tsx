"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers";
import { authService } from "@/services/authService";
import { Edit2, Check, X, Camera, Trash2, User as UserIcon } from "lucide-react";
import { AvatarImage } from "@/components/ui/avatar-image";

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
    <div className="max-w-2xl mx-auto text-on-surface font-inter space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-on-surface">
          Account Profile
        </h1>
        <p className="text-xs text-on-surface-variant/80 mt-1">
          Manage your admin account information and session access.
        </p>
      </div>

      {/* Profile Card */}
      <div className="card p-6 space-y-6">

        {/* Identity Section */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div 
              onClick={handleAvatarClick}
              className="relative w-16 h-16 rounded-full bg-surface-dim border border-border flex items-center justify-center text-primary font-semibold text-lg cursor-pointer overflow-hidden group hover:border-primary/50 transition-all shadow-md select-none"
              title="Click to change profile picture"
            >
              {adminUser?.profileImage ? (
                <AvatarImage
                  src={adminUser.profileImage}
                  alt={adminUser.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <UserIcon className="w-7 h-7 text-on-surface-variant/70" />
              )}
              {isAvatarBusy ? (
                <div className="absolute inset-0 bg-scrim flex items-center justify-center">
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                </div>
              ) : (
                <div className="absolute inset-0 bg-scrim opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                  <Camera className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
            {adminUser?.profileImage ? (
              <button
                type="button"
                onClick={handleDeleteAvatar}
                disabled={isAvatarBusy || isUpdatingProfile}
                className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-error text-on-error border border-surface flex items-center justify-center hover:bg-error/90 transition-colors disabled:opacity-60 disabled:pointer-events-none"
                title="Delete profile picture"
                aria-label="Delete profile picture"
              >
                {isDeletingAvatar ? (
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
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
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="bg-surface-dim border border-primary/30 rounded-lg px-3 py-1.5 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none w-full"
                  disabled={isUpdatingProfile}
                />
                <button
                  onClick={handleSaveName}
                  disabled={isUpdatingProfile}
                  className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors cursor-pointer"
                  title="Save changes"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setNameInput(adminUser?.name || "");
                    setIsEditing(false);
                  }}
                  disabled={isUpdatingProfile}
                  className="p-2 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-colors cursor-pointer"
                  title="Cancel editing"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-on-surface">
                  {adminUser?.name || "Admin User"}
                </h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-surface-container-high rounded text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  title="Edit name"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
            <p className="text-[11px] text-on-surface-variant/70 mt-0.5">
              {adminUser?.role || "Administrator"}
            </p>
          </div>
        </div>

        {/* Account Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">

          <div className="bg-surface-dim p-4 rounded-xl border border-border">
            <p className="text-[10px] uppercase text-on-surface-variant/70">
              Email
            </p>
            <p className="text-xs font-medium mt-1 text-on-surface">
              {adminUser?.email || "Not available"}
            </p>
          </div>

          <div className="bg-surface-dim p-4 rounded-xl border border-border">
            <p className="text-[10px] uppercase text-on-surface-variant/70">
              Role
            </p>
            <p className="text-xs font-medium mt-1 text-on-surface">
              {adminUser?.role || "Administrator"}
            </p>
          </div>

        </div>

        {/* Session Info (REALISTIC ONLY) */}
        <div className="bg-surface-dim p-4 rounded-xl border border-border space-y-2">
          <p className="text-[10px] uppercase text-on-surface-variant/70">
            Session Information
          </p>

          <div className="flex justify-between text-[11px]">
            <span className="text-on-surface-variant/70">Status</span>
            <span className="text-primary font-semibold">Active</span>
          </div>

          <div className="flex justify-between text-[11px]">
            <span className="text-on-surface-variant/70">Last Login</span>
            <span className="text-on-surface font-mono">
              {adminUser?.lastLogin || "Unknown"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-border flex justify-between items-center">
          <p className="text-[10px] text-on-surface-variant/70">
            Manage your session securely
          </p>

          <Button
            variant="danger"
            isLoading={isLoggingOut}
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>

      </div>
    </div>
  );
}

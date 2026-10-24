/** Keep in sync with soul-discover-be/src/utils/adminPermissions.ts */

export type AdminPermission =
  | "users.read"
  | "users.block"
  | "users.delete"
  | "sessions.read"
  | "sessions.write"
  | "consultations.write"
  | "emergency.read"
  | "analytics.read"
  | "logs.read"
  | "settings.read"
  | "settings.update"
  | "security.audit.read";

export function hasPermission(
  admin: { role?: string; permissions?: string[] } | null | undefined,
  permission: AdminPermission | string
): boolean {
  if (!admin) return false;
  if (admin.role === "superAdmin") return true;
  return Boolean(admin.permissions?.includes(permission));
}

export function hasAnyPermission(
  admin: { role?: string; permissions?: string[] } | null | undefined,
  permissions: string[]
): boolean {
  if (!admin) return false;
  if (admin.role === "superAdmin") return true;
  return permissions.some((p) => admin.permissions?.includes(p));
}

/**
 * Permissions schema validation
 * Defines and validates user permission structures
 */

import { z } from 'zod';

/**
 * User permissions schema
 */
export const UserPermissionsSchema = z.object({
  canDownloadData: z.boolean().optional().default(true),
  // Add future permissions here
  // canExportReports: z.boolean().optional().default(false),
  // canManageTeam: z.boolean().optional().default(false),
}).strict(); // Strict mode prevents additional properties

export type UserPermissions = z.infer<typeof UserPermissionsSchema>;

/**
 * Safely parse and validate permissions JSON string
 */
export function parsePermissions(permissionsString: string | null): UserPermissions {
  if (!permissionsString) {
    return { canDownloadData: true };
  }

  try {
    const parsed = JSON.parse(permissionsString);
    return UserPermissionsSchema.parse(parsed);
  } catch (error) {
    // If validation fails, return default permissions
    console.error('Invalid permissions structure:', error);
    return { canDownloadData: true };
  }
}

/**
 * Safely stringify permissions with validation
 */
export function stringifyPermissions(permissions: Partial<UserPermissions>): string {
  const validated = UserPermissionsSchema.parse(permissions);
  return JSON.stringify(validated);
}

/**
 * Merge permissions safely
 */
export function mergePermissions(
  existing: string | null,
  updates: Partial<UserPermissions>
): string {
  const current = parsePermissions(existing);
  const merged = { ...current, ...updates };
  return stringifyPermissions(merged);
}

/**
 * Validate permission update request
 */
export const PermissionUpdateSchema = z.object({
  canDownloadData: z.boolean(),
});

export type PermissionUpdate = z.infer<typeof PermissionUpdateSchema>;
import { LucideIcon } from 'lucide-react';
import { Permission, DEFAULT_ROLE_PERMISSIONS } from './permissions';

// Database roles - matches app_role enum exactly
export const APP_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  PROVIDER: 'provider',
  PARTICIPANT: 'participant',
  CUSTOMER: 'customer',
} as const;

export type AppRole = typeof APP_ROLES[keyof typeof APP_ROLES];

// Role hierarchy (lower number = more permissions)
export const ROLE_HIERARCHY: Record<AppRole, number> = {
  admin: 1,
  moderator: 2,
  provider: 3,
  participant: 3,
  customer: 4,
};

// Role metadata interface
export interface RoleMetadata {
  label: string;
  labelSv: string;
  description: string;
  descriptionSv: string;
  icon: string; // Lucide icon name
  color: 'destructive' | 'secondary' | 'default' | 'blue' | 'green' | 'purple' | 'muted';
  dashboardPath: string;
  canAccessAdmin: boolean;
  defaultPermissions: Permission[];
  canManageRoles?: AppRole[];
}

// Complete role configuration
export const ROLE_CONFIG: Record<AppRole, RoleMetadata> = {
  admin: {
    label: 'Admin',
    labelSv: 'Administratör',
    description: 'Full system access',
    descriptionSv: 'Full systemåtkomst',
    icon: 'Shield',
    color: 'destructive',
    dashboardPath: '/admin',
    canAccessAdmin: true,
    defaultPermissions: DEFAULT_ROLE_PERMISSIONS.admin,
    canManageRoles: ['moderator', 'provider', 'participant', 'customer'],
  },
  moderator: {
    label: 'Moderator',
    labelSv: 'Moderator',
    description: 'Event support & user oversight',
    descriptionSv: 'Eventsupport & användaröversikt',
    icon: 'UserCheck',
    color: 'blue',
    dashboardPath: '/admin',
    canAccessAdmin: true,
    defaultPermissions: DEFAULT_ROLE_PERMISSIONS.moderator,
    canManageRoles: [],
  },
  provider: {
    label: 'Provider',
    labelSv: 'Tjänsteleverantör',
    description: 'Service & product management',
    descriptionSv: 'Tjänste- och produkthantering',
    icon: 'Briefcase',
    color: 'green',
    dashboardPath: '/marketplace/provider/dashboard',
    canAccessAdmin: false,
    defaultPermissions: DEFAULT_ROLE_PERMISSIONS.provider,
    canManageRoles: [],
  },
  participant: {
    label: 'Participant',
    labelSv: 'Deltagare',
    description: 'Project collaboration',
    descriptionSv: 'Projektsamarbete',
    icon: 'Users',
    color: 'purple',
    dashboardPath: '/marketplace/participant/dashboard',
    canAccessAdmin: false,
    defaultPermissions: DEFAULT_ROLE_PERMISSIONS.participant,
    canManageRoles: [],
  },
  customer: {
    label: 'Customer',
    labelSv: 'Kund',
    description: 'Marketplace access',
    descriptionSv: 'Marknadsplatsåtkomst',
    icon: 'User',
    color: 'muted',
    dashboardPath: '/marketplace/customer/dashboard',
    canAccessAdmin: false,
    defaultPermissions: DEFAULT_ROLE_PERMISSIONS.customer,
    canManageRoles: [],
  },
};

// Helper functions
export const isValidRole = (value: string): value is AppRole =>
  Object.values(APP_ROLES).includes(value as AppRole);

export const getRoleHierarchy = (role: AppRole): number =>
  ROLE_HIERARCHY[role];

export const canManageRole = (managerRole: AppRole, targetRole: AppRole): boolean => {
  const config = ROLE_CONFIG[managerRole];
  return config.canManageRoles?.includes(targetRole) || false;
};

export const getMarketplaceAdminRoles = (): AppRole[] =>
  Object.entries(ROLE_CONFIG)
    .filter(([_, config]) => !config.canAccessAdmin && config.defaultPermissions.length > 0)
    .map(([role]) => role as AppRole);

export const getAdminRoles = (): AppRole[] =>
  Object.entries(ROLE_CONFIG)
    .filter(([_, config]) => config.canAccessAdmin)
    .map(([role]) => role as AppRole);

export const getAllRoles = (): AppRole[] =>
  Object.keys(ROLE_CONFIG) as AppRole[];

export const getRoleLabel = (role: AppRole, locale: 'en' | 'sv' = 'en'): string =>
  locale === 'sv' ? ROLE_CONFIG[role].labelSv : ROLE_CONFIG[role].label;

export const getRoleDescription = (role: AppRole, locale: 'en' | 'sv' = 'en'): string =>
  locale === 'sv' ? ROLE_CONFIG[role].descriptionSv : ROLE_CONFIG[role].description;

export const getRoleIcon = (role: AppRole): string =>
  ROLE_CONFIG[role].icon;

export const getRoleColor = (role: AppRole): RoleMetadata['color'] =>
  ROLE_CONFIG[role].color;

export const getRoleDashboardPath = (role: AppRole): string =>
  ROLE_CONFIG[role].dashboardPath;

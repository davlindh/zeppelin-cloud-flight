import { AppRole } from './roles';

// Permission categories for organization
export const PERMISSION_CATEGORIES = {
  USERS: 'users',
  EVENTS: 'events',
  CONTENT: 'content',
  COMMERCE: 'commerce',
  ANALYTICS: 'analytics',
  SYSTEM: 'system',
} as const;

export type PermissionCategory = typeof PERMISSION_CATEGORIES[keyof typeof PERMISSION_CATEGORIES];

// All granular permissions in the system
export const PERMISSIONS = {
  // User Management
  VIEW_USERS: 'users.view',
  MANAGE_USERS: 'users.manage',
  VIEW_USER_ACTIVITY: 'users.view_activity',
  
  // Event Support (key for moderators)
  VIEW_EVENTS: 'events.view',
  MANAGE_EVENTS: 'events.manage',
  VIEW_REGISTRATIONS: 'events.view_registrations',
  MANAGE_REGISTRATIONS: 'events.manage_registrations',
  CHECK_IN_ATTENDEES: 'events.check_in',
  
  // Workspaces/Collaboration (key for moderators)
  VIEW_PROJECTS: 'projects.view',
  MANAGE_PROJECTS: 'projects.manage',
  VIEW_PROJECT_ACTIVITY: 'projects.view_activity',
  
  // Content (submissions, media, participants)
  VIEW_SUBMISSIONS: 'content.view_submissions',
  MANAGE_SUBMISSIONS: 'content.manage_submissions',
  VIEW_MEDIA: 'content.view_media',
  MANAGE_MEDIA: 'content.manage_media',
  VIEW_PARTICIPANTS: 'content.view_participants',
  MANAGE_PARTICIPANTS: 'content.manage_participants',
  
  // Commerce
  VIEW_PRODUCTS: 'commerce.view_products',
  MANAGE_PRODUCTS: 'commerce.manage_products',
  VIEW_ORDERS: 'commerce.view_orders',
  MANAGE_ORDERS: 'commerce.manage_orders',
  VIEW_AUCTIONS: 'commerce.view_auctions',
  MANAGE_AUCTIONS: 'commerce.manage_auctions',
  
  // Analytics & Activity
  VIEW_ANALYTICS: 'analytics.view',
  VIEW_ACTIVITY_FEED: 'analytics.view_activity',
  
  // System (admin only)
  MANAGE_ROLES: 'system.manage_roles',
  MANAGE_PERMISSIONS: 'system.manage_permissions',
  VIEW_SECURITY: 'system.view_security',
  MANAGE_SETTINGS: 'system.manage_settings',
  
  // Storage Management
  UPLOAD_MEDIA_FILES: 'storage.upload_media',
  UPLOAD_DOCUMENTS: 'storage.upload_documents',
  UPLOAD_PARTICIPANT_IMAGES: 'storage.upload_participants',
  UPLOAD_PROJECT_IMAGES: 'storage.upload_projects',
  UPLOAD_SPONSOR_LOGOS: 'storage.upload_sponsors',
  UPLOAD_UI_ASSETS: 'storage.upload_ui',
  MANAGE_STORAGE: 'storage.manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Default permissions per role
export const DEFAULT_ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  admin: Object.values(PERMISSIONS), // All permissions
  
  moderator: [
    // Event support focus
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_USER_ACTIVITY,
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.VIEW_REGISTRATIONS,
    PERMISSIONS.MANAGE_REGISTRATIONS,
    PERMISSIONS.CHECK_IN_ATTENDEES,
    // Workspace oversight
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_PROJECT_ACTIVITY,
    // Content moderation
    PERMISSIONS.VIEW_SUBMISSIONS,
    PERMISSIONS.VIEW_MEDIA,
    PERMISSIONS.VIEW_PARTICIPANTS,
    // Activity visibility
    PERMISSIONS.VIEW_ACTIVITY_FEED,
    // Storage access for event/media management
    PERMISSIONS.UPLOAD_MEDIA_FILES,
  ],
  
  provider: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VIEW_AUCTIONS,
    PERMISSIONS.MANAGE_AUCTIONS,
    // Storage for products
    PERMISSIONS.UPLOAD_MEDIA_FILES,
  ],
  
  participant: [
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_PROJECT_ACTIVITY,
    PERMISSIONS.VIEW_EVENTS,
    // Storage for project collaboration
    PERMISSIONS.UPLOAD_MEDIA_FILES,
    PERMISSIONS.UPLOAD_PARTICIPANT_IMAGES,
  ],
  
  customer: [], // Marketplace access only, no admin
};

// Map sidebar paths to required permissions
export const SIDEBAR_PERMISSION_MAP: Record<string, Permission> = {
  // Zeppel Admin Section
  '/admin/submissions': PERMISSIONS.VIEW_SUBMISSIONS,
  '/admin/participants-management': PERMISSIONS.VIEW_PARTICIPANTS,
  '/admin/projects-management': PERMISSIONS.VIEW_PROJECTS,
  '/admin/sponsors-management': PERMISSIONS.MANAGE_PARTICIPANTS,
  '/admin/media': PERMISSIONS.VIEW_MEDIA,
  '/admin/donations': PERMISSIONS.MANAGE_SETTINGS,
  
  // Marketplace Admin Section
  '/admin': PERMISSIONS.VIEW_ANALYTICS,
  '/admin/products': PERMISSIONS.VIEW_PRODUCTS,
  '/admin/auctions': PERMISSIONS.VIEW_AUCTIONS,
  '/admin/services': PERMISSIONS.VIEW_PRODUCTS,
  '/admin/messages': PERMISSIONS.VIEW_USER_ACTIVITY,
  '/admin/bookings': PERMISSIONS.VIEW_ORDERS,
  '/admin/orders': PERMISSIONS.VIEW_ORDERS,
  '/admin/users': PERMISSIONS.VIEW_USERS,
  '/admin/applications': PERMISSIONS.VIEW_USERS,
  '/admin/providers': PERMISSIONS.VIEW_USERS,
  '/admin/categories': PERMISSIONS.MANAGE_PRODUCTS,
  '/admin/brands': PERMISSIONS.MANAGE_PRODUCTS,
  '/admin/data-cleanup': PERMISSIONS.MANAGE_SETTINGS,
  '/admin/security': PERMISSIONS.VIEW_SECURITY,
  
  // Commerce Admin Section
  '/admin/commerce/overview': PERMISSIONS.VIEW_ANALYTICS,
  '/admin/settings/commissions': PERMISSIONS.MANAGE_SETTINGS,
  '/admin/commerce/sellers': PERMISSIONS.MANAGE_PRODUCTS,
  '/admin/commerce/events': PERMISSIONS.VIEW_ANALYTICS,
  
  // Events Management Section
  '/admin/events': PERMISSIONS.VIEW_EVENTS,
  '/admin/events/tickets': PERMISSIONS.VIEW_EVENTS,
  '/admin/events/registrations': PERMISSIONS.VIEW_REGISTRATIONS,
  
  // Campaigns Section
  '/admin/campaigns': PERMISSIONS.MANAGE_SETTINGS,
  '/admin/campaigns/linkage': PERMISSIONS.MANAGE_SETTINGS,

  // System Settings Section
  '/admin/settings/permissions': PERMISSIONS.MANAGE_PERMISSIONS,
};

// Map dashboard components to required permissions
export const DASHBOARD_PERMISSION_MAP: Record<string, Permission> = {
  'SecurityMetricsCard': PERMISSIONS.VIEW_SECURITY,
  'LiveActivityFeed': PERMISSIONS.VIEW_ACTIVITY_FEED,
  'AlertsCenter': PERMISSIONS.VIEW_SECURITY,
  'AdminDataHub': PERMISSIONS.MANAGE_SETTINGS,
  'ZeppelStatsSection': PERMISSIONS.VIEW_PARTICIPANTS,
  'MarketplaceStatsSection': PERMISSIONS.VIEW_PRODUCTS,
  'ServicesStatsSection': PERMISSIONS.VIEW_PRODUCTS,
  'FundingStatsSection': PERMISSIONS.MANAGE_SETTINGS,
  'EventsStatsSection': PERMISSIONS.VIEW_EVENTS,
  'AdminPerformanceCard': PERMISSIONS.VIEW_ANALYTICS,
  'SystemHealthMonitor': PERMISSIONS.VIEW_SECURITY,
  'AdminAnalyticsSection': PERMISSIONS.VIEW_ANALYTICS,
  'RecentChangesTimeline': PERMISSIONS.VIEW_ACTIVITY_FEED,
};

// Permission metadata for UI
export interface PermissionMetadata {
  key: Permission;
  label: string;
  description: string;
  category: PermissionCategory;
  uiComponents: string[];
}

export const PERMISSION_METADATA: Record<Permission, Omit<PermissionMetadata, 'key'>> = {
  'users.view': {
    label: 'View Users',
    description: 'Can view user list and profiles',
    category: PERMISSION_CATEGORIES.USERS,
    uiComponents: ['Users page', 'User management'],
  },
  'users.manage': {
    label: 'Manage Users',
    description: 'Can edit, delete, and manage user accounts',
    category: PERMISSION_CATEGORIES.USERS,
    uiComponents: ['User editing', 'Role assignment'],
  },
  'users.view_activity': {
    label: 'View User Activity',
    description: 'Can see user activity logs and interactions',
    category: PERMISSION_CATEGORIES.USERS,
    uiComponents: ['Activity feed', 'User actions'],
  },
  'events.view': {
    label: 'View Events',
    description: 'Can view event list and details',
    category: PERMISSION_CATEGORIES.EVENTS,
    uiComponents: ['Events page', 'Event calendar'],
  },
  'events.manage': {
    label: 'Manage Events',
    description: 'Can create, edit, and delete events',
    category: PERMISSION_CATEGORIES.EVENTS,
    uiComponents: ['Event creation', 'Event editing'],
  },
  'events.view_registrations': {
    label: 'View Registrations',
    description: 'Can view event registrations and attendees',
    category: PERMISSION_CATEGORIES.EVENTS,
    uiComponents: ['Registrations page', 'Attendee list'],
  },
  'events.manage_registrations': {
    label: 'Manage Registrations',
    description: 'Can approve, reject, and manage registrations',
    category: PERMISSION_CATEGORIES.EVENTS,
    uiComponents: ['Registration approval', 'Attendee management'],
  },
  'events.check_in': {
    label: 'Check In Attendees',
    description: 'Can check in attendees at events',
    category: PERMISSION_CATEGORIES.EVENTS,
    uiComponents: ['Check-in interface', 'QR scanner'],
  },
  'projects.view': {
    label: 'View Projects',
    description: 'Can view collaboration projects',
    category: PERMISSION_CATEGORIES.CONTENT,
    uiComponents: ['Projects page', 'Project list'],
  },
  'projects.manage': {
    label: 'Manage Projects',
    description: 'Can create, edit, and delete projects',
    category: PERMISSION_CATEGORIES.CONTENT,
    uiComponents: ['Project creation', 'Project editing'],
  },
  'projects.view_activity': {
    label: 'View Project Activity',
    description: 'Can see project updates and member activity',
    category: PERMISSION_CATEGORIES.CONTENT,
    uiComponents: ['Project activity feed', 'Member actions'],
  },
  'content.view_submissions': {
    label: 'View Submissions',
    description: 'Can view content submissions',
    category: PERMISSION_CATEGORIES.CONTENT,
    uiComponents: ['Submissions page', 'Submission inbox'],
  },
  'content.manage_submissions': {
    label: 'Manage Submissions',
    description: 'Can approve, reject, and process submissions',
    category: PERMISSION_CATEGORIES.CONTENT,
    uiComponents: ['Submission approval', 'Submission processing'],
  },
  'content.view_media': {
    label: 'View Media',
    description: 'Can view media library',
    category: PERMISSION_CATEGORIES.CONTENT,
    uiComponents: ['Media library', 'Media gallery'],
  },
  'content.manage_media': {
    label: 'Manage Media',
    description: 'Can upload, edit, and delete media',
    category: PERMISSION_CATEGORIES.CONTENT,
    uiComponents: ['Media upload', 'Media editing'],
  },
  'content.view_participants': {
    label: 'View Participants',
    description: 'Can view participant profiles',
    category: PERMISSION_CATEGORIES.CONTENT,
    uiComponents: ['Participants page', 'Participant list'],
  },
  'content.manage_participants': {
    label: 'Manage Participants',
    description: 'Can edit and manage participant data',
    category: PERMISSION_CATEGORIES.CONTENT,
    uiComponents: ['Participant editing', 'Participant management'],
  },
  'commerce.view_products': {
    label: 'View Products',
    description: 'Can view product catalog',
    category: PERMISSION_CATEGORIES.COMMERCE,
    uiComponents: ['Products page', 'Product list'],
  },
  'commerce.manage_products': {
    label: 'Manage Products',
    description: 'Can create, edit, and delete products',
    category: PERMISSION_CATEGORIES.COMMERCE,
    uiComponents: ['Product creation', 'Product editing'],
  },
  'commerce.view_orders': {
    label: 'View Orders',
    description: 'Can view orders and bookings',
    category: PERMISSION_CATEGORIES.COMMERCE,
    uiComponents: ['Orders page', 'Bookings page'],
  },
  'commerce.manage_orders': {
    label: 'Manage Orders',
    description: 'Can process and manage orders',
    category: PERMISSION_CATEGORIES.COMMERCE,
    uiComponents: ['Order processing', 'Order management'],
  },
  'commerce.view_auctions': {
    label: 'View Auctions',
    description: 'Can view auction listings',
    category: PERMISSION_CATEGORIES.COMMERCE,
    uiComponents: ['Auctions page', 'Auction list'],
  },
  'commerce.manage_auctions': {
    label: 'Manage Auctions',
    description: 'Can create and manage auctions',
    category: PERMISSION_CATEGORIES.COMMERCE,
    uiComponents: ['Auction creation', 'Auction management'],
  },
  'analytics.view': {
    label: 'View Analytics',
    description: 'Can view dashboard analytics and metrics',
    category: PERMISSION_CATEGORIES.ANALYTICS,
    uiComponents: ['Dashboard', 'Analytics section'],
  },
  'analytics.view_activity': {
    label: 'View Activity Feed',
    description: 'Can view live activity and logs',
    category: PERMISSION_CATEGORIES.ANALYTICS,
    uiComponents: ['Activity feed', 'Timeline'],
  },
  'system.manage_roles': {
    label: 'Manage Roles',
    description: 'Can assign and modify user roles',
    category: PERMISSION_CATEGORIES.SYSTEM,
    uiComponents: ['Role management', 'User roles'],
  },
  'system.manage_permissions': {
    label: 'Manage Permissions',
    description: 'Can configure role permissions',
    category: PERMISSION_CATEGORIES.SYSTEM,
    uiComponents: ['Permission configuration', 'Role settings'],
  },
  'system.view_security': {
    label: 'View Security',
    description: 'Can view security metrics and alerts',
    category: PERMISSION_CATEGORIES.SYSTEM,
    uiComponents: ['Security dashboard', 'Security metrics'],
  },
  'system.manage_settings': {
    label: 'Manage Settings',
    description: 'Can configure system settings',
    category: PERMISSION_CATEGORIES.SYSTEM,
    uiComponents: ['Settings pages', 'Configuration'],
  },
  
  // Storage permissions
  'storage.upload_media': {
    label: 'Upload Media Files',
    description: 'Can upload to media-files bucket',
    category: PERMISSION_CATEGORIES.SYSTEM,
    uiComponents: ['Media upload', 'File uploads'],
  },
  'storage.upload_documents': {
    label: 'Upload Documents',
    description: 'Can upload to documents bucket',
    category: PERMISSION_CATEGORIES.SYSTEM,
    uiComponents: ['Document upload'],
  },
  'storage.upload_participants': {
    label: 'Upload Participant Images',
    description: 'Can upload participant avatars',
    category: PERMISSION_CATEGORIES.SYSTEM,
    uiComponents: ['Participant images'],
  },
  'storage.upload_projects': {
    label: 'Upload Project Images',
    description: 'Can upload project images',
    category: PERMISSION_CATEGORIES.SYSTEM,
    uiComponents: ['Project images'],
  },
  'storage.upload_sponsors': {
    label: 'Upload Sponsor Logos',
    description: 'Can upload sponsor logos',
    category: PERMISSION_CATEGORIES.SYSTEM,
    uiComponents: ['Sponsor logos'],
  },
  'storage.upload_ui': {
    label: 'Upload UI Assets',
    description: 'Can upload UI assets',
    category: PERMISSION_CATEGORIES.SYSTEM,
    uiComponents: ['UI assets'],
  },
  'storage.manage': {
    label: 'Manage All Storage',
    description: 'Full storage management access',
    category: PERMISSION_CATEGORIES.SYSTEM,
    uiComponents: ['Storage management', 'All buckets'],
  },
};

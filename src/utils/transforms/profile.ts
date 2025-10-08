// Profile-specific data transforms
import type { UserProfile, UserStats } from '@/hooks/useUserProfile';

// Calculate profile completion percentage
export const calculateProfileCompletion = (profile: UserProfile | null): number => {
  if (!profile) return 0;

  const fields = [
    profile.full_name,
    profile.avatar_url,
    profile.bio,
    profile.location,
    profile.phone,
    profile.address
  ];

  const completedFields = fields.filter(field => field && field.trim() !== '').length;
  return Math.round((completedFields / fields.length) * 100);
};

// Generate user initials for avatar fallback
export const getUserInitials = (profile: UserProfile | null, email?: string | null): string => {
  if (profile?.full_name) {
    const names = profile.full_name.split(' ');
    return names
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  
  if (email) {
    return email[0]?.toUpperCase() || 'U';
  }

  return 'U';
};

// Format user display name
export const getUserDisplayName = (profile: UserProfile | null, email?: string | null): string => {
  if (profile?.full_name) return profile.full_name;
  if (email) return email.split('@')[0] || 'User';
  return 'User';
};

// Get user role display
export const getUserRoleDisplay = (role?: string): string => {
  switch (role?.toLowerCase()) {
    case 'admin': return 'Administrator';
    case 'moderator': return 'Moderator';
    case 'customer': return 'Customer';
    case 'provider': return 'Service Provider';
    default: return 'Customer';
  }
};

// Format stats for display
export const formatUserStats = (stats: UserStats | null) => {
  if (!stats) return null;

  return {
    ...stats,
    totalSpentFormatted: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(stats.totalSpent),
    averageRatingFormatted: stats.averageRating.toFixed(1),
    daysActiveDisplay: stats.daysActive === 1 ? '1 day' : `${stats.daysActive} days`
  };
};
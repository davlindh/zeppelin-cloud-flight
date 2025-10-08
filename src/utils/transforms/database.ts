// Database-specific transforms
import type { UserProfile } from '@/hooks/useUserProfile';
import type { CustomerInfo } from '@/hooks/useCustomerInfo';

// Transform user profile for database storage
export const transformProfileForDatabase = (profile: Partial<UserProfile>) => {
  return {
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    username: profile.username,
    phone: profile.phone,
    location: profile.location,
    bio: profile.bio,
    address: profile.address,
    company_name: profile.company_name,
    vat_number: profile.vat_number,
    customer_type: profile.customer_type,
    preferred_contact_method: profile.preferred_contact_method,
    preferred_payment_method: profile.preferred_payment_method,
    updated_at: new Date().toISOString()
  };
};

// Transform customer info to user profile fields
export const transformCustomerInfoToProfile = (customerInfo: CustomerInfo): Partial<UserProfile> => {
  return {
    full_name: customerInfo.name,
    phone: customerInfo.phone,
    address: customerInfo.address,
    preferred_contact_method: 'Email' // Default based on email requirement
  };
};

// Transform database notification preferences to app format
export const transformDatabaseNotificationPrefs = (dbPrefs: any) => {
  return {
    emailNotifications: dbPrefs.email_notifications ?? true,
    pushNotifications: dbPrefs.push_notifications ?? false,
    priceDropAlerts: dbPrefs.price_drop_alerts ?? true,
    stockAlerts: true, // Not in DB schema, use default
    backInStockAlerts: true, // Not in DB schema, use default
    auctionEndingAlerts: dbPrefs.auction_ending_soon ?? true,
    outbidAlerts: dbPrefs.outbid_notifications ?? true,
    newItemsInCategories: dbPrefs.new_items_in_categories ?? false,
    dailyDigest: false, // Not in DB schema, use default
    weeklyRecommendations: true, // Not in DB schema, use default
    quietHours: {
      enabled: false, // Not in DB schema, use default
      start: '22:00',
      end: '08:00'
    },
    frequency: {
      immediate: true, // Not in DB schema, use default
      hourly: false,
      daily: false
    }
  };
};

// Transform app notification preferences to database format
export const transformNotificationPrefsToDatabase = (prefs: any) => {
  return {
    email_notifications: prefs.emailNotifications,
    push_notifications: prefs.pushNotifications,
    price_drop_alerts: prefs.priceDropAlerts,
    auction_ending_soon: prefs.auctionEndingAlerts,
    outbid_notifications: prefs.outbidAlerts,
    new_items_in_categories: prefs.newItemsInCategories,
    updated_at: new Date().toISOString()
  };
};
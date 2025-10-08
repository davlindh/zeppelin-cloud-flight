// Notification-related transforms
export interface NotificationTemplate {
  type: string;
  title: string;
  message: string;
  category: 'auction' | 'product' | 'service' | 'system';
  priority: 'low' | 'medium' | 'high';
}

// Generate notification messages
export const generateBidNotification = (auctionTitle: string, newBid: number): NotificationTemplate => ({
  type: 'outbid',
  title: 'You have been outbid',
  message: `Someone placed a higher bid of $${newBid.toFixed(2)} on "${auctionTitle}"`,
  category: 'auction',
  priority: 'medium'
});

export const generateAuctionEndingNotification = (auctionTitle: string, timeLeft: string): NotificationTemplate => ({
  type: 'auction_ending',
  title: 'Auction ending soon',
  message: `"${auctionTitle}" ends in ${timeLeft}`,
  category: 'auction',
  priority: 'high'
});

export const generatePriceDropNotification = (productTitle: string, oldPrice: number, newPrice: number): NotificationTemplate => ({
  type: 'price_drop',
  title: 'Price drop alert',
  message: `"${productTitle}" dropped from $${oldPrice.toFixed(2)} to $${newPrice.toFixed(2)}`,
  category: 'product',
  priority: 'medium'
});

export const generateBookingConfirmation = (serviceName: string, date: string, time: string): NotificationTemplate => ({
  type: 'booking_confirmed',
  title: 'Booking confirmed',
  message: `Your booking for "${serviceName}" on ${date} at ${time} has been confirmed`,
  category: 'service',
  priority: 'high'
});

// Format time remaining for notifications
export const formatTimeRemaining = (endTime: Date): string => {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();
  
  if (diff <= 0) return 'Ended';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

// Check if notification should be sent based on preferences
export const shouldSendNotification = (
  type: string,
  preferences: any,
  isQuietTime: boolean = false
): boolean => {
  if (isQuietTime) return false;

  switch (type) {
    case 'outbid':
      return preferences.outbidAlerts && preferences.emailNotifications;
    case 'auction_ending':
      return preferences.auctionEndingAlerts && preferences.emailNotifications;
    case 'price_drop':
      return preferences.priceDropAlerts && preferences.emailNotifications;
    case 'new_items':
      return preferences.newItemsInCategories && preferences.emailNotifications;
    default:
      return preferences.emailNotifications;
  }
};

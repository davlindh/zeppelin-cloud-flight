
// Branded types for type safety and preventing ID mixing

// Base branded type utility
type Brand<T, K> = T & { readonly __brand: K };

// Entity ID branded types
export type ServiceId = Brand<string, 'ServiceId'>;
export type AuctionId = Brand<string, 'AuctionId'>;
export type ProductId = Brand<string, 'ProductId'>;
export type ProviderId = Brand<string, 'ProviderId'>;
export type UserId = Brand<string, 'UserId'>;

// Value object branded types
export type Email = Brand<string, 'Email'>;
export type PhoneNumber = Brand<string, 'PhoneNumber'>;
export type DateTime = Brand<string, 'DateTime'>;
export type Duration = Brand<string, 'Duration'>;
export type Currency = Brand<number, 'Currency'>;
export type Rating = Brand<number, 'Rating'>;

// Utility types for creating branded values
export const createServiceId = (id: string): ServiceId => id as ServiceId;
export const createAuctionId = (id: string): AuctionId => id as AuctionId;
export const createProductId = (id: string): ProductId => id as ProductId;
export const createProviderId = (id: string): ProviderId => id as ProviderId;
export const createUserId = (id: string): UserId => id as UserId;

export const createEmail = (email: string): Email => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(`Invalid email format: ${email}`);
  }
  return email as Email;
};

export const createPhoneNumber = (phone: string): PhoneNumber => {
  if (!/^\+?[\d\s-()]+$/.test(phone)) {
    throw new Error(`Invalid phone number format: ${phone}`);
  }
  return phone as PhoneNumber;
};

export const createDateTime = (dateTime: string): DateTime => {
  if (isNaN(Date.parse(dateTime))) {
    throw new Error(`Invalid date time format: ${dateTime}`);
  }
  return dateTime as DateTime;
};

export const createCurrency = (amount: number): Currency => {
  if (amount < 0 || !isFinite(amount)) {
    throw new Error(`Invalid currency amount: ${amount}`);
  }
  return amount as Currency;
};

export const createRating = (rating: number): Rating => {
  if (rating < 0 || rating > 5 || !isFinite(rating)) {
    throw new Error(`Invalid rating: ${rating}. Must be between 0 and 5`);
  }
  return rating as Rating;
};

// Type predicates for runtime checking
export const isServiceId = (value: unknown): value is ServiceId => 
  typeof value === 'string' && value.length > 0;

export const isEmail = (value: unknown): value is Email => 
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isPhoneNumber = (value: unknown): value is PhoneNumber => 
  typeof value === 'string' && /^\+?[\d\s-()]+$/.test(value);

export const isDateTime = (value: unknown): value is DateTime => 
  typeof value === 'string' && !isNaN(Date.parse(value));

export const isCurrency = (value: unknown): value is Currency => 
  typeof value === 'number' && value >= 0 && isFinite(value);

export const isRating = (value: unknown): value is Rating => 
  typeof value === 'number' && value >= 0 && value <= 5 && isFinite(value);

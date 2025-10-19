/**
 * Currency formatting utilities for consistent Swedish SEK display
 */

/**
 * Format a number as Swedish currency (SEK)
 * @param amount - The amount to format
 * @param options - Optional Intl.NumberFormat options
 * @returns Formatted currency string with "kr" suffix
 */
export const formatCurrency = (
  amount: number | null | undefined,
  options?: Intl.NumberFormatOptions
): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 kr';
  }

  const formatted = new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);

  return `${formatted} kr`;
};

/**
 * Format a price range
 * @param min - Minimum price
 * @param max - Maximum price
 * @returns Formatted price range string
 */
export const formatPriceRange = (min: number, max: number): string => {
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
};

/**
 * Calculate and format discount percentage
 * @param originalPrice - Original price before discount
 * @param salePrice - Sale price after discount
 * @returns Formatted discount percentage (e.g., "25%")
 */
export const formatDiscountPercentage = (
  originalPrice: number,
  salePrice: number
): string => {
  if (originalPrice <= salePrice) return '0%';
  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  return `${discount}%`;
};

/**
 * Calculate discount amount
 * @param originalPrice - Original price before discount
 * @param salePrice - Sale price after discount
 * @returns Discount amount
 */
export const calculateDiscount = (
  originalPrice: number,
  salePrice: number
): number => {
  return Math.max(0, originalPrice - salePrice);
};

/**
 * Format discount amount as currency
 * @param originalPrice - Original price before discount
 * @param salePrice - Sale price after discount
 * @returns Formatted discount amount
 */
export const formatDiscountAmount = (
  originalPrice: number,
  salePrice: number
): string => {
  const discount = calculateDiscount(originalPrice, salePrice);
  return formatCurrency(discount);
};

/**
 * Parse a currency string to number
 * @param currencyString - String like "1 234 kr" or "1234 kr"
 * @returns Parsed number value
 */
export const parseCurrency = (currencyString: string): number => {
  // Remove spaces, "kr" suffix, and parse
  const cleaned = currencyString.replace(/\s/g, '').replace(/kr/gi, '').replace(/,/g, '.');
  return parseFloat(cleaned) || 0;
};

/**
 * Currency constants
 */
export const CURRENCY = {
  CODE: 'SEK',
  SYMBOL: 'kr',
  LOCALE: 'sv-SE',
} as const;

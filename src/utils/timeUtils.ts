/**
 * Time utilities for handling both real and mock time
 * This allows for testing time-dependent features with a fixed date
 */

const IS_DEV_MODE = import.meta.env.DEV;
const MOCK_CURRENT_DATE = new Date('2025-11-14T10:00:00Z');

/**
 * Get current time, respecting mock time settings in development
 * @returns Current timestamp in milliseconds
 */
export const getCurrentTime = (): number => {
  if (IS_DEV_MODE && import.meta.env.VITE_USE_MOCK_TIME === 'true') {
    return MOCK_CURRENT_DATE.getTime();
  }
  return Date.now();
};

/**
 * Get current date object, respecting mock time settings in development
 * @returns Current Date object
 */
export const getCurrentDate = (): Date => {
  return new Date(getCurrentTime());
};

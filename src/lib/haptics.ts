/**
 * Haptic feedback utility using Vibration API
 * Provides tactile feedback on supported mobile devices
 */

export type HapticIntensity = 'light' | 'medium' | 'heavy';

interface HapticPattern {
  duration: number;
  pattern?: number[];
}

const HAPTIC_PATTERNS: Record<HapticIntensity, HapticPattern> = {
  light: { duration: 10 },
  medium: { duration: 20 },
  heavy: { duration: 30, pattern: [0, 10, 10, 10] }
};

/**
 * Triggers haptic feedback if supported by the device
 * @param intensity - 'light', 'medium', or 'heavy'
 * @returns boolean - true if haptic was triggered, false if not supported
 */
export const triggerHapticFeedback = (intensity: HapticIntensity = 'light'): boolean => {
  // Check if Vibration API is supported
  if (!navigator.vibrate) {
    return false;
  }

  // Check if user prefers reduced motion (accessibility)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return false;
  }

  const pattern = HAPTIC_PATTERNS[intensity];

  try {
    if (pattern.pattern) {
      navigator.vibrate(pattern.pattern);
    } else {
      navigator.vibrate(pattern.duration);
    }
    return true;
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
    return false;
  }
};

/**
 * Cancels ongoing vibration
 */
export const cancelHapticFeedback = (): void => {
  if (navigator.vibrate) {
    navigator.vibrate(0);
  }
};

/**
 * Check if haptic feedback is supported
 */
export const isHapticSupported = (): boolean => {
  return 'vibrate' in navigator;
};

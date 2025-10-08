/**
 * @deprecated This file contains legacy functions that use static data fallbacks.
 * Please use `useParticipants` from `@/hooks/useApi` and transformation functions from `@/utils/participantMappers`
 * instead. This file is kept for backwards compatibility but should be removed in the future.
 */

import type { ShowcaseCard, Participant } from '@/types/unified';

// Legacy type alias for backwards compatibility
export type ParticipantWithMedia = Participant;

/**
 * @deprecated Use API hooks and transformation utils instead
 * This function relies on static data and is not recommended for new code
 */
export function buildParticipantsWithMedia(showcaseCards?: ShowcaseCard[]): Participant[] {
  console.warn('buildParticipantsWithMedia is deprecated. Use useParticipants hook and participant mappers instead.');
  return [];
}

/**
 * @deprecated Use API hooks and transformation utils instead
 * This function relies on static data and is not recommended for new code
 */
export function getParticipantBySlug(slug: string, showcaseCards?: ShowcaseCard[]): Participant | null {
  console.warn('getParticipantBySlug is deprecated. Use useParticipants hook and transformation utils instead.');
  return null;
}

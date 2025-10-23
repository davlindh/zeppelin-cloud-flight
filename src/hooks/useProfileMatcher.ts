import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthenticatedUser } from './useAuthenticatedUser';

interface MatchCriteria {
  email?: boolean;
  name?: boolean;
  phone?: boolean;
  location?: boolean;
  skills?: boolean;
  interests?: boolean;
}

interface ProfileMatch {
  id: string;
  type: 'participant' | 'project';
  title: string;
  confidence: number; // 0-100
  criteria: MatchCriteria;
  data: Record<string, unknown>;
  canClaim: boolean;
  isClaimed: boolean;
  claimedBy?: string;
}

interface SubmissionMatch {
  id: string;
  type: 'project' | 'participant' | 'media' | 'collaboration';
  title: string;
  confidence: number;
  criteria: MatchCriteria;
  content: Record<string, unknown>;
  contact_email?: string;
  submitted_by?: string;
  location?: string;
  created_at: string;
}

interface ProfileMatcherResult {
  matches: ProfileMatch[];
  submissionMatches: SubmissionMatch[];
  isLoading: boolean;
  hasSearched: boolean;
  searchAgain: () => void;
  clearMatches: () => void;
}

/**
 * Enhanced profile matching system that prevents loops by:
 * 1. One-time search with caching
 * 2. Confidence-based matching
 * 3. Integration with submission system
 * 4. Smart filtering to avoid duplicates
 */
export const useProfileMatcher = (): ProfileMatcherResult => {
  const { data: user } = useAuthenticatedUser();
  const [hasSearched, setHasSearched] = useState(false);
  const [searchCache, setSearchCache] = useState<{
    userId: string;
    timestamp: number;
    results: ProfileMatch[];
  } | null>(null);

  // Cache results for 5 minutes to prevent loops
  const CACHE_DURATION = 5 * 60 * 1000;

  const findMatches = useCallback(async (): Promise<{
    profileMatches: ProfileMatch[];
    submissionMatches: SubmissionMatch[];
  }> => {
    if (!user) {
      return { profileMatches: [], submissionMatches: [] };
    }

    // Check cache first
    if (searchCache &&
        searchCache.userId === user.id &&
        Date.now() - searchCache.timestamp < CACHE_DURATION) {
      return {
        profileMatches: searchCache.results,
        submissionMatches: []
      };
    }

    try {
      console.log('🔍 Starting profile matching for user:', user.email);

      // 1. Search for existing profiles (participants and projects)
      const profileMatches = await findProfileMatches(user);

      // 2. Search for unclaimed submissions that match
      const submissionMatches = await findSubmissionMatches(user);

      const results = {
        profileMatches,
        submissionMatches
      };

      // Cache results
      setSearchCache({
        userId: user.id,
        timestamp: Date.now(),
        results: profileMatches
      });

      setHasSearched(true);
      console.log('✅ Profile matching completed:', {
        profiles: profileMatches.length,
        submissions: submissionMatches.length
      });

      return results;
    } catch (error) {
      console.error('❌ Error in profile matching:', error);
      return { profileMatches: [], submissionMatches: [] };
    }
  }, [user, searchCache]);

  // Use React Query for caching and background updates
  const { data: matchResults, isLoading, refetch } = useQuery({
    queryKey: ['profile-matches', user?.id],
    queryFn: findMatches,
    enabled: !!user && !hasSearched,
    staleTime: CACHE_DURATION,
    gcTime: CACHE_DURATION,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const searchAgain = useCallback(() => {
    setHasSearched(false);
    setSearchCache(null);
    refetch();
  }, [refetch]);

  const clearMatches = useCallback(() => {
    setHasSearched(false);
    setSearchCache(null);
  }, []);

  return {
    matches: matchResults?.profileMatches || [],
    submissionMatches: matchResults?.submissionMatches || [],
    isLoading,
    hasSearched,
    searchAgain,
    clearMatches,
  };
};

/**
 * Find matches in existing profiles (participants and projects)
 */
async function findProfileMatches(user: { id: string; email: string; full_name?: string; phone?: string }): Promise<ProfileMatch[]> {
  const matches: ProfileMatch[] = [];

  try {
    // Search participants
    const { data: participants } = await supabase
      .from('participants')
      .select('*')
      .or(`contact_email.eq.${user.email},auth_user_id.eq.${user.id}`)
      .is('auth_user_id', null); // Only unclaimed profiles

    // Search projects (if they have auth_user_id field)
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .or(`contact_email.eq.${user.email},auth_user_id.eq.${user.id}`)
      .is('auth_user_id', null);

    // Process participant matches
    if (participants) {
      for (const participant of participants) {
        const confidence = calculateMatchConfidence(user, participant, 'participant');
        if (confidence >= 50) { // Minimum confidence threshold
          matches.push({
            id: participant.id,
            type: 'participant',
            title: participant.name,
            confidence,
            criteria: getMatchCriteria(user, participant, 'participant'),
            data: participant,
            canClaim: participant.auth_user_id === null,
            isClaimed: participant.auth_user_id !== null,
            claimedBy: participant.auth_user_id || undefined,
          });
        }
      }
    }

    // Process project matches
    if (projects) {
      for (const project of projects) {
        const confidence = calculateMatchConfidence(user, project, 'project');
        if (confidence >= 50) {
          matches.push({
            id: project.id,
            type: 'project',
            title: project.title,
            confidence,
            criteria: getMatchCriteria(user, project, 'project'),
            data: project,
            canClaim: (project as any).auth_user_id === null,
            isClaimed: (project as any).auth_user_id !== null,
            claimedBy: (project as any).auth_user_id || undefined,
          });
        }
      }
    }

    // Sort by confidence (highest first)
    matches.sort((a, b) => b.confidence - a.confidence);

    return matches;
  } catch (error) {
    console.error('Error finding profile matches:', error);
    return [];
  }
}

/**
 * Find matches in submission data
 */
async function findSubmissionMatches(user: { id: string; email: string; full_name?: string; phone?: string }): Promise<SubmissionMatch[]> {
  const matches: SubmissionMatch[] = [];

  try {
    // Search recent submissions (last 30 days) that match user criteria
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: submissions } = await supabase
      .from('submissions')
      .select('*')
      .eq('status', 'pending')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .or(`contact_email.eq.${user.email},submitted_by.ilike.%${user.full_name || ''}%`);

    if (submissions) {
      for (const submission of submissions) {
        const confidence = calculateSubmissionMatchConfidence(user, submission);
        if (confidence >= 60) { // Higher threshold for submissions
          matches.push({
            id: submission.id,
            type: submission.type as SubmissionMatch['type'],
            title: submission.title,
            confidence,
            criteria: getSubmissionMatchCriteria(user, submission),
            content: submission.content as Record<string, unknown>,
            contact_email: submission.contact_email || undefined,
            submitted_by: submission.submitted_by || undefined,
            location: submission.location || undefined,
            created_at: submission.created_at,
          });
        }
      }
    }

    // Sort by confidence and recency
    matches.sort((a, b) => {
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return matches;
  } catch (error) {
    console.error('Error finding submission matches:', error);
    return [];
  }
}

/**
 * Calculate match confidence for profiles
 */
function calculateMatchConfidence(
  user: { email: string; full_name?: string; phone?: string },
  profile: any,
  type: 'participant' | 'project'
): number {
  let confidence = 0;
  const criteria: MatchCriteria = {};

  // Email match (highest confidence)
  if (profile.contact_email === user.email) {
    confidence += 100;
    criteria.email = true;
  }

  // Name similarity (medium confidence)
  if (user.full_name && profile.name) {
    const similarity = calculateNameSimilarity(user.full_name, profile.name);
    if (similarity > 0.8) {
      confidence += 70;
      criteria.name = true;
    } else if (similarity > 0.6) {
      confidence += 50;
      criteria.name = true;
    }
  }

  // Phone match (medium confidence)
  if (user.phone && profile.contact_phone === user.phone) {
    confidence += 60;
    criteria.phone = true;
  }

  // Location match (lower confidence)
  if (user.phone && profile.location && profile.location.includes(user.phone)) {
    confidence += 40;
    criteria.location = true;
  }

  // Skills/interests overlap (for participants)
  if (type === 'participant' && user.full_name) {
    const userWords = user.full_name.toLowerCase().split(' ');
    const profileSkills = (profile.skills || []).join(' ').toLowerCase();
    const profileInterests = (profile.interests || []).join(' ').toLowerCase();

    const overlap = userWords.filter(word =>
      profileSkills.includes(word) || profileInterests.includes(word)
    );

    if (overlap.length > 0) {
      confidence += overlap.length * 20;
      criteria.skills = true;
    }
  }

  return Math.min(confidence, 100);
}

/**
 * Calculate match confidence for submissions
 */
function calculateSubmissionMatchConfidence(
  user: { email: string; full_name?: string; phone?: string },
  submission: any
): number {
  let confidence = 0;
  const criteria: MatchCriteria = {};

  // Email match (highest confidence)
  if (submission.contact_email === user.email) {
    confidence += 100;
    criteria.email = true;
  }

  // Name match in submitted_by
  if (user.full_name && submission.submitted_by) {
    const similarity = calculateNameSimilarity(user.full_name, submission.submitted_by);
    if (similarity > 0.8) {
      confidence += 80;
      criteria.name = true;
    } else if (similarity > 0.6) {
      confidence += 60;
      criteria.name = true;
    }
  }

  // Phone match
  if (user.phone && submission.contact_phone === user.phone) {
    confidence += 70;
    criteria.phone = true;
  }

  // Location match
  if (user.phone && submission.location && submission.location.includes(user.phone)) {
    confidence += 50;
    criteria.location = true;
  }

  return Math.min(confidence, 100);
}

/**
 * Get match criteria for profiles
 */
function getMatchCriteria(
  user: { email: string; full_name?: string; phone?: string },
  profile: any,
  type: 'participant' | 'project'
): MatchCriteria {
  const criteria: MatchCriteria = {};

  if (profile.contact_email === user.email) criteria.email = true;
  if (user.full_name && profile.name && calculateNameSimilarity(user.full_name, profile.name) > 0.6) {
    criteria.name = true;
  }
  if (user.phone && profile.contact_phone === user.phone) criteria.phone = true;
  if (user.phone && profile.location && profile.location.includes(user.phone)) {
    criteria.location = true;
  }

  if (type === 'participant') {
    if (user.full_name) {
      const userWords = user.full_name.toLowerCase().split(' ');
      const profileSkills = (profile.skills || []).join(' ').toLowerCase();
      const profileInterests = (profile.interests || []).join(' ').toLowerCase();

      const hasOverlap = userWords.some(word =>
        profileSkills.includes(word) || profileInterests.includes(word)
      );

      if (hasOverlap) criteria.skills = true;
    }
  }

  return criteria;
}

/**
 * Get match criteria for submissions
 */
function getSubmissionMatchCriteria(
  user: { email: string; full_name?: string; phone?: string },
  submission: any
): MatchCriteria {
  const criteria: MatchCriteria = {};

  if (submission.contact_email === user.email) criteria.email = true;
  if (user.full_name && submission.submitted_by && calculateNameSimilarity(user.full_name, submission.submitted_by) > 0.6) {
    criteria.name = true;
  }
  if (user.phone && submission.contact_phone === user.phone) criteria.phone = true;
  if (user.phone && submission.location && submission.location.includes(user.phone)) {
    criteria.location = true;
  }

  return criteria;
}

/**
 * Calculate name similarity using Levenshtein distance
 */
function calculateNameSimilarity(name1: string, name2: string): number {
  const words1 = name1.toLowerCase().split(' ');
  const words2 = name2.toLowerCase().split(' ');

  let totalSimilarity = 0;
  let comparisons = 0;

  for (const word1 of words1) {
    for (const word2 of words2) {
      const similarity = wordSimilarity(word1, word2);
      totalSimilarity += similarity;
      comparisons++;
    }
  }

  return comparisons > 0 ? totalSimilarity / comparisons : 0;
}

/**
 * Calculate similarity between two words
 */
function wordSimilarity(word1: string, word2: string): number {
  if (word1 === word2) return 1;

  const len1 = word1.length;
  const len2 = word2.length;
  const maxLen = Math.max(len1, len2);

  if (maxLen === 0) return 1;

  // Simple similarity based on common characters
  const commonChars = word1.split('').filter(char => word2.includes(char)).length;
  const totalChars = len1 + len2;

  return commonChars / totalChars;
}

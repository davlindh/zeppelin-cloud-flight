import type { Participant } from '@/types/unified';

export interface EnhancedFilters {
  searchTerm: string;
  roles: string[];
  skills: string[];
  experienceLevel: string[];
  contributionTypes: string[];
}

/**
 * Filters participants by search terms across multiple fields
 */
export const matchesSearchTerm = (participant: Participant, searchTerm: string): boolean => {
  if (!searchTerm) return true;

  const searchLower = searchTerm.toLowerCase();

  return (
    participant.name.toLowerCase().includes(searchLower) ||
    participant.bio?.toLowerCase().includes(searchLower) ||
    participant.roles?.some(role => role.toLowerCase().includes(searchLower)) ||
    participant.skills?.some(skill => skill.toLowerCase().includes(searchLower))
  );
};

/**
 * Filters participants by roles
 */
export const matchesRoles = (participant: Participant, roles: string[]): boolean => {
  if (roles.length === 0) return true;
  return participant.roles?.some(role => roles.includes(role)) || false;
};

/**
 * Filters participants by skills
 */
export const matchesSkills = (participant: Participant, skills: string[]): boolean => {
  if (skills.length === 0) return true;
  return participant.skills?.some(skill => skills.includes(skill)) || false;
};

/**
 * Filters participants by experience level
 */
export const matchesExperienceLevel = (
  participant: Participant,
  experienceLevels: string[]
): boolean => {
  if (experienceLevels.length === 0) return true;
  return participant.experienceLevel
    ? experienceLevels.includes(participant.experienceLevel)
    : false;
};

/**
 * Filters participants by contribution types
 */
export const matchesContributionTypes = (
  participant: Participant,
  contributionTypes: string[]
): boolean => {
  if (contributionTypes.length === 0) return true;

  return participant.contributions?.some(contribution =>
    contributionTypes.includes(contribution)
  ) || false;
};

/**
 * Main filtering function combining all filters
 */
export const filterParticipants = (
  participants: Participant[],
  filters: Partial<EnhancedFilters>
): Participant[] => {
  return participants.filter(participant => {
    if (!matchesSearchTerm(participant, filters.searchTerm || '')) return false;
    if (!matchesRoles(participant, filters.roles || [])) return false;
    if (!matchesSkills(participant, filters.skills || [])) return false;
    if (!matchesExperienceLevel(participant, filters.experienceLevel || [])) return false;
    if (!matchesContributionTypes(participant, filters.contributionTypes || [])) return false;

    return true;
  });
};

/**
 * Generates available filter options from participants data
 */
export const generateFilterOptions = (participants: Participant[]) => {
  const roles = new Set<string>();
  const skills = new Set<string>();
  const experienceLevel = new Set<string>();
  const contributionTypes = new Set<string>();

  participants.forEach(participant => {
    participant.roles?.forEach(role => roles.add(role));
    participant.skills?.forEach(skill => skills.add(skill));
    if (participant.experienceLevel) experienceLevel.add(participant.experienceLevel);
    participant.contributions?.forEach(contribution => contributionTypes.add(contribution));

    // Add contribution types based on media/project participation
    if (participant.media && participant.media.length > 0) contributionTypes.add('Media Creator');
    if (participant.projects && participant.projects.length > 0) contributionTypes.add('Project Participant');
    if (participant.personalLinks && participant.personalLinks.length > 0) contributionTypes.add('Professional');
  });

  return {
    roles: Array.from(roles).sort(),
    skills: Array.from(skills).sort(),
    experienceLevel: Array.from(experienceLevel).sort(),
    contributionTypes: Array.from(contributionTypes).sort()
  };
};

/**
 * Finds a participant by slug
 */
export const getParticipantBySlug = (
  participants: Participant[],
  slug: string
): Participant | null => {
  return participants.find(p => p.slug === slug) || null;
};

/**
 * Generates participant statistics
 */
export const generateParticipantStats = (participants: Participant[]) => {
  const totalParticipants = participants.length;
  const totalProjects = new Set(
    participants.flatMap(p => p.projects?.map(proj => proj.id) || [])
  ).size;
  const totalMedia = participants.reduce((sum, p) => sum + (p.media?.length || 0), 0);

  return {
    totalParticipants,
    totalProjects,
    totalMedia,
    roleDistribution: generateFilterOptions(participants).roles.map(role => ({
      role,
      count: participants.filter(p => p.roles?.includes(role)).length
    }))
  };
};

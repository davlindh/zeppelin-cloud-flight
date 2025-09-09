import type { ShowcaseCard } from '../../types/index';

export interface ParticipantEntity {
  slug: string;
  name: string;
  roles: string[];
  bio?: string;
  avatar?: string;
  projects: Array<{
    id: string;
    title: string;
  }>;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a') 
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function aggregateParticipants(cards: ShowcaseCard[]): ParticipantEntity[] {
  const participantMap = new Map<string, ParticipantEntity>();
  const slugCounts = new Map<string, number>();

  cards.forEach((card) => {
    if (!card.participants) return;

    card.participants.forEach((participant) => {
      const baseSlug = slugify(participant.name);
      
      // Handle duplicate slugs
      let finalSlug = baseSlug;
      const existingCount = slugCounts.get(baseSlug) || 0;
      if (existingCount > 0) {
        finalSlug = `${baseSlug}-${existingCount + 1}`;
      }
      slugCounts.set(baseSlug, existingCount + 1);

      const existingParticipant = participantMap.get(participant.name);
      
      if (existingParticipant) {
        // Merge data
        if (!existingParticipant.roles.includes(participant.role)) {
          existingParticipant.roles.push(participant.role);
        }
        
        // Use longest bio
        if (participant.bio && (!existingParticipant.bio || participant.bio.length > existingParticipant.bio.length)) {
          existingParticipant.bio = participant.bio;
        }
        
        // Use first non-empty avatar
        if (participant.avatar && !existingParticipant.avatar) {
          existingParticipant.avatar = participant.avatar;
        }
        
        // Add project if not already included
        if (!existingParticipant.projects.find(p => p.id === card.id)) {
          existingParticipant.projects.push({
            id: card.id,
            title: card.title
          });
        }
      } else {
        // Create new participant
        participantMap.set(participant.name, {
          slug: finalSlug,
          name: participant.name,
          roles: [participant.role],
          bio: participant.bio,
          avatar: participant.avatar,
          projects: [{
            id: card.id,
            title: card.title
          }]
        });
      }
    });
  });

  return Array.from(participantMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}
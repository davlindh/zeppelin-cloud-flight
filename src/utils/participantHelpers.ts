import type { ShowcaseCard } from '../../types/index';
import type { Participant } from '../types/unified';

// Legacy type alias for backwards compatibility  
export type ParticipantEntity = Participant;

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

export function aggregateParticipants(cards: ShowcaseCard[]): Participant[] {
  const participantMap = new Map<string, Participant>();
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
        if (!existingParticipant.projects?.find(p => p.id === card.id)) {
          if (!existingParticipant.projects) existingParticipant.projects = [];
          existingParticipant.projects.push({
            id: card.id,
            slug: card.slug || card.id,
            title: card.title,
            role: participant.role,
            imageUrl: card.imageUrl
          });
        }
        
        // Add media from this project
        if (card.media) {
          if (!existingParticipant.media) existingParticipant.media = [];
          card.media.forEach(mediaItem => {
            const existingMedia = existingParticipant.media?.find(m => 
              m.url === mediaItem.url
            );
            if (!existingMedia) {
              existingParticipant.media?.push({
                ...mediaItem,
                category: 'featured' as const,
                participantId: existingParticipant.id
              });
            }
          });
        }
        
        // Add personal/professional links from this project
        if (card.links) {
          if (!existingParticipant.personalLinks) existingParticipant.personalLinks = [];
          card.links.forEach(link => {
            const existingLink = existingParticipant.personalLinks?.find(l => 
              l.url === link.url
            );
            if (!existingLink) {
              existingParticipant.personalLinks?.push({
                type: link.type,
                url: link.url
              });
            }
          });
        }
      } else {
        // Create new participant
        const newParticipant: Participant = {
          id: '', // Will be populated from database later
          slug: finalSlug,
          name: participant.name,
          roles: [participant.role],
          bio: participant.bio,
          avatar: participant.avatar,
          projects: [{
            id: card.id,
            slug: card.slug || card.id,
            title: card.title,
            role: participant.role,
            imageUrl: card.imageUrl
          }],
          media: [],
          personalLinks: []
        };
        
        // Add media from this project
        if (card.media) {
          card.media.forEach(mediaItem => {
            newParticipant.media?.push({
              ...mediaItem,
              category: 'featured' as const,
              participantId: newParticipant.id
            });
          });
        }
        
        // Add personal/professional links from this project
        if (card.links) {
          card.links.forEach(link => {
            newParticipant.personalLinks?.push({
              type: link.type,
              url: link.url
            });
          });
        }
        
        participantMap.set(participant.name, newParticipant);
      }
    });
  });

  return Array.from(participantMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}
import type { ShowcaseCard } from '../../types/index';
import { PROJECT_DATA } from '../../constants/data/projects';
import { PARTICIPANT_DATA } from '../../constants/data/participants';
import { SPONSOR_DATA } from '../../constants/data/sponsors';
import { 
  PROJECT_PARTICIPANTS, 
  PROJECT_SPONSORS, 
  PROJECT_LINKS, 
  PROJECT_TAGS,
  PROJECT_MEDIA,
  PROJECT_BUDGETS,
  PROJECT_TIMELINES,
  PROJECT_ACCESS,
  PROJECT_VOTING
} from '../../constants/data/relationships';
import { getFullAssetUrl } from '../../constants/storage';
import { ANASTASIYA_EXTRA_PROJECTS } from '../../constants/anastasiyaProjects';

/**
 * Build ShowcaseCard objects from normalized data
 */
export function buildShowcaseCards(): ShowcaseCard[] {
  const cards: ShowcaseCard[] = PROJECT_DATA.map(project => {
    // Get project participants
    const projectParticipants = PROJECT_PARTICIPANTS
      .filter(pp => pp.project_id === project.id)
      .map(pp => {
        const participant = PARTICIPANT_DATA.find(p => p.id === pp.participant_id);
        if (!participant) return null;
        
        return {
          name: participant.name,
          role: pp.role,
          bio: participant.bio,
          avatar: participant.avatar_path ? getFullAssetUrl('participants', participant.avatar_path) : undefined
        };
      })
      .filter(Boolean) as ShowcaseCard['participants'];

    // Get project sponsors
    const projectSponsors = PROJECT_SPONSORS
      .filter(ps => ps.project_id === project.id)
      .map(ps => {
        const sponsor = SPONSOR_DATA.find(s => s.id === ps.sponsor_id);
        if (!sponsor) return null;
        
        return {
          name: sponsor.name,
          type: sponsor.type,
          logo: sponsor.logo_path ? getFullAssetUrl('partners', sponsor.logo_path) : undefined,
          website: sponsor.website
        };
      })
      .filter(Boolean) as ShowcaseCard['sponsors'];

    // Get project links
    const projectLinks = PROJECT_LINKS
      .filter(pl => pl.project_id === project.id)
      .map(pl => ({
        type: pl.type,
        url: pl.url
      }));

    // Get project tags
    const projectTags = PROJECT_TAGS
      .filter(pt => pt.project_id === project.id)
      .map(pt => pt.tag);

    // Get project media
    const projectMedia = PROJECT_MEDIA
      .filter(pm => pm.project_id === project.id)
      .map(pm => ({
        type: pm.type,
        url: pm.url,
        title: pm.title,
        description: pm.description
      }));

    // Get project budget
    const projectBudget = PROJECT_BUDGETS.find(pb => pb.project_id === project.id);

    // Get project timeline
    const projectTimeline = PROJECT_TIMELINES.find(pt => pt.project_id === project.id);

    // Get project access
    const projectAccess = PROJECT_ACCESS.find(pa => pa.project_id === project.id);

    // Get project voting
    const projectVoting = PROJECT_VOTING.find(pv => pv.project_id === project.id);

    // Build the showcase card
    const showcaseCard: ShowcaseCard = {
      id: project.id,
      title: project.title,
      description: project.description,
      imageUrl: getFullAssetUrl('projects', project.image_path || 'placeholder-project.svg'),
      fullDescription: project.full_description,
      purpose: project.purpose,
      expected_impact: project.expected_impact,
      associations: project.associations,
      participants: projectParticipants?.length ? projectParticipants : undefined,
      sponsors: projectSponsors?.length ? projectSponsors : undefined,
      links: projectLinks?.length ? projectLinks : undefined,
      tags: projectTags?.length ? projectTags : undefined,
      media: projectMedia?.length ? projectMedia : undefined,
      budget: projectBudget ? {
        amount: projectBudget.amount,
        currency: projectBudget.currency,
        breakdown: projectBudget.breakdown
      } : undefined,
      timeline: projectTimeline ? {
        startDate: projectTimeline.start_date,
        endDate: projectTimeline.end_date,
        milestones: projectTimeline.milestones
      } : undefined,
      access: projectAccess ? {
        requirements: projectAccess.requirements,
        target_audience: projectAccess.target_audience,
        capacity: projectAccess.capacity,
        registration_required: projectAccess.registration_required
      } : undefined,
      voting: projectVoting ? {
        enabled: projectVoting.enabled,
        categories: projectVoting.categories,
        results: projectVoting.results
      } : undefined
    };

    return showcaseCard;
  });

  // Add Anastasiya's extra projects (keeping backwards compatibility)
  return [...cards, ...ANASTASIYA_EXTRA_PROJECTS];
}

import type { 
  ProjectParticipantSchema, 
  ProjectSponsorSchema, 
  ProjectLinkSchema, 
  ProjectTagSchema,
  ProjectMediaSchema,
  ProjectBudgetSchema,
  ProjectTimelineSchema,
  ProjectAccessSchema,
  ProjectVotingSchema
} from '../../types/schema';

// Import participant media data
export { PARTICIPANT_MEDIA } from './participantMedia';

// Project-Participant relationships
export const PROJECT_PARTICIPANTS: ProjectParticipantSchema[] = [
  {
    id: 'pp_001',
    project_id: '4',
    participant_id: 'part_001',
    role: 'Visual Artist & Performance',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pp_002',
    project_id: '6',
    participant_id: 'part_002',
    role: 'Musician & Sound Artist',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pp_003',
    project_id: '6',
    participant_id: 'part_003',
    role: 'Experimental Band',
    created_at: '2024-01-01T00:00:00Z'
  },
  // Anastasiya's VR project
  {
    id: 'pp_004',
    project_id: 'anastasiya-1',
    participant_id: 'part_004',
    role: 'Lead Artist & Technical Director',
    created_at: '2024-01-01T00:00:00Z'
  },
  // Anastasiya's NFT project
  {
    id: 'pp_005',
    project_id: 'anastasiya-2',
    participant_id: 'part_004',
    role: 'Artist & Blockchain Curator',
    created_at: '2024-01-01T00:00:00Z'
  },
  // Anastasiya's media wall project
  {
    id: 'pp_006',
    project_id: 'anastasiya-3',
    participant_id: 'part_004',
    role: 'Interaction Designer & Visual Artist',
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Project-Sponsor relationships
export const PROJECT_SPONSORS: ProjectSponsorSchema[] = [
  {
    id: 'ps_001',
    project_id: '1',
    sponsor_id: 'sponsor_001',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ps_002',
    project_id: '2',
    sponsor_id: 'sponsor_002',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ps_003',
    project_id: '3',
    sponsor_id: 'sponsor_003',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ps_004',
    project_id: '6',
    sponsor_id: 'sponsor_004',
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Project Links
export const PROJECT_LINKS: ProjectLinkSchema[] = [
  {
    id: 'pl_001',
    project_id: '4',
    type: 'website',
    url: 'https://irina-art.com',
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Project Tags
export const PROJECT_TAGS: ProjectTagSchema[] = [
  // Project 1 tags
  { id: 'pt_001', project_id: '1', tag: 'Automation', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_002', project_id: '1', tag: 'Robotik', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_003', project_id: '1', tag: 'Landskapskonst', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_004', project_id: '1', tag: 'BTH Samarbete', created_at: '2024-01-01T00:00:00Z' },

  // Project 2 tags
  { id: 'pt_005', project_id: '2', tag: 'Stenhuggeri', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_006', project_id: '2', tag: 'Traditionellt Hantverk', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_007', project_id: '2', tag: 'Smide', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_008', project_id: '2', tag: 'Keramik', created_at: '2024-01-01T00:00:00Z' },

  // Project 3 tags
  { id: 'pt_009', project_id: '3', tag: 'Drönarshow', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_010', project_id: '3', tag: 'Ljuskonst', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_011', project_id: '3', tag: 'Skärgård', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_012', project_id: '3', tag: 'Spektakulärt', created_at: '2024-01-01T00:00:00Z' },

  // Project 4 tags
  { id: 'pt_013', project_id: '4', tag: 'Digital Målning', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_014', project_id: '4', tag: 'Akvarell', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_015', project_id: '4', tag: 'Stadsmotiv', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_016', project_id: '4', tag: 'Workshop', created_at: '2024-01-01T00:00:00Z' },

  // Project 5 tags
  { id: 'pt_017', project_id: '5', tag: 'Videoperformance', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_018', project_id: '5', tag: 'Interaktiv Konst', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_019', project_id: '5', tag: 'Fantasi', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_020', project_id: '5', tag: 'Publikdeltagande', created_at: '2024-01-01T00:00:00Z' },

  // Project 6 tags
  { id: 'pt_021', project_id: '6', tag: 'Ambient Musik', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_022', project_id: '6', tag: 'Experimentellt', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_023', project_id: '6', tag: 'Elektronika', created_at: '2024-01-01T00:00:00Z' },
  { id: 'pt_024', project_id: '6', tag: 'Filmisk Ljud', created_at: '2024-01-01T00:00:00Z' }
];

// Project Media - Rich multimedia examples for all projects
export const PROJECT_MEDIA: ProjectMediaSchema[] = [
  // Project 1 - Robotics & Automation
  {
    id: 'pm_001',
    project_id: '1',
    type: 'video',
    url: '/media/videos/robotics-demo.mp4',
    title: 'Robotisk Landskapsformning - Demo',
    description: 'Timelapse-video som visar robotarnas precision i naturmiljö',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_002', 
    project_id: '1',
    type: 'document',
    url: '/media/documents/tech-specifications.pdf',
    title: 'Tekniska Specifikationer',
    description: 'Detaljerad teknisk dokumentation för robotsystemet',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_003',
    project_id: '1', 
    type: 'image',
    url: '/media/images/process-shots.jpg',
    title: 'Process Documentation',
    description: 'Behind-the-scenes bilder från utvecklingsprocessen',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Project 2 - Traditional Crafts
  {
    id: 'pm_004',
    project_id: '2',
    type: 'video',
    url: '/media/videos/crafts-workshop.mp4', 
    title: 'Mästarklass i Stenhuggeri',
    description: 'Dokumentation av traditionella tekniker och moderna tillämpningar',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_005',
    project_id: '2',
    type: 'audio',
    url: '/media/audio/hammer-sounds.mp3',
    title: 'Ljuden av Hantverk',
    description: 'Inspelningar från verkstaden - hammare, mejslar och eld',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_006',
    project_id: '2',
    type: 'image',
    url: '/media/images/craft-portfolio.jpg',
    title: 'Hantverksportfölj',
    description: 'Utvalda verk från stenhuggare och smeder',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Project 3 - Drone Light Show  
  {
    id: 'pm_007',
    project_id: '3',
    type: 'video',
    url: '/media/videos/drone-spectacle.mp4',
    title: 'Skärgårdsspektakel - Fullständig Show',
    description: '15-minuters drönareshow över Karlskronas skärgård',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_008',
    project_id: '3',
    type: 'image',
    url: '/media/images/aerial-formations.jpg',
    title: 'Luftformationer',
    description: 'Spektakulära formationer av 200 synkroniserade drönare',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_009',
    project_id: '3',
    type: 'document',
    url: '/media/documents/technical-rider.pdf',
    title: 'Technical Rider',
    description: 'Tekniska krav och säkerhetsprotokoll för showen',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Project 4 - Irina's Digital Art
  {
    id: 'pm_010',
    project_id: '4',
    type: 'image',
    url: '/media/images/digital-paintings.jpg',
    title: 'Digital Akvarellsamling',
    description: 'Portfolio av Irinas digitala akvarellmålningar',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_011',
    project_id: '4',
    type: 'video',
    url: '/media/videos/painting-process.mp4',
    title: 'Målarprocess - Timelapse',
    description: 'Timelapse som visar skapandet av en digital akvarell',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_012',
    project_id: '4',
    type: 'audio',
    url: '/media/audio/workshop-session.mp3',
    title: 'Workshop-session',
    description: 'Ljudinspelning från en målarklass med Irina',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Project 5 - Interactive Performance
  {
    id: 'pm_013', 
    project_id: '5',
    type: 'video',
    url: '/media/videos/interactive-performance.mp4',
    title: 'Interaktiv Videoperformance',
    description: 'Fullständig dokumentation av den interaktiva installationen',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_014',
    project_id: '5',
    type: 'image',
    url: '/media/images/audience-interaction.jpg',
    title: 'Publikinteraktion',
    description: 'Publikens reaktioner och deltagande i performancen',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Project 6 - Experimental Music
  {
    id: 'pm_015',
    project_id: '6',
    type: 'audio',
    url: '/media/audio/ambient-composition.mp3',
    title: 'Ambient Komposition #1',
    description: 'Experimentell ljudkomposition med handgjorda instrument',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_016',
    project_id: '6',
    type: 'video',
    url: '/media/videos/instrument-building.mp4',
    title: 'Instrumentbyggande',
    description: 'Dokumentation av processen att skapa egna instrument',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_017',
    project_id: '6',
    type: 'image',
    url: '/media/images/experimental-setup.jpg',
    title: 'Experimentuppställning',
    description: 'Studio setup med handgjorda elektroniska instrument',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Anastasiya's VR Project additional media
  {
    id: 'pm_018',
    project_id: 'anastasiya-1',
    type: 'video',
    url: '/media/videos/vr-walkthrough.mp4',
    title: 'VR Experience Walkthrough',
    description: 'Complete walkthrough of the Digital Borderlands VR experience',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_019',
    project_id: 'anastasiya-1',
    type: 'document',
    url: '/media/documents/vr-technical-specs.pdf',
    title: 'VR Technical Specifications',
    description: 'Hardware requirements and setup documentation',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Anastasiya's NFT Project additional media
  {
    id: 'pm_020',
    project_id: 'anastasiya-2',
    type: 'image',
    url: '/media/images/nft-gallery.jpg',
    title: 'NFT Collection Gallery',
    description: 'Visual overview of the complete Fragments of Home collection',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_021',
    project_id: 'anastasiya-2',
    type: 'video',
    url: '/media/videos/artist-interview.mp4',
    title: 'Artist Interview',
    description: 'In-depth interview about the inspiration behind the collection',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Anastasiya's Media Wall additional media
  {
    id: 'pm_022',
    project_id: 'anastasiya-3',
    type: 'video',
    url: '/media/videos/installation-timelapse.mp4',
    title: 'Installation Timelapse',
    description: 'Time-lapse of the 15-meter media wall installation at Arlanda',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_023',
    project_id: 'anastasiya-3',
    type: 'image',
    url: '/media/images/visitor-interactions.jpg',
    title: 'Visitor Interactions',
    description: 'Passengers interacting with the responsive media wall',
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Project Budgets
export const PROJECT_BUDGETS: ProjectBudgetSchema[] = [];

// Project Timelines
export const PROJECT_TIMELINES: ProjectTimelineSchema[] = [];

// Project Access
export const PROJECT_ACCESS: ProjectAccessSchema[] = [];

// Project Voting
export const PROJECT_VOTING: ProjectVotingSchema[] = [];
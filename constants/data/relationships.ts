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

// Project Media
export const PROJECT_MEDIA: ProjectMediaSchema[] = [];

// Project Budgets
export const PROJECT_BUDGETS: ProjectBudgetSchema[] = [];

// Project Timelines
export const PROJECT_TIMELINES: ProjectTimelineSchema[] = [];

// Project Access
export const PROJECT_ACCESS: ProjectAccessSchema[] = [];

// Project Voting
export const PROJECT_VOTING: ProjectVotingSchema[] = [];
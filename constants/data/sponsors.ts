import type { SponsorSchema } from '../../types/schema';

export const SPONSOR_DATA: SponsorSchema[] = [
  {
    id: 'sponsor_001',
    name: 'Karlskrona Kommun',
    type: 'main',
    logo_path: 'partners/karlskrona-kommun-logo.png',
    website: 'https://www.karlskrona.se',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'sponsor_002',
    name: 'Maskin & Fritid',
    type: 'partner',
    logo_path: 'partners/maskin-fritid-logo.png',
    website: 'https://www.maskinfritid.se',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'sponsor_003',
    name: 'Stenbräcka',
    type: 'partner',
    logo_path: 'partners/stenbracka-logo.png',
    website: 'https://www.stenbracka.se',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'sponsor_004',
    name: 'Visit Blekinge',
    type: 'supporter',
    logo_path: 'partners/visit-blekinge-logo.png',
    website: 'https://www.visitblekinge.se',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];
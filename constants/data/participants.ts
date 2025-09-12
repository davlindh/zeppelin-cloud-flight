import type { ParticipantSchema } from '../../types/schema';

export const PARTICIPANT_DATA: ParticipantSchema[] = [
  {
    id: 'part_001',
    name: 'Irina Novokrescionova',
    slug: 'irina-novokrescionova',
    bio: 'Karlskronakonstnär från Litauen/Sverige. Målar stadsmotiv, blommor och hav i akvarell. Håller målarworkshops och utför restaurering.',
    avatar_path: 'participants/irina-novokrescionova.jpg',
    website: 'https://irina-art.com',
    social_links: [
      { platform: 'instagram', url: 'https://instagram.com/irina_art_karlskrona' },
      { platform: 'facebook', url: 'https://facebook.com/irina.novokrescionova' }
    ],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'part_002',
    name: 'Jonatan Haner',
    slug: 'jonatan-haner',
    bio: 'Experimentell musiker och ljudkonstnär från södra Sverige.',
    avatar_path: 'participants/placeholder-avatar.svg',
    website: 'https://jonatanhaner.bandcamp.com',
    social_links: [
      { platform: 'soundcloud', url: 'https://soundcloud.com/jonatanhaner' },
      { platform: 'spotify', url: 'https://open.spotify.com/artist/jonatanhaner' }
    ],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'part_003',
    name: 'Cooking Potato',
    slug: 'cooking-potato',
    bio: 'Ambient/experimentellt band från södra Sverige som experimenterar med ljud och skapar egna instrument.',
    avatar_path: 'participants/placeholder-avatar.svg',
    website: 'https://cookingpotato.bandcamp.com',
    social_links: [
      { platform: 'bandcamp', url: 'https://cookingpotato.bandcamp.com' },
      { platform: 'youtube', url: 'https://youtube.com/@cookingpotato' }
    ],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'part_004',
    name: 'Anastasiya Loyko',
    slug: 'anastasiya-loyko',
    bio: 'Interaktiv mediakonstnär och VR-specialist från Ukraina/Sverige. Skapar immersiva upplevelser som utforskar identitet, migration och teknologi.',
    avatar_path: 'participants/placeholder-avatar.svg',
    website: 'https://anastasiyaloyko.com',
    social_links: [
      { platform: 'instagram', url: 'https://instagram.com/anastasiya_vr_art' },
      { platform: 'linkedin', url: 'https://linkedin.com/in/anastasiyaloyko' },
      { platform: 'twitter', url: 'https://twitter.com/anastasiya_vr' }
    ],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];
import type { ParticipantMediaSchema } from '../../types/schema';

export const PARTICIPANT_MEDIA: ParticipantMediaSchema[] = [
  // Irina Novokrescionova media
  {
    id: 'pm_part_001',
    participant_id: 'part_001',
    type: 'portfolio',
    category: 'featured',
    url: '/media/images/irina-portfolio-featured.jpg',
    title: 'Karlskrona Stadsmotiv - Akvarellserie',
    description: 'En serie akvarellmålningar som fångar Karlskronas unika arkitektur och maritima atmosfär',
    year: '2024',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_part_002',
    participant_id: 'part_001',
    type: 'video',
    category: 'process',
    url: '/media/videos/irina-painting-process.mp4',
    title: 'Akvarellteknik - Målardemo',
    description: 'Demonstration av digital akvarellteknik med focus på ljus och skuggor',
    year: '2024',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_part_003',
    participant_id: 'part_001',
    type: 'image',
    category: 'archive',
    url: '/media/images/irina-workshop-documentation.jpg',
    title: 'Workshop Dokumentation',
    description: 'Bilder från målarworkshops för barn och vuxna i Karlskrona',
    year: '2023',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_part_004',
    participant_id: 'part_001',
    type: 'document',
    category: 'collaboration',
    url: '/media/documents/irina-restoration-portfolio.pdf',
    title: 'Restaureringsportfölj',
    description: 'Dokumentation av restaureringsprojekt på historiska målningar',
    year: '2023',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Jonatan Haner media
  {
    id: 'pm_part_005',
    participant_id: 'part_002',
    type: 'audio',
    category: 'featured',
    url: '/media/audio/jonatan-experimental-composition.mp3',
    title: 'Experimentell Komposition #7',
    description: 'Ambient ljudkomposition med field recordings från södra Sverige',
    year: '2024',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_part_006',
    participant_id: 'part_002',
    type: 'video',
    category: 'process',
    url: '/media/videos/jonatan-sound-experiments.mp4',
    title: 'Ljudexperiment i Naturen',
    description: 'Dokumentation av field recording-sessioner och ljudexperiment utomhus',
    year: '2024',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_part_007',
    participant_id: 'part_002',
    type: 'audio',
    category: 'collaboration',
    url: '/media/audio/jonatan-collaboration-mix.mp3',
    title: 'Kollaborativ Mix med Cooking Potato',
    description: 'Gemensamt ljudverk skapat tillsammans med Cooking Potato',
    year: '2024',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Cooking Potato media
  {
    id: 'pm_part_008',
    participant_id: 'part_003',
    type: 'audio',
    category: 'featured',
    url: '/media/audio/cooking-potato-live-session.mp3',
    title: 'Live Session - Experimentella Instrument',
    description: 'Liveuppträdande med handgjorda elektroniska instrument',
    year: '2024',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_part_009',
    participant_id: 'part_003',
    type: 'video',
    category: 'process',
    url: '/media/videos/cooking-potato-instrument-building.mp4',
    title: 'Bygga Egna Instrument',
    description: 'Timelapse av skapandeprocessen för handgjorda elektroniska instrument',
    year: '2024',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_part_010',
    participant_id: 'part_003',
    type: 'image',
    category: 'archive',
    url: '/media/images/cooking-potato-studio-setup.jpg',
    title: 'Studio Setup 2023',
    description: 'Dokumentation av studio-uppställning med experimentella instrument',
    year: '2023',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Anastasiya Loyko media
  {
    id: 'pm_part_011',
    participant_id: 'part_004',
    type: 'video',
    category: 'featured',
    url: '/media/videos/anastasiya-vr-demo-reel.mp4',
    title: 'VR Demo Reel 2024',
    description: 'Sammanställning av VR-projekt och interaktiva installationer',
    year: '2024',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_part_012',
    participant_id: 'part_004',
    type: 'document',
    category: 'collaboration',
    url: '/media/documents/anastasiya-tech-rider.pdf',
    title: 'Technical Rider - Interaktiva Installationer',
    description: 'Tekniska specifikationer för VR och interaktiva mediaprojekt',
    year: '2024',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_part_013',
    participant_id: 'part_004',
    type: 'image',
    category: 'process',
    url: '/media/images/anastasiya-behind-scenes.jpg',
    title: 'Bakom Kulisserna - VR Development',
    description: 'Utvecklingsprocess för VR-upplevelser och motion capture',
    year: '2024',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_part_014',
    participant_id: 'part_004',
    type: 'portfolio',
    category: 'featured',
    url: '/media/images/anastasiya-interactive-portfolio.jpg',
    title: 'Interaktiv Media Portfolio',
    description: 'Portfolio över interaktiva installationer och digitala konstverk',
    year: '2024',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pm_part_015',
    participant_id: 'part_004',
    type: 'video',
    category: 'collaboration',
    url: '/media/videos/anastasiya-artist-talk.mp4',
    title: 'Artist Talk - Migration & Technology',
    description: 'Föreläsning om konst, teknologi och diaspora-identitet',
    year: '2024',
    created_at: '2024-01-01T00:00:00Z'
  }
];
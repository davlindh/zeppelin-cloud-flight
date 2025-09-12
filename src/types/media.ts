export type MediaType = 'video' | 'audio' | 'image' | 'document' | 'portfolio' | 'pdf' | 'presentation' | 'archive' | 'code' | '3d';

export type MediaCategory = 'featured' | 'process' | 'archive' | 'collaboration' | 'promotional' | 'technical' | 'artistic';

export interface BaseMediaItem {
  id?: string;
  type: MediaType;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number; // in seconds for audio/video
  size?: number; // file size in bytes
  mimeType?: string;
}

export interface ProjectMediaItem extends BaseMediaItem {
  projectId?: string;
}

export interface ParticipantMediaItem extends BaseMediaItem {
  participantId?: string;
  category: MediaCategory;
  year?: string;
}

export interface PartnerMediaItem extends BaseMediaItem {
  partnerId?: string;
  category: MediaCategory;
}

export type MediaItem = ProjectMediaItem | ParticipantMediaItem | PartnerMediaItem;

export interface MediaPlayerState {
  currentMedia: MediaItem | null;
  queue: MediaItem[];
  isPlaying: boolean;
  isPaused: boolean;
  progress: number; // 0-100
  duration: number; // in seconds
  volume: number; // 0-100
  isMuted: boolean;
  isMinimized: boolean;
  playbackRate: number;
}

export interface MediaContextValue extends MediaPlayerState {
  // Player controls
  playMedia: (media: MediaItem) => void;
  pauseMedia: () => void;
  togglePlay: () => void;
  stopMedia: () => void;
  seekTo: (position: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  
  // Queue management
  addToQueue: (media: MediaItem | MediaItem[]) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  nextMedia: () => void;
  previousMedia: () => void;
  shuffleQueue: () => void;
  
  // Player state
  toggleMinimize: () => void;
  closePlayer: () => void;
}
# Media Player Integration Guide

## Overview

The persistent media player has been fully integrated into the Zeppelin Cloud Flight project, providing seamless audio and video playback across all showcase projects, participants, and media galleries.

## Architecture

### Components

1. **MediaContext** (`src/contexts/MediaContext.tsx`)
   - Global state management for media playback
   - Queue management (add, remove, clear, shuffle)
   - Playback controls (play, pause, stop, seek)
   - Volume and playback rate control

2. **PersistentMediaPlayer** (`src/components/media/core/PersistentMediaPlayer.tsx`)
   - Minimizable/maximizable player UI
   - Queue display and management
   - Persistent across page navigation
   - Auto-play next in queue

3. **MediaCardSimple** (`src/components/media/core/MediaCardSimple.tsx`)
   - Individual media card with play/queue buttons
   - Integrated with MediaContext hooks
   - Supports images, videos, audio, documents

4. **UnifiedMediaManager** (`src/components/media/UnifiedMediaManager.tsx`)
   - Gallery view with "Play All" and "Add All to Queue" buttons
   - Tab-based filtering (all, images, videos, audio, documents)
   - Entity-specific media display (projects, participants, sponsors)

## User Flows

### Playing Single Media Item

1. User browses a project's media gallery
2. User clicks "Spela" (Play) button on a video/audio card
3. Media starts playing in PersistentMediaPlayer
4. Player appears at bottom of screen (expanded view)
5. Player shows:
   - Current media title and thumbnail
   - Play/pause controls
   - Progress bar
   - Volume control
   - Queue button (shows queue count)

### Building a Playlist

1. User browses media gallery
2. User clicks "+" (Add to Queue) button on multiple items
3. Items are added to playback queue
4. User can:
   - View queue by expanding player
   - Reorder items (drag and drop)
   - Remove items with X button
   - Clear entire queue

### Playing All Media

1. User opens project detail page with media
2. User sees "Spela alla" (Play All) button if playable media exists
3. User clicks button
4. System:
   - Clears existing queue
   - Adds all playable media to queue  
   - Starts playing first item
   - Shows toast notification with count

### Adding All to Queue

1. User clicks "Lägg till alla" (Add All to Queue)
2. All playable media items added to existing queue
3. Toast notification confirms addition
4. Current playback continues uninterrupted

## Technical Implementation

### MediaContext State

```typescript
interface MediaPlayerState {
  currentMedia: MediaItem | null;
  queue: MediaItem[];
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isMinimized: boolean;
  playbackRate: number;
  error: string | null;
}
```

### MediaContext Actions

```typescript
{
  playMedia: (media: MediaItem) => void;
  pauseMedia: () => void;
  togglePlay: () => void;
  stopMedia: () => void;
  seekTo: (position: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  addToQueue: (media: MediaItem | MediaItem[]) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  nextMedia: () => void;
  previousMedia: () => void;
  shuffleQueue: () => void;
  toggleMinimize: () => void;
  closePlayer: () => void;
}
```

### MediaItem Interface

```typescript
interface MediaItem {
  id: string;
  type: 'video' | 'audio' | 'image' | 'document';
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
}
```

## Integration Points

### Project Detail Page

**File:** `src/pages/ProjectDetailPage.tsx`
**Component:** Uses `UnifiedMediaManager` in public mode
**Features:**
- Displays all media linked to project
- Play All / Add All to Queue buttons
- Individual media cards with play/queue actions

### Participant Detail Page

**File:** `src/pages/ParticipantDetailPage.tsx`  
**Component:** Uses `UnifiedMediaManager` in public mode
**Features:**
- Shows participant's media portfolio
- Same playback controls as project pages

### Media Gallery Page

**File:** `src/pages/MediaGalleryPage.tsx`
**Component:** Uses `UnifiedMediaManager` in global mode
**Features:**
- Browse all media across platform
- Admin features if logged in
- Full playback integration

## UI/UX Features

### Player States

1. **Hidden** - No player visible (default state)
2. **Minimized** - Compact bar at bottom with basic controls
3. **Expanded** - Full player with queue visible

### Visual Feedback

- **Toast Notifications** - Confirm actions (added to queue, playing)
- **Queue Badge** - Shows number of items in queue
- **Progress Bar** - Visual playback progress
- **Thumbnail** - Current media artwork/thumbnail
- **Hover States** - Interactive elements have clear hover effects

### Responsive Design

- **Desktop** - Full player with all controls
- **Tablet** - Optimized spacing, compact queue view
- **Mobile** - Touch-friendly controls, swipe gestures

## Keyboard Shortcuts

(Can be implemented in future enhancement)

- **Space** - Play/Pause
- **→** - Skip forward 10s
- **←** - Skip backward 10s
- **M** - Toggle mute
- **F** - Toggle fullscreen (for videos)
- **N** - Next in queue
- **P** - Previous in queue

## Database Schema

### Media Library Table

```sql
CREATE TABLE media_library (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'image', 'video', 'audio', 'document'
  public_url TEXT NOT NULL,
  thumbnail_url TEXT,
  mime_type TEXT,
  file_size BIGINT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Link Tables

```sql
-- Project media links
CREATE TABLE media_project_links (
  media_id UUID REFERENCES media_library(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (media_id, project_id)
);

-- Similar tables for participant_links and sponsor_links
```

## API Integration

### Fetching Media

**Hook:** `useMediaLibrary(filters: MediaFilters)`

```typescript
// Get all media for a project
const { media, isLoading, stats } = useMediaLibrary({
  project_id: projectId,
  status: 'approved' // public mode only shows approved
});
```

### Linking Media

**Hook:** `useLinkMedia()`

```typescript
const { linkToProject, linkToParticipant } = useLinkMedia();

// Link media to project
await linkToProject({
  mediaIds: ['media-uuid-1', 'media-uuid-2'],
  projectIds: ['project-uuid']
});
```

## Best Practices

### Performance

1. **Lazy Loading** - Media thumbnails loaded on demand
2. **Optimized Images** - Use `OptimizedImage` component
3. **Queue Limits** - Consider limiting queue size for performance
4. **Cleanup** - Properly clean up media players on unmount

### Accessibility

1. **ARIA Labels** - All controls have proper aria-labels
2. **Keyboard Navigation** - Tab through controls
3. **Screen Reader** - Announcements for state changes
4. **Focus Management** - Clear focus indicators

### Error Handling

1. **Network Errors** - Graceful fallback for failed loads
2. **Unsupported Formats** - Clear messaging
3. **Missing Media** - Handle deleted/moved files
4. **Playback Errors** - Auto-skip problematic items

## Testing Checklist

### Manual Testing

- [ ] Play single video from project page
- [x] Play single audio file
- [x] Add multiple items to queue
- [ x Remove items from queue
- [x] Clear entire queue
- [x] Play All button adds all media
- [x] Add All to Queue preserves current playback
- [x] Navigate between pages while playing
- [x] Minimize/maximize player
- [ ] Close player stops playback
- [ ] Volume control works
- [x] Seek/scrub timeline works
- [ ] Auto-play next in queue
- [ ] Toast notifications appear

### Edge Cases

- [ ] No playable media (images only)
- [ ] Single media item
- [ ] Very long queue (100+ items)
- [ ] Media fails to load
- [ ] Network interruption during playback
- [ ] Quick successive play button clicks
- [ ] Adding same item multiple times

## Future Enhancements

### Planned Features

1. **Playlist Management**
   - Save playlists
   - Share playlists
   - Collaborative playlists

2. **Advanced Playback**
   - Repeat modes (one, all, off)
   - Shuffle mode
   - Crossfade between tracks
   - Playback speed presets

3. **Social Features**
   - Like/favorite media
   - Comments on media
   - Share to social media

4. **Analytics**
   - Play counts
   - Popular media tracking
   - User listening history

5. **Mobile App**
   - Native mobile player
   - Background playback
   - Download for offline

### Technical Debt

1. Implement proper cleanup for media players
2. Add comprehensive error boundaries
3. Optimize re-renders in MediaContext
4. Add unit tests for player logic
5. Add E2E tests for user

# File Cache Service

A comprehensive local file caching system that automatically stores copies of loaded files for improved performance, reduced bandwidth usage, and offline access.

## Features

- **Automatic Caching**: Files are automatically cached when accessed through the system
- **Smart Storage Management**: Uses IndexedDB for efficient large file storage
- **User Preferences**: Respects user settings for cache behavior
- **Cache Expiration**: Configurable time-based expiration
- **Size Management**: Automatic cleanup when approaching storage limits
- **Offline Support**: Cached files remain available without internet connection
- **Performance Optimization**: Instant loading for cached files

## Architecture

### Core Components

1. **FileCacheService** (`src/services/FileCacheService.ts`)
   - Singleton service managing all cache operations
   - IndexedDB-based storage for efficient file handling
   - Configurable settings and size management

2. **useFileCache Hook** (`src/hooks/useFileCache.ts`)
   - React hook for easy cache integration
   - Provides cached URLs and loading states
   - Automatic cache checking and file retrieval

3. **CacheManager Component** (`src/components/ui/CacheManager.tsx`)
   - Admin interface for cache configuration
   - Real-time cache statistics and usage monitoring
   - User-friendly settings management

## Integration Examples

### Basic File Caching

```tsx
import { useCachedFile } from '@/hooks/useFileCache';

const MediaComponent = ({ fileUrl, title }) => {
  const { cachedUrl, isCached, isLoading, cacheFile } = useCachedFile(fileUrl, {
    title,
    type: 'image'
  });

  // Use cached URL if available, fallback to original
  const displayUrl = cachedUrl || fileUrl;

  return (
    <div>
      <img src={displayUrl} alt={title} />
      {isCached && <span>📁 Cached</span>}
      {!isCached && (
        <button onClick={cacheFile} disabled={isLoading}>
          {isLoading ? 'Caching...' : 'Cache File'}
        </button>
      )}
    </div>
  );
};
```

### Media Player Integration

The persistent media player automatically caches files when they start playing:

```tsx
// In PersistentPlayer component
const { cachedUrl, isCached, cacheFile } = useCachedFile(
  currentMedia?.url || '', 
  {
    title: currentMedia?.title,
    type: currentMedia?.type
  }
);

// Auto-cache when playing
useEffect(() => {
  if (isPlaying && currentMedia && !isCached) {
    cacheFile();
  }
}, [isPlaying, currentMedia, isCached, cacheFile]);
```

### Admin Cache Management

```tsx
import { useCacheManager } from '@/hooks/useFileCache';

const AdminPanel = () => {
  const { settings, stats, updateSettings, clearCache } = useCacheManager();

  return (
    <div>
      <h3>Cache Usage: {stats.sizeFormatted} / {stats.maxSizeMB} MB</h3>
      <button onClick={() => updateSettings({ enabled: !settings.enabled })}>
        {settings.enabled ? 'Disable' : 'Enable'} Cache
      </button>
      <button onClick={clearCache}>Clear All Cache</button>
    </div>
  );
};
```

## Configuration Options

### Cache Settings

```typescript
interface CacheSettings {
  enabled: boolean;           // Enable/disable caching
  maxSize: number;           // Maximum cache size in MB
  maxAge: number;            // File expiration time in milliseconds
  autoCleanup: boolean;      // Automatic cleanup of old files
  allowedMimeTypes: string[]; // Allowed file types for caching
}
```

### Default Settings

```typescript
const DEFAULT_CACHE_SETTINGS = {
  enabled: true,
  maxSize: 500,              // 500MB
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  autoCleanup: true,
  allowedMimeTypes: [
    'image/*',
    'video/*', 
    'audio/*',
    'application/pdf',
    'text/*'
  ]
};
```

## Storage Strategy

### IndexedDB Schema

```
Database: lovable-file-cache
Version: 1
Object Store: files

Entry Structure:
{
  id: string,              // Generated from URL
  url: string,             // Original file URL
  blob: Blob,              // File content
  mimeType: string,        // File MIME type
  size: number,            // File size in bytes
  cachedAt: number,        // Cache timestamp
  lastAccessed: number,    // Last access timestamp
  expiresAt?: number,      // Expiration timestamp
  metadata?: {             // Optional metadata
    title?: string,
    type?: string,
    projectId?: string,
    participantId?: string
  }
}
```

### Indexes

- `url`: Unique index for quick URL lookups
- `cachedAt`: For chronological sorting
- `lastAccessed`: For LRU cleanup
- `size`: For size-based management

## Automatic Behaviors

### Cache Population

1. **Media Player**: Files are cached when playback starts
2. **Image Loading**: Images can be cached on first view
3. **Manual Caching**: Components can explicitly cache files
4. **Background Caching**: Use Edge Runtime for background downloads

### Cleanup Strategy

1. **Size Limits**: Remove oldest files when approaching max size
2. **Time Expiration**: Remove files older than maxAge
3. **LRU Eviction**: Remove least recently used files first
4. **Manual Cleanup**: Admin can clear cache entirely

### Cache Checking

Files are checked for cache availability in this order:
1. Check IndexedDB for existing entry
2. Validate expiration time
3. Update last accessed timestamp
4. Return cached blob URL or null

## Performance Benefits

### Load Time Improvements

- **First Load**: Normal network request + background caching
- **Subsequent Loads**: Instant retrieval from cache
- **Offline Mode**: Files remain accessible without internet

### Bandwidth Savings

- Files downloaded only once per cache period
- Significant savings for frequently accessed media
- Reduced server load and data costs

### User Experience

- Faster navigation between pages
- Smooth media playback without buffering
- Offline capability for cached content

## Background Task Integration

For large files or batch operations, use Supabase Edge Functions with background tasks:

```typescript
// In Edge Function
async function cacheMediaFiles(urls: string[]) {
  for (const url of urls) {
    await fetch(url); // Pre-warm cache
  }
}

// Start background caching
Deno.serve(async (req) => {
  const { urls } = await req.json();
  
  // Start background task
  EdgeRuntime.waitUntil(cacheMediaFiles(urls));
  
  // Return immediate response
  return new Response('Caching started', { status: 200 });
});
```

## Monitoring & Analytics

### Cache Statistics

```typescript
const stats = await fileCacheService.getCacheStats();
console.log({
  totalFiles: stats.totalFiles,
  totalSize: stats.sizeFormatted,
  usagePercent: stats.usagePercent
});
```

### Error Handling

The service gracefully handles:
- Network failures during caching
- Storage quota exceeded
- Corrupted cache entries
- Browser compatibility issues

## Browser Compatibility

- **IndexedDB**: Supported in all modern browsers
- **Blob URLs**: Full support across platforms
- **Storage API**: Progressive enhancement available
- **Graceful Degradation**: Falls back to direct URLs if caching fails

## Security Considerations

### CORS Compliance

- Respects CORS policies for file access
- Only caches files from allowed origins
- Handles authentication headers appropriately

### Storage Isolation

- Cache is isolated per origin
- No cross-site data leakage
- Automatic cleanup on browser storage clear

### Privacy

- No sensitive data stored in metadata
- Files removed according to expiration policy
- User can disable caching entirely

## Future Enhancements

- **Service Worker Integration**: For more advanced offline capabilities
- **Compression**: Automatic file compression before storage
- **Prioritization**: Smart caching based on file importance
- **Sync**: Background synchronization with server
- **Analytics**: Detailed usage and performance metrics
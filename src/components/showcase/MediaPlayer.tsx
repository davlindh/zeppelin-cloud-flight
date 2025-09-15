import React from 'react';
import { UnifiedMediaGrid } from '../multimedia/UnifiedMediaGrid';
import type { UnifiedMediaItem } from '../../types/unified-media';

interface MediaPlayerProps {
    media: UnifiedMediaItem[];
    viewMode?: 'grid' | 'list';
    showPreview?: boolean;
    showPlayButton?: boolean;
    showAddToQueue?: boolean;
    showDownloadButton?: boolean;
    showMetadata?: boolean;
    enableSearch?: boolean;
    enableFilters?: boolean;
    className?: string;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({
    media,
    viewMode = 'grid',
    showPreview = true,
    showPlayButton = true,
    showAddToQueue = true,
    showDownloadButton = true,
    showMetadata = false,
    enableSearch = false,
    enableFilters = true,
    className
}) => {
    // If no media provided, return null
    if (!media || media.length === 0) {
        return null;
    }

    // Filter media to only playable types for now (videos and audio)
    const playableMedia = media.filter(item =>
        item.type === 'video' || item.type === 'audio'
    );

    // If we have non-playable media, show the full grid with filtering
    if (media.length > playableMedia.length) {
        return (
            <div className={`space-y-4 ${className}`}>
                <h3 className="text-xl font-semibold">Media Collection ({media.length})</h3>
                <UnifiedMediaGrid
                    media={media}
                    viewMode={viewMode}
                    showPreview={showPreview}
                    showPlayButton={showPlayButton}
                    showAddToQueue={showAddToQueue}
                    showDownloadButton={showDownloadButton}
                    showMetadata={showMetadata}
                    enableSearch={enableSearch}
                    enableFilters={enableFilters}
                    emptyStateMessage="Inga mediafiler tillgängliga."
                    className="mt-4"
                />
            </div>
        );
    }

    // If only playable media, use a more focused view
    return (
        <div className={`space-y-4 ${className}`}>
            <h3 className="text-xl font-semibold">Media ({playableMedia.length})</h3>
            <UnifiedMediaGrid
                media={playableMedia}
                viewMode={viewMode}
                showPreview={showPreview}
                showPlayButton={showPlayButton}
                showAddToQueue={showAddToQueue}
                showDownloadButton={showDownloadButton}
                showMetadata={showMetadata}
                enableSearch={enableSearch}
                enableFilters={enableFilters}
                emptyStateMessage="Inga spelbara mediafiler tillgängliga."
                className="mt-4"
            />
        </div>
    );
};

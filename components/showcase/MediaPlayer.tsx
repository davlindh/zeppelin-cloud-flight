import React, { useState } from 'react';
import ReactPlayer from 'react-player';

interface MediaPlayerProps {
    media: {
        primaryVideo?: {
            type: 'youtube' | 'vimeo' | 'external';
            url: string;
            title?: string;
            thumbnail?: string;
        };
        gallery?: Array<{
            type: 'video' | 'image';
            url: string;
            title?: string;
        }>;
    };
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ media }) => {
    const [currentVideoUrl, setCurrentVideoUrl] = useState(media.primaryVideo?.url || '');
    const [playing, setPlaying] = useState(false);

    if (!media.primaryVideo && (!media.gallery || media.gallery.length === 0)) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Primary Video Player */}
            {media.primaryVideo && (
                <div className="space-y-4">
                    {media.primaryVideo.title && (
                        <h3 className="text-xl font-semibold text-gray-800">
                            {media.primaryVideo.title}
                        </h3>
                    )}
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                        <ReactPlayer
                            url={media.primaryVideo.url}
                            controls={true}
                            light={media.primaryVideo.thumbnail}
                            playing={playing}
                            width="100%"
                            height="100%"
                            onPlay={() => setPlaying(true)}
                            onPause={() => setPlaying(false)}
                            config={{
                                youtube: {
                                    playerVars: {
                                        modestbranding: 1,
                                        rel: 0,
                                        controls: 1
                                    }
                                },
                                vimeo: {
                                    playerOptions: {
                                        responsive: true,
                                        byline: false,
                                        portrait: false
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Media Gallery */}
            {media.gallery && media.gallery.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Media Gallery</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {media.gallery.map((item, index) => (
                            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                                {item.type === 'video' ? (
                                    <div
                                        className="aspect-video bg-black cursor-pointer"
                                        onClick={() => {
                                            setCurrentVideoUrl(item.url);
                                            setPlaying(true);
                                        }}
                                    >
                                        <ReactPlayer
                                            url={item.url}
                                            light={true}
                                            controls={false}
                                            width="100%"
                                            height="100%"
                                            config={{}}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z"/>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <img
                                        src={item.url}
                                        alt={item.title || 'Gallery image'}
                                        className="w-full h-48 object-cover"
                                        loading="lazy"
                                    />
                                )}
                                {item.title && (
                                    <div className="p-3">
                                        <p className="text-sm text-gray-600 font-medium">{item.title}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

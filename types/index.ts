export interface ShowcaseCard {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    fullDescription?: string;
    participants?: Array<{
        name: string;
        role: string;
        bio?: string;
        avatar?: string;
    }>;
    links?: Array<{
        type: 'github' | 'website' | 'demo' | 'other';
        url: string;
    }>;
    tags?: string[];
    media?: {
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
    schedule?: {
        date?: string;
        time?: string;
        duration?: string;
        status?: 'upcoming' | 'live' | 'past' | 'archived';
    };
}

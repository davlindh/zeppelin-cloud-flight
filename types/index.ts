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
<<<<<<< HEAD
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
=======
    
    // Enhanced project data
    purpose?: string;
    budget?: {
        amount?: number;
        currency?: string;
        breakdown?: Array<{ item: string; cost: number; }>;
    };
    timeline?: {
        startDate?: string;
        endDate?: string;
        milestones?: Array<{ date: string; title: string; description?: string; }>;
    };
    sponsors?: Array<{
        name: string;
        type: 'main' | 'partner' | 'supporter';
        logo?: string;
        website?: string;
    }>;
    media?: Array<{
        type: 'video' | 'audio' | 'image' | 'document';
        url: string;
        title: string;
        description?: string;
    }>;
    access?: {
        requirements?: string[];
        target_audience?: string;
        capacity?: number;
        registration_required?: boolean;
    };
    voting?: {
        enabled: boolean;
        categories?: Array<{ name: string; description?: string; }>;
        results?: Array<{ category: string; score: number; votes: number; }>;
    };
    associations?: string[];
    expected_impact?: string;
>>>>>>> 4dc5f388285ff86d21b56793b251252e8ffac00b
}

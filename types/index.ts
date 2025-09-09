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
}

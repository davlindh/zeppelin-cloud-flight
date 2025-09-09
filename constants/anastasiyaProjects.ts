// Additional projects for Anastasiya Loyko to test UI limits
import type { ShowcaseCard } from '../types/index';

export const ANASTASIYA_EXTRA_PROJECTS: ShowcaseCard[] = [
    {
        id: 'anastasiya-1',
        title: 'DIGITAL BORDERLANDS: VR EXHIBITION',
        description: 'En virtuell utställning som utforskar diaspora-identitet genom immersiva teknologier.',
        imageUrl: '/images/projects/placeholder-project.jpg',
        fullDescription: 'Digital Borderlands är en banbrytande VR-utställning som kombinerar fotogrammetri, AI-genererad konst och interaktiva berättelser för att utforska teman kring migration, identitet och tillhörighet.',
        tags: ['VR', 'AI Art', 'Diaspora', 'Interaktiv'],
        media: [
            { type: 'video', url: 'https://vimeo.com/digital-borderlands-trailer', title: 'VR Exhibition Trailer', description: 'Immersiv trailer som visar utställningens höjdpunkter' },
            { type: 'audio', url: 'https://soundcloud.com/borderlands-soundscape', title: 'Digital Borderlands Soundscape', description: 'Ambient ljud från VR-upplevelsen' },
            { type: 'document', url: 'https://example.com/vr-technical-specs.pdf', title: 'Tekniska specifikationer', description: 'Detaljerad teknisk dokumentation av VR-systemet' }
        ],
        participants: [
            {
                name: 'Anastasiya Loyko',
                role: 'Lead Artist & Technical Director',
                bio: 'Huvudkonstnär och teknisk ansvarig för hela VR-upplevelsen.',
            }
        ],
        links: [
            { type: 'demo', url: 'https://borderlands-vr.com/demo' },
            { type: 'website', url: 'https://digital-borderlands.art' }
        ]
    },
    {
        id: 'anastasiya-2', 
        title: 'NFT COLLECTION: FRAGMENTS OF HOME',
        description: 'En emotionell NFT-samling som dokumenterar förlorade platser och minnen från Ukraina.',
        imageUrl: '/images/projects/placeholder-project.jpg',
        fullDescription: 'Fragments of Home är en känslosam NFT-kollektion på 100 verk som dokumenterar förlorade platser, byggnader och landskap från Ukraina genom digital konst och fotomanipulation.',
        tags: ['NFT', 'Blockchain', 'Memory', 'Ukraine'],
        media: [
            { type: 'video', url: 'https://opensea.io/fragments-of-home/preview', title: 'NFT Collection Preview', description: 'Visuell genomgång av alla 100 NFT-verk' },
            { type: 'document', url: 'https://example.com/nft-whitepaper.pdf', title: 'Project Whitepaper', description: 'Konceptuell och teknisk beskrivning av projektet' },
            { type: 'image', url: '/images/projects/fragments-gallery.jpg', title: 'Fragments Gallery', description: 'Kurerat urval av de mest populära verken' }
        ],
        participants: [
            {
                name: 'Anastasiya Loyko',
                role: 'Artist & Blockchain Curator',
                bio: 'Skapare av hela NFT-kollektionen och expert på blockchain-baserad konstdistribution.',
            }
        ],
        links: [
            { type: 'website', url: 'https://opensea.io/fragments-of-home' },
            { type: 'other', url: 'https://foundation.app/anastasiya-loyko' }
        ]
    },
    {
        id: 'anastasiya-3',
        title: 'INTERACTIVE MEDIA WALL: STOCKHOLM CITY',
        description: 'Permanent installation på Arlanda Airport som reagerar på passagerarnas rörelser.',
        imageUrl: '/images/projects/placeholder-project.jpg', 
        fullDescription: 'En 15 meter bred interaktiv medievägg installerad på Arlanda Airport som använder motion tracking och AI för att skapa dynamiska visuella berättelser baserade på resenärernas rörelser.',
        tags: ['Interactive', 'Public Art', 'AI', 'Motion Tracking'],
        media: [
            { type: 'video', url: 'https://arlanda.se/media-wall-demo', title: 'Live Installation Footage', description: 'Realtidsfilmning av resenärer som interagerar med väggen' },
            { type: 'audio', url: 'https://soundcloud.com/arlanda-installation', title: 'Interactive Sound Design', description: 'Adaptiva ljudlandskap som förändras med rörelserna' },
            { type: 'image', url: '/images/projects/arlanda-technical-drawings.jpg', title: 'Technical Drawings', description: 'Arkitektoniska ritningar och teknisk planering' },
            { type: 'document', url: 'https://example.com/arlanda-case-study.pdf', title: 'Arlanda Case Study', description: 'Fullständig dokumentation av projektet från koncept till installation' }
        ],
        participants: [
            {
                name: 'Anastasiya Loyko',
                role: 'Interaction Designer & Visual Artist',
                bio: 'Ansvarig för interaktionsdesign och alla visuella element i installationen.',
            }
        ],
        links: [
            { type: 'demo', url: 'https://arlanda.se/interactive-wall' },
            { type: 'website', url: 'https://stockholm-city-art.se/arlanda-project' },
            { type: 'other', url: 'https://linkedin.com/in/anastasiya-loyko' }
        ]
    }
];
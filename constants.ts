
import type { ShowcaseCard } from './types/index';

export const NAV_LINKS = [
    { href: '#vision', label: 'Vision' },
    { href: '#systematik', label: 'Systematik' },
    { href: '#showcase', label: 'Showcase' },
    { href: '#partner', label: 'Partners' },
];

export const INITIAL_CARDS: ShowcaseCard[] = [
    {
        id: '1',
        title: 'KRESS & ROBOT WORKSHOP',
        description: 'Utforska automation som ett konstnärligt verktyg, från simulering på BTH till storskaliga landskapskonstverk med Kress-robotar.',
        imageUrl: 'https://picsum.photos/seed/robotics/600/400',
    },
    {
        id: '2',
        title: 'STENHUGGERI & HANTVERK',
        description: 'Förankra ditt skapande i regionens materiella kultur. Lär dig traditionella tekniker som stenhuggeri, smide och keramik av lokala mästare.',
        imageUrl: 'https://picsum.photos/seed/crafts/600/400',
    },
    {
        id: '3',
        title: 'DRÖNARSHOW: TREE OF LIGHT',
        description: 'En spektakulär ljusshow över skärgården som symboliserar projektets syntes och evolution – en oförglömlig final.',
        imageUrl: 'https://picsum.photos/seed/droneshow/600/400',
    },
];

import type { ShowcaseCard } from '../types/index';
import { ANASTASIYA_EXTRA_PROJECTS } from './anastasiyaProjects';
import { buildShowcaseCards } from '../src/data/builders';

export const NAV_LINKS = [
    { href: '#vision', label: 'Vision' },
    { href: '#systematik', label: 'Systematik' },
    { href: '/showcase', label: 'Showcase' },
    { href: '/participants', label: 'Deltagare' },
    { href: '#partner', label: 'Partners' },
];

// Build showcase cards from normalized data
export const INITIAL_CARDS: ShowcaseCard[] = buildShowcaseCards();

import { ANASTASIYA_EXTRA_PROJECTS } from './anastasiyaProjects';
import { buildShowcaseCards } from '../src/data/builders';

export const NAV_LINKS = [
    { href: '#vision', label: 'Vision' },
    { href: '#systematik', label: 'Systematik' },
    { href: '#engagement', label: 'Engagemang' },
    { href: '#partner', label: 'Partner' },
    { href: '/showcase', label: 'Showcase' },
    { href: '/participants', label: 'Deltagare' },
    { href: '/partners', label: 'Partners' },
];

// Build showcase cards from normalized data
export const INITIAL_CARDS = buildShowcaseCards();

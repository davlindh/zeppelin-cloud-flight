// Unified design tokens for the reputation system

export const REPUTATION_LEVELS = {
  seed: { 
    threshold: 0, 
    icon: '🌱', 
    label: 'Seed',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    nextLevel: 'sprout',
    nextThreshold: 50
  },
  sprout: { 
    threshold: 50, 
    icon: '🌿', 
    label: 'Sprout',
    color: 'bg-green-100 text-green-700 border-green-300',
    nextLevel: 'bloom',
    nextThreshold: 150
  },
  bloom: { 
    threshold: 150, 
    icon: '🌸', 
    label: 'Bloom',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    nextLevel: 'tree',
    nextThreshold: 300
  },
  tree: { 
    threshold: 300, 
    icon: '🌳', 
    label: 'Tree',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    nextLevel: 'forest',
    nextThreshold: 500
  },
  forest: { 
    threshold: 500, 
    icon: '🌲', 
    label: 'Forest',
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    nextLevel: null,
    nextThreshold: null
  },
} as const;

export type ReputationLevel = keyof typeof REPUTATION_LEVELS;

export const BADGE_SIZES = {
  sm: { 
    text: 'text-xs', 
    padding: 'px-2 py-0.5', 
    icon: 'h-3 w-3',
    height: 'h-6'
  },
  md: { 
    text: 'text-sm', 
    padding: 'px-3 py-1', 
    icon: 'h-4 w-4',
    height: 'h-8'
  },
  lg: { 
    text: 'text-base', 
    padding: 'px-4 py-1.5', 
    icon: 'h-5 w-5',
    height: 'h-10'
  },
} as const;

export type BadgeSize = keyof typeof BADGE_SIZES;

export const ACHIEVEMENT_CATEGORIES = {
  score: { label: 'Score Milestones', icon: 'trophy' },
  donation: { label: 'Donations', icon: 'heart' },
  events: { label: 'Event Attendance', icon: 'calendar' },
  engagement: { label: 'Community Engagement', icon: 'users' },
} as const;

export type AchievementCategory = keyof typeof ACHIEVEMENT_CATEGORIES;

// Helper functions
export function getLevelConfig(level: string) {
  return REPUTATION_LEVELS[level as ReputationLevel] || REPUTATION_LEVELS.seed;
}

export function getNextLevelThreshold(currentScore: number, currentLevel: string): number {
  const config = getLevelConfig(currentLevel);
  return config.nextThreshold || config.threshold + 500;
}

export function calculateProgressToNextLevel(score: number, level: string): number {
  const config = getLevelConfig(level);
  const currentThreshold = config.threshold;
  const nextThreshold = config.nextThreshold || currentThreshold + 500;
  const progress = ((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

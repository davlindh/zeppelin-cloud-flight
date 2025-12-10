// Reputation System Components - Canonical exports
export { UserReputationBadge } from './UserReputationBadge';
export { UserReputationPanel } from './UserReputationPanel';
export { ReputationHistory } from './ReputationHistory';
export { AchievementBadge } from './AchievementBadge';
export { AchievementGrid } from './AchievementGrid';

// Design tokens and helpers
export * from './constants';

// Backwards-compatible aliases (deprecated - use new names)
export { UserReputationBadge as FaveScoreBadge } from './UserReputationBadge';
export { UserReputationPanel as EnhancedUserScore } from './UserReputationPanel';
export { ReputationHistory as ScoreHistory } from './ReputationHistory';

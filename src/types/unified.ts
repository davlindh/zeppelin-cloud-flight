// Unified type definitions - single source of truth for all data models
// This file consolidates all frontend interfaces to eliminate duplication

import type { MediaCategory, MediaType, BaseMediaItem, ParticipantMediaItem } from './media';

// ============= CORE CONTENT TYPES =============

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
}

// ============= PARTICIPANT TYPES =============

/**
 * Core participant interface - used for display and frontend logic
 * Combines database schema fields with computed frontend fields
 */
export interface Participant {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  website?: string;
  socialLinks?: Array<{ platform: string; url: string; }>;
  roles?: string[]; // Aggregated from projects
  projects?: Array<{
    id: string;
    title: string;
    role: string;
    imageUrl?: string;
  }>;
  media?: ParticipantMediaItem[];
  personalLinks?: Array<{
    type: string;
    url: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  
  // Enhanced participant fields from database
  skills?: string[];
  experienceLevel?: string;
  interests?: string[];
  timeCommitment?: string;
  contributions?: string[];
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  howFoundUs?: string;
  availability?: string;
}

/**
 * Legacy support - mapped to Participant for backwards compatibility
 * @deprecated Use Participant instead
 */
export type ParticipantWithMedia = Participant;

/**
 * Legacy support - mapped to Participant for backwards compatibility  
 * @deprecated Use Participant instead
 */
export type ParticipantEntity = Participant;

// ============= PROJECT TYPES =============

export interface Project {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  imageUrl?: string;
  purpose?: string;
  expectedImpact?: string;
  associations?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ============= SPONSOR TYPES =============

export interface Sponsor {
  id: string;
  name: string;
  type: 'main' | 'partner' | 'supporter';
  logo?: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============= RELATIONSHIP TYPES =============

export interface ProjectParticipant {
  id: string;
  projectId: string;
  participantId: string;
  role: string;
  createdAt?: string;
}

export interface ProjectSponsor {
  id: string;
  projectId: string;
  sponsorId: string;
  createdAt?: string;
}

export interface ProjectLink {
  id: string;
  projectId: string;
  type: 'github' | 'website' | 'demo' | 'other';
  url: string;
  createdAt?: string;
}

export interface ProjectTag {
  id: string;
  projectId: string;
  tag: string;
  createdAt?: string;
}

export interface ProjectMedia {
  id: string;
  projectId: string;
  type: MediaType;
  url: string;
  title: string;
  description?: string;
  createdAt?: string;
}

export interface ProjectBudget {
  id: string;
  projectId: string;
  amount?: number;
  currency?: string;
  breakdown?: Array<{ item: string; cost: number; }>;
  createdAt?: string;
}

export interface ProjectTimeline {
  id: string;
  projectId: string;
  startDate?: string;
  endDate?: string;
  milestones?: Array<{ date: string; title: string; description?: string; }>;
  createdAt?: string;
}

export interface ProjectAccess {
  id: string;
  projectId: string;
  requirements?: string[];
  targetAudience?: string;
  capacity?: number;
  registrationRequired?: boolean;
  createdAt?: string;
}

export interface ProjectVoting {
  id: string;
  projectId: string;
  enabled: boolean;
  categories?: Array<{ name: string; description?: string; }>;
  results?: Array<{ category: string; score: number; votes: number; }>;
  createdAt?: string;
}
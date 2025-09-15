import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useParticipants as useApiParticipants, useProjects as useApiProjects, useSponsors as useApiSponsors, useCreateProject, useUpdateProject } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/useApi';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import {
  Participant,
  Project,
  Sponsor,
  ParticipantFormData,
  ProjectFormData,
  SponsorFormData,
  BaseEntity
} from '@/types/admin';

// Enhanced admin permissions
export interface AdminPermissions {
  canCreateParticipant: boolean;
  canEditParticipant: boolean;
  canDeleteParticipant: boolean;
  canCreateProject: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;
  canCreateSponsor: boolean;
  canEditSponsor: boolean;
  canDeleteSponsor: boolean;
  canAccessAnalytics: boolean;
  canProcessSubmissions: boolean;
  canManageSettings: boolean;
}

// Entity state management
export interface EntityState<T extends BaseEntity> {
  data: T[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface EntityMap {
  participants: EntityState<Participant>;
  projects: EntityState<Project>;
  sponsors: EntityState<Sponsor>;
}

// Loading states
export interface LoadingState {
  participants: boolean;
  projects: boolean;
  sponsors: boolean;
  submissions: boolean;
  analytics: boolean;
}

// Admin actions
export interface AdminActions {
  // Participant actions
  createParticipant: (data: ParticipantFormData) => Promise<{ success: boolean; error?: string }>;
  updateParticipant: (id: string, data: Partial<ParticipantFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteParticipant: (id: string) => Promise<{ success: boolean; error?: string }>;
  fetchParticipants: () => Promise<void>;

  // Project actions
  createProject: (data: ProjectFormData) => Promise<{ success: boolean; error?: string }>;
  updateProject: (id: string, data: Partial<ProjectFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteProject: (id: string) => Promise<{ success: boolean; error?: string }>;
  fetchProjects: () => Promise<void>;

  // Sponsor actions
  createSponsor: (data: SponsorFormData) => Promise<{ success: boolean; error?: string }>;
  updateSponsor: (id: string, data: Partial<SponsorFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteSponsor: (id: string) => Promise<{ success: boolean; error?: string }>;
  fetchSponsors: () => Promise<void>;
}

// Admin UI state
export interface AdminUI {
  activeTab: string;
  selectedItems: string[];
  filters: Record<string, unknown>;
  searchQuery: string;
  pagination: {
    page: number;
    limit: number;
  };
}

// Complete admin context
export interface AdminContextValue {
  // Auth state (inherited from AdminAuthContext)
  isAdmin: boolean;
  adminEmail: string | null;
  user: unknown;
  session: unknown;

  // Enhanced permissions
  permissions: AdminPermissions;

  // Data management
  entities: EntityMap;
  loading: LoadingState;
  actions: AdminActions;

  // UI state
  ui: AdminUI;
  updateUI: (updates: Partial<AdminUI>) => void;

  // Utility functions
  refreshData: () => Promise<void>;
  clearErrors: () => void;
}

// Action types for reducer
type AdminAction =
  | { type: 'SET_LOADING'; entity: keyof LoadingState; loading: boolean }
  | { type: 'SET_ERROR'; entity: keyof EntityMap; error: string | null }
  | { type: 'SET_ENTITY_DATA'; entity: keyof EntityMap; data: unknown[] }
  | { type: 'ADD_ENTITY'; entity: keyof EntityMap; item: unknown }
  | { type: 'UPDATE_ENTITY'; entity: keyof EntityMap; id: string; item: unknown }
  | { type: 'DELETE_ENTITY'; entity: keyof EntityMap; id: string }
  | { type: 'UPDATE_UI'; updates: Partial<AdminUI> };

// Initial state
const initialEntityState = <T extends BaseEntity>(): EntityState<T> => ({
  data: [],
  loading: false,
  error: null,
  lastUpdated: null,
});

const initialState = {
  entities: {
    participants: initialEntityState<Participant>(),
    projects: initialEntityState<Project>(),
    sponsors: initialEntityState<Sponsor>(),
  },
  loading: {
    participants: false,
    projects: false,
    sponsors: false,
    submissions: false,
    analytics: false,
  },
  ui: {
    activeTab: 'overview',
    selectedItems: [],
    filters: {},
    searchQuery: '',
    pagination: {
      page: 1,
      limit: 20,
    },
  },
};

// Reducer for state management
const adminReducer = (state: typeof initialState, action: AdminAction) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.entity]: action.loading,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.entity]: {
            ...state.entities[action.entity],
            error: action.error,
            loading: false,
          },
        },
      };

    case 'SET_ENTITY_DATA':
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.entity]: {
            ...state.entities[action.entity],
            data: action.data,
            loading: false,
            error: null,
            lastUpdated: new Date(),
          },
        },
      };

    case 'ADD_ENTITY':
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.entity]: {
            ...state.entities[action.entity],
            data: [...state.entities[action.entity].data, action.item],
          },
        },
      };

    case 'UPDATE_ENTITY':
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.entity]: {
            ...state.entities[action.entity],
            data: state.entities[action.entity].data.map(item =>
              item.id === action.id ? { ...item, ...(action.item as Partial<BaseEntity>) } : item
            ),
          },
        },
      };

    case 'DELETE_ENTITY':
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.entity]: {
            ...state.entities[action.entity],
            data: state.entities[action.entity].data.filter(item => item.id !== action.id),
          },
        },
      };

    case 'UPDATE_UI':
      return {
        ...state,
        ui: {
          ...state.ui,
          ...action.updates,
        },
      };

    default:
      return state;
  }
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { isAdmin, adminEmail, user, session } = useAdminAuth();
  const { toast } = useToast();

  const success = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
    });
  }, [toast]);

  const showError = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  }, [toast]);
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Enhanced permissions based on admin status
  const permissions: AdminPermissions = {
    canCreateParticipant: isAdmin,
    canEditParticipant: isAdmin,
    canDeleteParticipant: isAdmin,
    canCreateProject: isAdmin,
    canEditProject: isAdmin,
    canDeleteProject: isAdmin,
    canCreateSponsor: isAdmin,
    canEditSponsor: isAdmin,
    canDeleteSponsor: isAdmin,
    canAccessAnalytics: isAdmin,
    canProcessSubmissions: isAdmin,
    canManageSettings: isAdmin,
  };

  // UI state management
  const updateUI = useCallback((updates: Partial<AdminUI>) => {
    dispatch({ type: 'UPDATE_UI', updates });
  }, []);

  // Data fetching functions
  const fetchParticipants = useCallback(async () => {
    if (!isAdmin) return;

    dispatch({ type: 'SET_LOADING', entity: 'participants', loading: true });

    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      dispatch({ type: 'SET_ENTITY_DATA', entity: 'participants', data: data || [] });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch participants';
      dispatch({ type: 'SET_ERROR', entity: 'participants', error: errorMessage });
      showError('Failed to Load Participants', errorMessage);
    }
  }, [isAdmin, showError]);

  const fetchProjects = useCallback(async () => {
    if (!isAdmin) return;

    dispatch({ type: 'SET_LOADING', entity: 'projects', loading: true });

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      dispatch({ type: 'SET_ENTITY_DATA', entity: 'projects', data: data || [] });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      dispatch({ type: 'SET_ERROR', entity: 'projects', error: errorMessage });
      showError('Failed to Load Projects', errorMessage);
    }
  }, [isAdmin, showError]);

  const fetchSponsors = useCallback(async () => {
    if (!isAdmin) return;

    dispatch({ type: 'SET_LOADING', entity: 'sponsors', loading: true });

    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      dispatch({ type: 'SET_ENTITY_DATA', entity: 'sponsors', data: data || [] });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sponsors';
      dispatch({ type: 'SET_ERROR', entity: 'sponsors', error: errorMessage });
      showError('Failed to Load Sponsors', errorMessage);
    }
  }, [isAdmin, showError]);

  // CRUD operations for participants - using TanStack Query mutations
  const createParticipant = useCallback(async (data: ParticipantFormData) => {
    try {
      // Transform form data to match API expectations
      const apiData = {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        bio: data.bio,
        avatar_path: data.avatar_path,
        website: data.website,
        social_links: data.social_links || [],
        skills: data.skills || [],
        experience_level: data.experience_level,
        interests: data.interests || [],
        time_commitment: data.time_commitment,
        contributions: data.contributions || [],
        location: data.location,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        how_found_us: data.how_found_us,
        availability: data.availability
      };

      // Use TanStack Query mutation
      const result = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });

      if (!result.ok) throw new Error('Failed to create participant');

      const newParticipant = await result.json();
      dispatch({ type: 'ADD_ENTITY', entity: 'participants', item: newParticipant });
      success('Participant Created', `${data.name} has been added successfully`);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create participant';
      showError('Creation Failed', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [success, showError]);

  const updateParticipant = useCallback(async (id: string, data: Partial<ParticipantFormData>) => {
    try {
      // Convert social_links array to Json for database
      const dbData = {
        ...data,
        social_links: data.social_links ? data.social_links as unknown as Json : undefined
      };

      const { data: result, error } = await supabase
        .from('participants')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_ENTITY', entity: 'participants', id, item: result });
      success('Participant Updated', 'Changes have been saved successfully');

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update participant';
      showError('Update Failed', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [success, showError]);

  const deleteParticipant = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      dispatch({ type: 'DELETE_ENTITY', entity: 'participants', id });
      success('Participant Deleted', 'Participant has been removed successfully');

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete participant';
      showError('Deletion Failed', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [success, showError]);

  // CRUD operations for projects
  const createProject = useCallback(async (data: ProjectFormData) => {
    try {
      // Transform form data to match database schema
      const dbData = {
        ...data,
        associations: data.associations ? [data.associations] : [], // Convert string to string[]
        slug: data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      };

      const { data: result, error } = await supabase
        .from('projects')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_ENTITY', entity: 'projects', item: result });
      success('Project Created', `${data.title} has been added successfully`);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      showError('Creation Failed', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [success, showError]);

  const updateProject = useCallback(async (id: string, data: Partial<ProjectFormData>) => {
    try {
      // Transform form data to match database schema
      const dbData = {
        ...data,
        associations: data.associations ? [data.associations] : undefined // Convert string to string[]
      };

      const { data: result, error } = await supabase
        .from('projects')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_ENTITY', entity: 'projects', id, item: result });
      success('Project Updated', 'Changes have been saved successfully');

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      showError('Update Failed', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [success, showError]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      dispatch({ type: 'DELETE_ENTITY', entity: 'projects', id });
      success('Project Deleted', 'Project has been removed successfully');

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      showError('Deletion Failed', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [success, showError]);

  // CRUD operations for sponsors
  const createSponsor = useCallback(async (data: SponsorFormData) => {
    try {
      const { data: result, error } = await supabase
        .from('sponsors')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_ENTITY', entity: 'sponsors', item: result });
      success('Sponsor Created', `${data.name} has been added successfully`);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create sponsor';
      showError('Creation Failed', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [success, showError]);

  const updateSponsor = useCallback(async (id: string, data: Partial<SponsorFormData>) => {
    try {
      const { data: result, error } = await supabase
        .from('sponsors')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_ENTITY', entity: 'sponsors', id, item: result });
      success('Sponsor Updated', 'Changes have been saved successfully');

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update sponsor';
      showError('Update Failed', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [success, showError]);

  const deleteSponsor = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      dispatch({ type: 'DELETE_ENTITY', entity: 'sponsors', id });
      success('Sponsor Deleted', 'Sponsor has been removed successfully');

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete sponsor';
      showError('Deletion Failed', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [success, showError]);

  // Actions object
  const actions: AdminActions = {
    createParticipant,
    updateParticipant,
    deleteParticipant,
    fetchParticipants,
    createProject,
    updateProject,
    deleteProject,
    fetchProjects,
    createSponsor,
    updateSponsor,
    deleteSponsor,
    fetchSponsors,
  };

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchParticipants(),
      fetchProjects(),
      fetchSponsors(),
    ]);
  }, [fetchParticipants, fetchProjects, fetchSponsors]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    dispatch({ type: 'SET_ERROR', entity: 'participants', error: null });
    dispatch({ type: 'SET_ERROR', entity: 'projects', error: null });
    dispatch({ type: 'SET_ERROR', entity: 'sponsors', error: null });
  }, []);

  // Load initial data when admin status changes
  useEffect(() => {
    if (isAdmin) {
      refreshData();
    }
  }, [isAdmin, refreshData]);

  const value: AdminContextValue = {
    // Auth state
    isAdmin,
    adminEmail,
    user,
    session,

    // Enhanced permissions
    permissions,

    // Data management
    entities: state.entities,
    loading: state.loading,
    actions,

    // UI state
    ui: state.ui,
    updateUI,

    // Utility functions
    refreshData,
    clearErrors,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

// Hook to use admin context
export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
};

// Specialized hooks for different entities
export const useParticipants = () => {
  const { entities, loading, actions } = useAdminContext();

  return {
    participants: entities.participants.data,
    isLoading: loading.participants,
    error: entities.participants.error,
    createParticipant: actions.createParticipant,
    updateParticipant: actions.updateParticipant,
    deleteParticipant: actions.deleteParticipant,
    fetchParticipants: actions.fetchParticipants,
  };
};

export const useProjects = () => {
  const { entities, loading, actions } = useAdminContext();

  return {
    projects: entities.projects.data,
    isLoading: loading.projects,
    error: entities.projects.error,
    createProject: actions.createProject,
    updateProject: actions.updateProject,
    deleteProject: actions.deleteProject,
    fetchProjects: actions.fetchProjects,
  };
};

export const useSponsors = () => {
  const { entities, loading, actions } = useAdminContext();

  return {
    sponsors: entities.sponsors.data,
    isLoading: loading.sponsors,
    error: entities.sponsors.error,
    createSponsor: actions.createSponsor,
    updateSponsor: actions.updateSponsor,
    deleteSponsor: actions.deleteSponsor,
    fetchSponsors: actions.fetchSponsors,
  };
};

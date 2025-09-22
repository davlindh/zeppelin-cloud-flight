import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useParticipants, useProjects, useSponsors } from '@/hooks/useApi';

// Home page state management
export interface HomePageStats {
  totalParticipants: number;
  totalProjects: number;
  totalPartners: number;
  upcomingEvents: number;
}

export interface HomePageSection {
  id: string;
  title: string;
  content: string;
  isVisible: boolean;
  order: number;
}

export interface HomePageState {
  stats: HomePageStats;
  sections: HomePageSection[];
  loading: boolean;
  error: string | null;
  currentSection: string;
  scrollPosition: number;
}

// Actions for reducer
type HomePageAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_STATS'; stats: HomePageStats }
  | { type: 'SET_SECTIONS'; sections: HomePageSection[] }
  | { type: 'UPDATE_SECTION_VISIBILITY'; sectionId: string; isVisible: boolean }
  | { type: 'SET_CURRENT_SECTION'; sectionId: string }
  | { type: 'SET_SCROLL_POSITION'; position: number };

// Initial state
const initialState: HomePageState = {
  stats: {
    totalParticipants: 0,
    totalProjects: 0,
    totalPartners: 0,
    upcomingEvents: 0,
  },
  sections: [
    {
      id: 'hero',
      title: '🏠 Start',
      content: 'Welcome to Zeppel Inn',
      isVisible: true,
      order: 1,
    },
    {
      id: 'media-upload',
      title: '📸 Dela Upplevelser',
      content: 'Share your experiences',
      isVisible: true,
      order: 2,
    },
    {
      id: 'partner',
      title: '🤝 Våra Partners',
      content: 'Our partners',
      isVisible: true,
      order: 3,
    },
    {
      id: 'engagement',
      title: '💫 Bli Delaktig',
      content: 'Get involved',
      isVisible: true,
      order: 4,
    },
    {
      id: 'vision',
      title: '🌟 Vår Vision',
      content: 'Our vision for Karlskrona',
      isVisible: true,
      order: 5,
    },
    {
      id: 'systematics',
      title: '🔄 Resan från tanke till transformation',
      content: 'Our methodology',
      isVisible: true,
      order: 6,
    },
  ],
  loading: false,
  error: null,
  currentSection: 'hero',
  scrollPosition: 0,
};

// Reducer for state management
const homePageReducer = (state: HomePageState, action: HomePageAction): HomePageState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.loading,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        loading: false,
      };

    case 'SET_STATS':
      return {
        ...state,
        stats: action.stats,
        loading: false,
      };

    case 'SET_SECTIONS':
      return {
        ...state,
        sections: action.sections,
      };

    case 'UPDATE_SECTION_VISIBILITY':
      return {
        ...state,
        sections: state.sections.map(section =>
          section.id === action.sectionId
            ? { ...section, isVisible: action.isVisible }
            : section
        ),
      };

    case 'SET_CURRENT_SECTION':
      return {
        ...state,
        currentSection: action.sectionId,
      };

    case 'SET_SCROLL_POSITION':
      return {
        ...state,
        scrollPosition: action.position,
      };

    default:
      return state;
  }
};

export interface HomePageContextValue {
  state: HomePageState;
  actions: {
    loadStats: () => Promise<void>;
    updateSectionVisibility: (sectionId: string, isVisible: boolean) => void;
    setCurrentSection: (sectionId: string) => void;
    updateScrollPosition: (position: number) => void;
    refreshData: () => Promise<void>;
  };
}

const HomePageContext = createContext<HomePageContextValue | undefined>(undefined);

export interface HomePageProviderProps {
  children: React.ReactNode;
}

export const HomePageProvider: React.FC<HomePageProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(homePageReducer, initialState);
  const { toast } = useToast();

  // Use TanStack Query hooks for data fetching
  const { data: participants, isLoading: participantsLoading, error: participantsError } = useParticipants();
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { data: sponsors, isLoading: sponsorsLoading, error: sponsorsError } = useSponsors();

  // Calculate statistics from fetched data
  const stats: HomePageStats = useMemo(() => ({
    totalParticipants: participants?.length || 0,
    totalProjects: projects?.length || 0,
    totalPartners: sponsors?.length || 0,
    upcomingEvents: 1, // Static for now, could be dynamic
  }), [participants, projects, sponsors]);

  // Update state when data changes
  useEffect(() => {
    if (participants || projects || sponsors) {
      dispatch({ type: 'SET_STATS', stats });
    }
  }, [stats, participants, projects, sponsors]);

  // Handle loading state
  const isLoading = participantsLoading || projectsLoading || sponsorsLoading;
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', loading: isLoading });
  }, [isLoading]);

  // Handle errors
  useEffect(() => {
    const error = participantsError || projectsError || sponsorsError;
    if (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load statistics';
      dispatch({ type: 'SET_ERROR', error: errorMessage });

      toast({
        title: 'Error Loading Statistics',
        description: errorMessage,
        variant: 'destructive',
      });
    } else {
      dispatch({ type: 'SET_ERROR', error: null });
    }
  }, [participantsError, projectsError, sponsorsError, toast]);

  // Load statistics from Supabase (now just a placeholder for compatibility)
  const loadStats = useCallback(async () => {
    // Data is now automatically loaded by TanStack Query hooks
    // This function is kept for compatibility with existing code
  }, []);

  // Update section visibility
  const updateSectionVisibility = useCallback((sectionId: string, isVisible: boolean) => {
    dispatch({ type: 'UPDATE_SECTION_VISIBILITY', sectionId, isVisible });
  }, []);

  // Set current section
  const setCurrentSection = useCallback((sectionId: string) => {
    dispatch({ type: 'SET_CURRENT_SECTION', sectionId });
  }, []);

  // Update scroll position
  const updateScrollPosition = useCallback((position: number) => {
    dispatch({ type: 'SET_SCROLL_POSITION', position });
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await loadStats();
  }, [loadStats]);

  // Load initial data
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Handle scroll position updates
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      updateScrollPosition(position);

      // Update current section based on scroll position
      const sections = state.sections.filter(s => s.isVisible);
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setCurrentSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [state.sections, updateScrollPosition, setCurrentSection]);

  const value: HomePageContextValue = {
    state,
    actions: {
      loadStats,
      updateSectionVisibility,
      setCurrentSection,
      updateScrollPosition,
      refreshData,
    },
  };

  return (
    <HomePageContext.Provider value={value}>
      {children}
    </HomePageContext.Provider>
  );
};

// Hook to use home page context
export const useHomePage = () => {
  const context = useContext(HomePageContext);
  if (!context) {
    throw new Error('useHomePage must be used within a HomePageProvider');
  }
  return context;
};

// Specialized hooks for home page features
export const useHomePageStats = () => {
  const { state } = useHomePage();
  return state.stats;
};

export const useHomePageSections = () => {
  const { state, actions } = useHomePage();

  return {
    sections: state.sections,
    currentSection: state.currentSection,
    updateSectionVisibility: actions.updateSectionVisibility,
    setCurrentSection: actions.setCurrentSection,
  };
};

export const useHomePageScroll = () => {
  const { state, actions } = useHomePage();

  return {
    scrollPosition: state.scrollPosition,
    updateScrollPosition: actions.updateScrollPosition,
  };
};

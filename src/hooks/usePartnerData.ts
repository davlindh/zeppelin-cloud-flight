import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Sponsor } from '@/types/unified';
import { SPONSOR_DATA } from '../../constants/data/sponsors';
import errorHandler from '../utils/errorHandler';

interface EnhancedPartner extends Sponsor {
  // Legacy fields for backward compatibility
  alt?: string;
  src?: string;
  tagline?: string;
  href?: string;
  // Enhanced fields
  description?: string;
  projects?: Array<{
    id: string;
    title: string;
    year: string;
  }>;
  partnershipHistory?: Array<{
    year: string;
    milestone: string;
    description?: string;
  }>;
  collaborationTypes?: string[];
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

interface DbSponsor {
  id: string;
  name: string;
  type: 'main' | 'partner' | 'supporter';
  logo_path?: string | null;
  website?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface DbSponsorWithProjects extends DbSponsor {
  project_sponsors?: Array<{
    projects: {
      id: string;
      title: string;
      created_at: string;
    };
  }>;
}

// Static partners as fallback
const staticPartners = SPONSOR_DATA.map(sponsor => ({
  id: sponsor.id,
  name: sponsor.name,
  type: sponsor.type,
  logo: sponsor.logo_path ? `/images/${sponsor.logo_path}` : undefined,
  website: sponsor.website,
  createdAt: sponsor.created_at,
  updatedAt: sponsor.updated_at,
  // Legacy fields for backward compatibility
  alt: sponsor.name,
  src: sponsor.logo_path ? `/images/${sponsor.logo_path}` : '',
  tagline: '',
  href: sponsor.website || '',
}));

// Transform function for database sponsors
const transformStaticSponsor = (sponsor: DbSponsor): EnhancedPartner => ({
  id: sponsor.id,
  name: sponsor.name,
  type: sponsor.type,
  logo: sponsor.logo_path ? `/images/${sponsor.logo_path}` : undefined,
  website: sponsor.website,
  createdAt: sponsor.created_at,
  updatedAt: sponsor.updated_at,
  // Legacy fields for backward compatibility
  alt: sponsor.name,
  src: sponsor.logo_path ? `/images/${sponsor.logo_path}` : '',
  tagline: '',
  href: sponsor.website || '',
});

// Main hook using TanStack Query
export const usePartnerData = ({ enhanced = false } = {}) => {
  // Query function defined inside the hook to follow React rules
  const fetchPartners = async (): Promise<EnhancedPartner[]> => {
    const query = enhanced
      ? `
          *,
          project_sponsors (
            projects (
              id,
              title,
              created_at
            )
          )
        `
      : '*';

    try {
      const { data: dbData, error: dbError } = await supabase
        .from('sponsors')
        .select(query)
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      if (!dbData || dbData.length === 0) {
        return staticPartners;
      }

      // Transform the data with proper type handling
      const transformedPartners: EnhancedPartner[] = (dbData as any[]).map((dbSponsor) => {
        const partner = transformStaticSponsor(dbSponsor);

        if (enhanced && dbSponsor.project_sponsors) {
          partner.projects = dbSponsor.project_sponsors.map((ps: any) => ({
            id: ps.projects.id,
            title: ps.projects.title,
            year: new Date(ps.projects.created_at).getFullYear().toString(),
          }));
          partner.description = 'Enhanced description';
          partner.partnershipHistory = [{ year: '2023', milestone: 'Became a partner' }];
          partner.collaborationTypes = ['Funding', 'Support'];
        }

        return partner;
      });

      return transformedPartners;
    } catch (error) {
      // For errors, attempt to handle them
      const result = errorHandler.handleError(error, {
        component: 'usePartnerData',
        action: 'fetching partner data',
        technicalDetails: { enhanced }
      });

      // If it's recoverable, let React Query handle the retry
      if (result.shouldRetry) {
        throw error;
      }

      // Otherwise, silently fall back to static data
      console.warn('[usePartnerData] Failed to fetch real data, using static fallback:', result.userMessage);
      return staticPartners;
    }
  };

  const {
    data: partners,
    isLoading: loading,
    error,
    refetch,
    isError
  } = useQuery<EnhancedPartner[]>({
    queryKey: ['partners', { enhanced }],
    queryFn: fetchPartners,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, err) => {
      // Don't retry on 4xx errors (client errors)
      if (err instanceof Error && 'status' in err) {
        const status = (err as Error & { status: number }).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 3;
    },
    // Keep using static data as fallback
    placeholderData: staticPartners,
  });

  // Handle errors and provide fallback
  const errorMessage = isError && error ? (error as Error).message : null;

  return {
    partners: partners || staticPartners,
    loading,
    error: errorMessage,
    refetch
  };
};

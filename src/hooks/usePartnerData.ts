import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Sponsor } from '@/types/unified';
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
  description?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_person?: string | null;
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

// Database-only - removed static fallback
const emptyPartners: EnhancedPartner[] = [];

// Transform function for database sponsors with normalized logo handling
const transformStaticSponsor = (sponsor: DbSponsor): EnhancedPartner => {
  // Normalize logo path - handle both full URLs and relative paths
  const logoUrl = sponsor.logo_path
    ? (sponsor.logo_path.startsWith('http') ? sponsor.logo_path : `/images/${sponsor.logo_path}`)
    : undefined;

  return {
    id: sponsor.id,
    name: sponsor.name,
    type: sponsor.type,
    logo: logoUrl,
    website: sponsor.website || undefined,
    description: sponsor.description || undefined,
    contactEmail: sponsor.contact_email || undefined,
    contactPhone: sponsor.contact_phone || undefined,
    contactPerson: sponsor.contact_person || undefined,
    created_at: sponsor.created_at || undefined,
    updated_at: sponsor.updated_at || undefined,
    // Legacy fields for backward compatibility
    alt: sponsor.name,
    src: logoUrl || '',
    tagline: '',
    href: sponsor.website || '',
  };
};

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
        return emptyPartners;
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
      console.warn('[usePartnerData] Failed to fetch real data, using empty array:', result.userMessage);
      return emptyPartners;
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
    // Keep using empty array as fallback
    placeholderData: emptyPartners,
  });

  // Handle errors and provide fallback
  const errorMessage = isError && error ? (error as Error).message : null;

  return {
    partners: partners || emptyPartners,
    loading,
    error: errorMessage,
    refetch
  };
};

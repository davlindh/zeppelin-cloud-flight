import { useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Sponsor } from '@/types/unified';
import { SPONSOR_DATA } from '../../constants/data/sponsors';
import { useDataFetcher } from './useDataFetcher';
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

const transformStaticSponsor = (staticSponsor: DbSponsor): EnhancedPartner => ({
  id: staticSponsor.id,
  name: staticSponsor.name,
  type: staticSponsor.type,
  logo: staticSponsor.logo_path ? `/images/${staticSponsor.logo_path}` : undefined,
  website: staticSponsor.website,
  createdAt: staticSponsor.created_at,
  updatedAt: staticSponsor.updated_at,
  // Legacy fields for backward compatibility with PartnersPage
  alt: staticSponsor.name,
  src: staticSponsor.logo_path ? `/images/${staticSponsor.logo_path}` : '',
  tagline: '',
  href: staticSponsor.website || '',
});

export const usePartnerData = ({ enhanced = false } = {}) => {
  // Memoize the static partners computation to prevent re-creation
  const staticPartners = useMemo(() => SPONSOR_DATA.map(transformStaticSponsor), []);

  const query = useMemo(() => enhanced
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
    : '*', [enhanced]);

  // Memoize the transform function to prevent re-creation and infinite loops
  const transformDataFn = useCallback(async (data: unknown) => {
    try {
      if (enhanced) {
        // When enhanced, data comes with joined project_sponsors
        const result = (data as DbSponsorWithProjects[]).map(dbSponsor => {
          const sponsor = transformStaticSponsor(dbSponsor);

          // Add projects from the joined data
          if (dbSponsor.project_sponsors && Array.isArray(dbSponsor.project_sponsors)) {
            sponsor.projects = dbSponsor.project_sponsors.map((ps) => ({
              id: ps.projects.id,
              title: ps.projects.title,
              year: new Date(ps.projects.created_at).getFullYear().toString(),
            }));
          }
          // Add additional enhanced fields
          sponsor.description = 'Enhanced description';
          sponsor.partnershipHistory = [{ year: '2023', milestone: 'Became a partner' }];
          sponsor.collaborationTypes = ['Funding', 'Support'];
          return sponsor;
        });
        return result;
      } else {
        // When not enhanced, simple transformation
        const result = (data as DbSponsor[]).map(transformStaticSponsor);
        return result;
      }
    } catch (error) {
      const errorResult = errorHandler.handleError(error, {
        component: 'usePartnerData',
        action: 'transforming partner data',
        technicalDetails: { enhanced, dataProvided: !!data }
      });
      return staticPartners;
    }
  }, [enhanced, staticPartners]);

  const { data: partners, loading, error, refetch } = useDataFetcher<EnhancedPartner, EnhancedPartner[]>({
    tableName: 'sponsors',
    query,
    staticFallback: staticPartners,
    transformData: transformDataFn,
  });

  return { partners: partners || staticPartners, loading, error, refetch };
};

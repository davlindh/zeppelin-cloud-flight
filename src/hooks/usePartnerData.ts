import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Sponsor } from '@/types/unified';
import { SPONSOR_DATA } from '../../constants/data/sponsors';
import { useDataFetcher } from './useDataFetcher';

interface EnhancedPartner extends Sponsor {
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

interface ProjectRow {
  projects: {
    id: string;
    title: string;
    created_at: string;
  };
}

const transformSponsor = async (dbSponsor: DbSponsor, enhanced: boolean): Promise<EnhancedPartner> => {
  const partner: EnhancedPartner = {
    id: dbSponsor.id,
    name: dbSponsor.name,
    type: (dbSponsor.type as 'main' | 'partner' | 'supporter'),
    logo: dbSponsor.logo_path ? `/images/${dbSponsor.logo_path}` : undefined,
    website: dbSponsor.website || undefined,
    createdAt: dbSponsor.created_at,
    updatedAt: dbSponsor.updated_at,
  };

  if (enhanced) {
    const { data: projectSponsors } = await supabase
      .from('project_sponsors')
      .select('projects(id, title, created_at)')
      .eq('sponsor_id', dbSponsor.id);

    partner.projects = (projectSponsors as ProjectRow[] | null | undefined)?.map((ps) => ({
      id: ps.projects.id,
      title: ps.projects.title,
      year: new Date(ps.projects.created_at).getFullYear().toString(),
    })) || [];
    
    partner.description = 'Enhanced description';
    partner.partnershipHistory = [{ year: '2023', milestone: 'Became a partner' }];
    partner.collaborationTypes = ['Funding', 'Support'];
  }

  return partner;
};

const transformStaticSponsor = (staticSponsor: DbSponsor): EnhancedPartner => ({
  id: staticSponsor.id,
  name: staticSponsor.name,
  type: staticSponsor.type,
  logo: staticSponsor.logo_path ? `/images/${staticSponsor.logo_path}` : undefined,
  website: staticSponsor.website,
  createdAt: staticSponsor.created_at,
  updatedAt: staticSponsor.updated_at,
});

export const usePartnerData = ({ enhanced = false } = {}) => {
  const staticPartners = useMemo(() => SPONSOR_DATA.map(transformStaticSponsor), []);

  const { data: partners, loading, error, refetch } = useDataFetcher<EnhancedPartner, EnhancedPartner[]>({
    tableName: 'sponsors',
    staticFallback: staticPartners,
    transformData: async (dbData) => {
      return Promise.all((dbData as unknown as DbSponsor[]).map(sponsor => transformSponsor(sponsor, enhanced)));
    },
  });

  return { partners, loading, error, refreshData: refetch };
};

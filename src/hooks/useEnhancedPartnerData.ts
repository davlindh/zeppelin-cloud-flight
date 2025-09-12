import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Sponsor } from '@/types/unified';
import { SPONSOR_DATA } from '../../constants/data/sponsors';

interface DatabaseSponsor {
  id: string;
  name: string;
  type: string;
  logo_path: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

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

// Transform database sponsor to enhanced partner format
const transformSponsor = async (dbSponsor: DatabaseSponsor): Promise<EnhancedPartner> => {
  // Get related projects
  const { data: projectSponsors } = await supabase
    .from('project_sponsors')
    .select(`
      projects(
        id,
        title,
        created_at
      )
    `)
    .eq('sponsor_id', dbSponsor.id);

  const projects = projectSponsors?.map((ps: any) => ({
    id: ps.projects.id,
    title: ps.projects.title,
    year: new Date(ps.projects.created_at).getFullYear().toString()
  })) || [];

  return {
    id: dbSponsor.id,
    name: dbSponsor.name,
    type: dbSponsor.type as 'main' | 'partner' | 'supporter',
    logo: dbSponsor.logo_path ? `/images/${dbSponsor.logo_path}` : undefined,
    website: dbSponsor.website || undefined,
    createdAt: dbSponsor.created_at,
    updatedAt: dbSponsor.updated_at,
    projects,
    description: getDefaultDescription(dbSponsor.name, dbSponsor.type),
    partnershipHistory: [{
      year: new Date(dbSponsor.created_at).getFullYear().toString(),
      milestone: 'Partnership began',
      description: `Started collaboration as ${getTypeLabel(dbSponsor.type)}`
    }],
    collaborationTypes: getCollaborationTypes(dbSponsor.type)
  };
};

// Transform static data to enhanced partner format
const transformStaticSponsor = (staticSponsor: any): EnhancedPartner => ({
  id: staticSponsor.id,
  name: staticSponsor.name,
  type: staticSponsor.type,
  logo: staticSponsor.logo_path ? `/images/${staticSponsor.logo_path}` : undefined,
  website: staticSponsor.website,
  createdAt: staticSponsor.created_at,
  updatedAt: staticSponsor.updated_at,
  projects: [],
  description: getDefaultDescription(staticSponsor.name, staticSponsor.type),
  partnershipHistory: [{
    year: new Date(staticSponsor.created_at).getFullYear().toString(),
    milestone: 'Partnership began',
    description: `Started collaboration as ${getTypeLabel(staticSponsor.type)}`
  }],
  collaborationTypes: getCollaborationTypes(staticSponsor.type)
});

const getDefaultDescription = (name: string, type: string): string => {
  const descriptions: { [key: string]: string } = {
    'Stenbräcka Kursgård': 'Erbjuder konstnärliga och tekniska miljöer i den vackra skärgården, perfekt för kreativa residens och workshops.',
    'Maskin & Fritid': 'Lokalt företag som tillhandahåller maskiner, verktyg och teknisk expertis för byggprojekt och kreativa installationer.',
    'Karlskrona Kommun': 'Kommunal partner som stödjer kulturella initiativ och regional utveckling genom finansiering och infrastruktur.',
    'Visit Blekinge': 'Regional turismorganisation som hjälper till att marknadsföra och utveckla kulturella upplevelser i Blekinge.'
  };
  
  return descriptions[name] || `${getTypeLabel(type)} som stödjer Zeppel Inns mission att förena konst och teknologi.`;
};

const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'main': return 'Huvudsponsor';
    case 'partner': return 'Partner';
    case 'supporter': return 'Stödjare';
    default: return type;
  }
};

const getCollaborationTypes = (type: string): string[] => {
  switch (type) {
    case 'main': return ['Finansiering', 'Strategisk rådgivning', 'Marknadsföring'];
    case 'partner': return ['Resurser', 'Expertis', 'Faciliter'];
    case 'supporter': return ['Marknadsföring', 'Nätverk', 'Stöd'];
    default: return ['Stöd'];
  }
};

export const useEnhancedPartnerData = () => {
  const [partners, setPartners] = useState<EnhancedPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDatabase, setUsingDatabase] = useState(false);

  useEffect(() => {
    loadPartnerData();
  }, []);

  const loadPartnerData = async () => {
    try {
      setLoading(true);

      // Check if we should use database partners
      const { data: settingData } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'use_database_partners')
        .maybeSingle();

      const useDatabase = (settingData?.setting_value as any)?.enabled || false;
      setUsingDatabase(useDatabase);

      if (useDatabase) {
        // Load partners from database
        const { data: dbSponsors, error } = await supabase
          .from('sponsors')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error loading database partners:', error);
          // Fallback to static data
          const staticPartners = SPONSOR_DATA.map(transformStaticSponsor);
          setPartners(staticPartners);
          setUsingDatabase(false);
        } else if (dbSponsors && dbSponsors.length > 0) {
          // Transform database sponsors to enhanced partners
          const enhancedPartners = await Promise.all(
            dbSponsors.map(transformSponsor)
          );
          setPartners(enhancedPartners);
        } else {
          // No database partners found, use static
          const staticPartners = SPONSOR_DATA.map(transformStaticSponsor);
          setPartners(staticPartners);
          setUsingDatabase(false);
        }
      } else {
        // Use static partners
        const staticPartners = SPONSOR_DATA.map(transformStaticSponsor);
        setPartners(staticPartners);
      }
    } catch (error) {
      console.error('Error in loadPartnerData:', error);
      const staticPartners = SPONSOR_DATA.map(transformStaticSponsor);
      setPartners(staticPartners);
      setUsingDatabase(false);
    } finally {
      setLoading(false);
    }
  };

  const getPartnersByType = (type: 'main' | 'partner' | 'supporter') => {
    return partners.filter(partner => partner.type === type);
  };

  const getPartnerStats = () => {
    const totalPartners = partners.length;
    const mainSponsors = partners.filter(p => p.type === 'main').length;
    const regularPartners = partners.filter(p => p.type === 'partner').length;
    const supporters = partners.filter(p => p.type === 'supporter').length;
    const totalProjects = new Set(
      partners.flatMap(p => p.projects?.map(proj => proj.id) || [])
    ).size;

    return {
      totalPartners,
      mainSponsors,
      regularPartners,
      supporters,
      totalProjects,
      typeDistribution: [
        { type: 'main', count: mainSponsors, label: 'Huvudsponsorer' },
        { type: 'partner', count: regularPartners, label: 'Partners' },
        { type: 'supporter', count: supporters, label: 'Stödjare' }
      ]
    };
  };

  const searchPartners = (searchTerm: string) => {
    if (!searchTerm) return partners;
    
    const searchLower = searchTerm.toLowerCase();
    return partners.filter(partner =>
      partner.name.toLowerCase().includes(searchLower) ||
      partner.description?.toLowerCase().includes(searchLower) ||
      partner.collaborationTypes?.some(type => 
        type.toLowerCase().includes(searchLower)
      )
    );
  };

  return {
    partners,
    loading,
    usingDatabase,
    getPartnersByType,
    getPartnerStats,
    searchPartners,
    refreshData: loadPartnerData
  };
};
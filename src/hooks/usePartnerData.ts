import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Partner {
  alt: string;
  src: string;
  href: string;
  tagline?: string;
}

interface DatabasePartner {
  id: string;
  name: string;
  type: string;
  logo_path: string | null;
  website: string | null;
}

// Static partner data as fallback
const STATIC_PARTNERS: Partner[] = [
  {
    alt: "Stenbräcka Kursgård",
    src: "/images/partners/stenbracka-logo.png",
    href: "https://stenbracka.se/",
    tagline: "Konstnärliga och tekniska miljöer i skärgården"
  },
  {
    alt: "Maskin & Fritid",
    src: "/images/partners/maskin-fritid-logo.png",
    href: "https://www.maskfri.se/",
    tagline: "Lokala resurser för bygg och teknik"
  },
  {
    alt: "Karlskrona Kommun",
    src: "/images/partners/karlskrona-kommun-logo.png",
    href: "https://www.karlskrona.se/",
    tagline: "Regional utveckling och stöd"
  },
  {
    alt: "Visit Blekinge",
    src: "/images/partners/visit-blekinge-logo.png",
    href: "https://www.visitblekinge.se/",
    tagline: "Regional turism och kultur"
  },
];

const getTaglineForPartner = (name: string): string => {
  const taglines: { [key: string]: string } = {
    'Stenbräcka Kursgård': 'Konstnärliga och tekniska miljöer i skärgården',
    'Maskin & Fritid': 'Lokala resurser för bygg och teknik',
    'Karlskrona Kommun': 'Regional utveckling och stöd',
    'Visit Blekinge': 'Regional turism och kultur',
  };
  return taglines[name] || 'Partner och stödjare av Zeppel Inn';
};

export const usePartnerData = () => {
  const [partners, setPartners] = useState<Partner[]>(STATIC_PARTNERS);
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
        const { data: dbPartners, error } = await supabase
          .from('sponsors')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error loading database partners:', error);
          // Fallback to static data
          setPartners(STATIC_PARTNERS);
          setUsingDatabase(false);
        } else if (dbPartners && dbPartners.length > 0) {
          // Transform database partners to Partner format
          const transformedPartners: Partner[] = dbPartners.map((dbPartner: DatabasePartner) => ({
            alt: dbPartner.name,
            src: dbPartner.logo_path ? `/images/${dbPartner.logo_path}` : "/images/ui/placeholder-project.jpg",
            href: dbPartner.website || "#",
            tagline: getTaglineForPartner(dbPartner.name)
          }));
          setPartners(transformedPartners);
        } else {
          // No database partners found, use static
          setPartners(STATIC_PARTNERS);
          setUsingDatabase(false);
        }
      } else {
        // Use static partners
        setPartners(STATIC_PARTNERS);
      }
    } catch (error) {
      console.error('Error in loadPartnerData:', error);
      setPartners(STATIC_PARTNERS);
      setUsingDatabase(false);
    } finally {
      setLoading(false);
    }
  };

  return { partners, loading, usingDatabase, refreshData: loadPartnerData };
};
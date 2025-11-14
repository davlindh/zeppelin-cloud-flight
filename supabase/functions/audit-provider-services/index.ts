import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface AuditResult {
  timestamp: string;
  issues: {
    unlinked_services: Array<{
      id: string;
      title: string;
      provider_name: string;
    }>;
    providers_without_services: Array<{
      id: string;
      name: string;
      created_at: string;
    }>;
    duplicate_providers: Array<{
      name: string;
      count: number;
      ids: string[];
    }>;
    low_quality_providers: Array<{
      id: string;
      name: string;
      issue: string;
    }>;
  };
  recommendations: string[];
  summary: {
    total_services: number;
    total_providers: number;
    linkage_rate: number;
    health_score: number;
  };
}

serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Fetch unlinked services
    const { data: unlinkedServices } = await supabase
      .from('services')
      .select('id, title, provider')
      .is('provider_id', null);

    // Fetch providers without services
    const { data: allProviders } = await supabase
      .from('service_providers')
      .select('id, name, created_at');

    const { data: providersWithServices } = await supabase
      .from('services')
      .select('provider_id')
      .not('provider_id', 'is', null);

    const providerIdsWithServices = new Set(
      providersWithServices?.map(s => s.provider_id) || []
    );

    const providersWithoutServices = allProviders?.filter(
      p => !providerIdsWithServices.has(p.id)
    ) || [];

    // Find duplicate provider names
    const providersByName = new Map<string, string[]>();
    allProviders?.forEach(p => {
      const ids = providersByName.get(p.name) || [];
      ids.push(p.id);
      providersByName.set(p.name, ids);
    });

    const duplicateProviders = Array.from(providersByName.entries())
      .filter(([_, ids]) => ids.length > 1)
      .map(([name, ids]) => ({ name, count: ids.length, ids }));

    // Find low-quality providers
    const { data: lowQualityProviders } = await supabase
      .from('service_providers')
      .select('id, name, rating, reviews, email')
      .or('rating.lt.3,reviews.eq.0,email.is.null');

    const lowQuality = lowQualityProviders?.map(p => ({
      id: p.id,
      name: p.name,
      issue: p.email === null 
        ? 'Missing contact info' 
        : p.reviews === 0 
          ? 'No reviews' 
          : 'Low rating'
    })) || [];

    // Calculate metrics
    const { data: allServices } = await supabase
      .from('services')
      .select('id, provider_id');

    const totalServices = allServices?.length || 0;
    const linkedServices = allServices?.filter(s => s.provider_id).length || 0;
    const linkageRate = totalServices > 0 ? (linkedServices / totalServices) * 100 : 100;
    
    const healthScore = Math.round(
      (linkageRate * 0.4) + 
      ((providersWithoutServices.length === 0 ? 100 : 70) * 0.3) +
      ((duplicateProviders.length === 0 ? 100 : 60) * 0.2) +
      ((lowQuality.length === 0 ? 100 : 80) * 0.1)
    );

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (unlinkedServices && unlinkedServices.length > 0) {
      recommendations.push(
        `Link ${unlinkedServices.length} unlinked services to providers using name matching or manual assignment.`
      );
    }

    if (duplicateProviders.length > 0) {
      recommendations.push(
        `Merge ${duplicateProviders.length} duplicate provider profiles to avoid confusion.`
      );
    }

    if (providersWithoutServices.length > 0) {
      recommendations.push(
        `Review ${providersWithoutServices.length} providers without services - consider archiving or adding services.`
      );
    }

    if (lowQuality.length > 0) {
      recommendations.push(
        `Improve ${lowQuality.length} provider profiles with missing info or low engagement.`
      );
    }

    const result: AuditResult = {
      timestamp: new Date().toISOString(),
      issues: {
        unlinked_services: unlinkedServices || [],
        providers_without_services: providersWithoutServices,
        duplicate_providers: duplicateProviders,
        low_quality_providers: lowQuality
      },
      recommendations,
      summary: {
        total_services: totalServices,
        total_providers: allProviders?.length || 0,
        linkage_rate: Math.round(linkageRate * 100) / 100,
        health_score: healthScore
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

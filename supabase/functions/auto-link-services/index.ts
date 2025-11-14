import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutoLinkResult {
  success: boolean;
  linked_count: number;
  failed_count: number;
  created_providers: number;
  details: Array<{
    service_id: string;
    service_title: string;
    provider_id: string;
    provider_name: string;
    action: 'linked' | 'created_and_linked' | 'failed';
    reason?: string;
  }>;
}

// String similarity function (Levenshtein distance)
function similarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const costs: number[] = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }
  
  return (longer.length - costs[shorter.length]) / longer.length;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { dry_run = false, similarity_threshold = 0.85 } = await req.json();

    // Fetch unlinked services
    const { data: unlinkedServices } = await supabase
      .from('services')
      .select('id, title, provider, location')
      .is('provider_id', null);

    if (!unlinkedServices || unlinkedServices.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          linked_count: 0,
          failed_count: 0,
          created_providers: 0,
          details: [],
          message: 'No unlinked services found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all providers
    const { data: allProviders } = await supabase
      .from('service_providers')
      .select('id, name, location');

    const result: AutoLinkResult = {
      success: true,
      linked_count: 0,
      failed_count: 0,
      created_providers: 0,
      details: []
    };

    for (const service of unlinkedServices) {
      let matchedProvider = null;
      let bestSimilarity = 0;

      // Try exact match first
      matchedProvider = allProviders?.find(
        p => p.name.toLowerCase() === service.provider.toLowerCase()
      );

      // If no exact match, try fuzzy matching
      if (!matchedProvider) {
        for (const provider of allProviders || []) {
          const sim = similarity(
            service.provider.toLowerCase(),
            provider.name.toLowerCase()
          );
          
          if (sim > bestSimilarity && sim >= similarity_threshold) {
            bestSimilarity = sim;
            matchedProvider = provider;
          }
        }
      }

      if (matchedProvider) {
        // Link service to existing provider
        if (!dry_run) {
          await supabase
            .from('services')
            .update({ provider_id: matchedProvider.id })
            .eq('id', service.id);
        }

        result.linked_count++;
        result.details.push({
          service_id: service.id,
          service_title: service.title,
          provider_id: matchedProvider.id,
          provider_name: matchedProvider.name,
          action: 'linked'
        });
      } else {
        // Create new provider and link
        if (!dry_run) {
          const { data: newProvider, error: createError } = await supabase
            .from('service_providers')
            .insert({
              name: service.provider,
              slug: service.provider.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
              location: service.location || 'Unknown',
              email: '',
              phone: '',
              bio: `Auto-created provider profile for ${service.provider}. Please update contact information and details.`,
              rating: 0,
              reviews: 0,
              experience: 'To be updated'
            })
            .select()
            .single();

          if (createError || !newProvider) {
            result.failed_count++;
            result.details.push({
              service_id: service.id,
              service_title: service.title,
              provider_id: '',
              provider_name: service.provider,
              action: 'failed',
              reason: createError?.message || 'Failed to create provider'
            });
            continue;
          }

          await supabase
            .from('services')
            .update({ provider_id: newProvider.id })
            .eq('id', service.id);

          result.created_providers++;
          result.linked_count++;
          result.details.push({
            service_id: service.id,
            service_title: service.title,
            provider_id: newProvider.id,
            provider_name: newProvider.name,
            action: 'created_and_linked'
          });
        } else {
          result.details.push({
            service_id: service.id,
            service_title: service.title,
            provider_id: 'would_create_new',
            provider_name: service.provider,
            action: 'created_and_linked'
          });
        }
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

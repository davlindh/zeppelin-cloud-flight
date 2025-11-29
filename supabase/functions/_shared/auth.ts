import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Verify that the request has a valid JWT and the user has admin role
 * Returns the authenticated user or throws a Response error
 */
export async function verifyAdminAuth(req: Request): Promise<{ user: any; supabase: any }> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    throw new Response(
      JSON.stringify({ error: 'Unauthorized - No authorization header' }),
      { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      headers: { Authorization: authHeader }
    }
  });

  // Verify the JWT and get user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Response(
      JSON.stringify({ error: 'Unauthorized - Invalid token' }),
      { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  // Check if user has admin role
  const { data: isAdmin, error: roleError } = await supabase
    .rpc('has_role', { p_user_id: user.id, p_role: 'admin' });

  if (roleError || !isAdmin) {
    throw new Response(
      JSON.stringify({ error: 'Forbidden - Admin access required' }),
      { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  return { user, supabase };
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessSubmissionRequest {
  submissionId: string;
  action: 'approve' | 'reject' | 'convert-to-participant' | 'convert-to-project';
  projectId?: string;
  approveMedia?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user and admin role
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: isAdmin, error: roleError } = await supabase
      .rpc('has_role', { p_user_id: user.id, p_role: 'admin' });

    if (roleError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { submissionId, action, projectId, approveMedia = true }: ProcessSubmissionRequest = await req.json();

    console.log(`📋 Processing submission ${submissionId} with action: ${action}`);

    // Fetch submission
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return new Response(
        JSON.stringify({ error: 'Submission not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: any = { success: true };

    if (action === 'approve') {
      // Update submission status
      await supabase
        .from('submissions')
        .update({ 
          status: 'approved', 
          processed_at: new Date().toISOString() 
        })
        .eq('id', submissionId);

      // Approve linked media if requested
      if (approveMedia) {
        await supabase
          .from('media_library')
          .update({ 
            status: 'approved', 
            approved_at: new Date().toISOString(),
            is_public: true
          })
          .eq('submission_id', submissionId);
      }

      result.message = 'Submission approved successfully';
    }

    if (action === 'reject') {
      await supabase
        .from('submissions')
        .update({ 
          status: 'rejected', 
          processed_at: new Date().toISOString() 
        })
        .eq('id', submissionId);

      // Mark media as rejected
      await supabase
        .from('media_library')
        .update({ status: 'rejected', is_public: false })
        .eq('submission_id', submissionId);

      result.message = 'Submission rejected';
    }

    if (action === 'convert-to-participant') {
      console.log('🔄 Converting submission to participant...');
      
      // Use existing RPC function
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('create_participant_from_submission', { 
          _submission_id: submissionId 
        });

      if (rpcError) {
        throw new Error(`RPC failed: ${rpcError.message}`);
      }

      if (rpcResult?.[0]?.success) {
        const participantId = rpcResult[0].participant_id;

        // Link approved media to participant
        await supabase
          .from('media_library')
          .update({ 
            participant_id: participantId,
            status: 'approved',
            approved_at: new Date().toISOString(),
            is_public: true
          })
          .eq('submission_id', submissionId);

        // Mark submission as approved
        await supabase
          .from('submissions')
          .update({ 
            status: 'approved', 
            processed_at: new Date().toISOString() 
          })
          .eq('id', submissionId);

        result = {
          success: true,
          participantId: participantId,
          participantSlug: rpcResult[0].participant_slug,
          message: 'Participant created successfully'
        };
      } else {
        throw new Error('Failed to create participant');
      }
    }

    if (action === 'convert-to-project') {
      console.log('🔄 Converting submission to project...');
      
      const content = submission.content || {};
      
      // Create project from submission
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: submission.title,
          description: content.description || content.purpose || submission.title,
          full_description: content.full_description,
          purpose: content.purpose,
          expected_impact: content.expected_impact,
        })
        .select()
        .single();

      if (projectError || !project) {
        throw new Error(`Failed to create project: ${projectError?.message}`);
      }

      // Link media to project
      await supabase
        .from('media_library')
        .update({ 
          project_id: project.id,
          status: 'approved',
          approved_at: new Date().toISOString(),
          is_public: true
        })
        .eq('submission_id', submissionId);

      // Mark submission as approved
      await supabase
        .from('submissions')
        .update({ 
          status: 'approved', 
          processed_at: new Date().toISOString() 
        })
        .eq('id', submissionId);

      result = {
        success: true,
        projectId: project.id,
        projectSlug: project.slug,
        message: 'Project created successfully'
      };
    }

    console.log('✅ Processing complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('❌ Processing failed:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});

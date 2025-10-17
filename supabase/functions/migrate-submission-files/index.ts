import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FileRecord {
  fieldName?: string;
  url: string;
  fileName: string;
  bucketName?: string;
  name?: string;
  mime_type?: string;
  type?: string;
  size?: number;
}

const getMediaType = (mimeType: string): 'image' | 'video' | 'audio' | 'document' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Starting migration of submission files to media_library...');

    // Fetch all submissions with files
    const { data: submissions, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .not('files', 'is', null);

    if (fetchError) {
      throw new Error(`Failed to fetch submissions: ${fetchError.message}`);
    }

    let migratedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const submission of submissions || []) {
      if (!submission.files || !Array.isArray(submission.files)) continue;

      console.log(`📁 Processing submission ${submission.id} with ${submission.files.length} files`);

      for (const file of submission.files as FileRecord[]) {
        try {
          const fileName = file.url.split('/').pop() || 'unknown';
          const mimeType = file.mime_type || file.type || 'application/octet-stream';
          const fileType = getMediaType(mimeType);
          
          // Extract storage path from URL
          const urlParts = file.url.split('/storage/v1/object/public/');
          const storagePath = urlParts[1] || `submissions/${fileName}`;
          const bucket = storagePath.split('/')[0] || 'media-files';

          // Check if already migrated
          const { data: existing } = await supabase
            .from('media_library')
            .select('id')
            .eq('submission_id', submission.id)
            .eq('filename', fileName)
            .single();

          if (existing) {
            console.log(`⏭️  Skipping ${fileName} - already migrated`);
            continue;
          }

          // Create media_library record
          const { error: insertError } = await supabase
            .from('media_library')
            .insert({
              title: file.name || file.fileName || fileName,
              filename: fileName,
              original_filename: file.name || file.fileName,
              type: fileType,
              mime_type: mimeType,
              bucket: bucket,
              storage_path: storagePath.replace(`${bucket}/`, ''),
              public_url: file.url,
              file_size: file.size || null,
              status: submission.status === 'approved' ? 'approved' : 'pending',
              source: 'submission',
              submission_id: submission.id,
              uploaded_at: submission.created_at,
              tags: [`submission-${submission.id}`, 'migrated'],
              category: submission.type || 'general',
              is_public: submission.status === 'approved',
            });

          if (insertError) {
            throw insertError;
          }

          console.log(`✅ Migrated: ${fileName} → media_library`);
          migratedCount++;
        } catch (error) {
          const errorMsg = `Failed to migrate file from submission ${submission.id}: ${error.message}`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
          errorCount++;
        }
      }
    }

    const result = {
      success: true,
      migrated: migratedCount,
      errors: errorCount,
      errorDetails: errors,
      message: `Successfully migrated ${migratedCount} files. ${errorCount} errors occurred.`
    };

    console.log('🎉 Migration complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
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

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FileRecord {
  fieldName?: string;
  url: string;
  fileName?: string;
  bucketName?: string;
  name?: string;
  mime_type?: string;
  type?: string;
  size?: number;
}

type FilesData = FileRecord[] | Record<string, string | FileRecord>;

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
      if (!submission.files) continue;

      const files: FilesData = submission.files;
      
      // Convert object format to array format
      let fileArray: Array<{ fieldName?: string; file: FileRecord | string }> = [];
      
      if (Array.isArray(files)) {
        // Already array format: [{url, fileName, ...}]
        fileArray = files.map(f => ({ file: f }));
        console.log(`📁 Processing submission ${submission.id} (array format) with ${fileArray.length} files`);
      } else if (typeof files === 'object') {
        // Object format: {cv: "url", portfolio: "url"} or {cv: {url, fileName}}
        fileArray = Object.entries(files).map(([key, value]) => ({ 
          fieldName: key, 
          file: value 
        }));
        console.log(`📁 Processing submission ${submission.id} (object format) with ${fileArray.length} files`);
      } else {
        console.log(`⏭️  Skipping submission ${submission.id} - invalid files format`);
        continue;
      }

      for (const { fieldName, file } of fileArray) {
        try {
          // Handle both string URL and FileRecord object
          let fileUrl: string;
          let fileName: string;
          let mimeType: string;
          let fileSize: number | null = null;
          
          if (typeof file === 'string') {
            // Simple string URL
            fileUrl = file;
            fileName = fileUrl.split('/').pop() || fieldName || 'unknown';
            mimeType = 'application/octet-stream';
          } else {
            // FileRecord object
            fileUrl = file.url;
            fileName = file.fileName || file.name || fileUrl.split('/').pop() || fieldName || 'unknown';
            mimeType = file.mime_type || file.type || 'application/octet-stream';
            fileSize = file.size || null;
          }
          
          const fileType = getMediaType(mimeType);
          
          // Extract storage path from URL
          const urlParts = fileUrl.split('/storage/v1/object/public/');
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
          const title = typeof file === 'string' 
            ? (fieldName || fileName)
            : (file.name || file.fileName || fileName);
            
          const { error: insertError } = await supabase
            .from('media_library')
            .insert({
              title: title,
              filename: fileName,
              original_filename: typeof file === 'string' ? fileName : (file.name || file.fileName),
              type: fileType,
              mime_type: mimeType,
              bucket: bucket,
              storage_path: storagePath.replace(`${bucket}/`, ''),
              public_url: fileUrl,
              file_size: fileSize,
              status: submission.status === 'approved' ? 'approved' : 'pending',
              source: 'submission',
              submission_id: submission.id,
              uploaded_at: submission.created_at,
              tags: fieldName 
                ? [`submission-${submission.id}`, 'migrated', `field:${fieldName}`]
                : [`submission-${submission.id}`, 'migrated'],
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

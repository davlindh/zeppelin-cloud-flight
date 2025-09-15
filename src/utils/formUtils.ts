// Form utility functions - separated to avoid react-refresh warnings
// These are pure utility functions that don't depend on React components

export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const parseSocialLinks = (linksString: string) => {
  if (!linksString.trim()) return [];

  return linksString.split(',').map(link => {
    const trimmed = link.trim();
    let platform = 'other';

    if (trimmed.includes('instagram')) platform = 'instagram';
    else if (trimmed.includes('twitter') || trimmed.includes('x.com')) platform = 'twitter';
    else if (trimmed.includes('linkedin')) platform = 'linkedin';
    else if (trimmed.includes('facebook')) platform = 'facebook';
    else if (trimmed.includes('github')) platform = 'github';

    return { platform, url: trimmed };
  }).filter(link => link.url);
};

// File upload utility with proper typing
interface SupabaseStorageAPI {
  from: (bucket: string) => {
    upload: (path: string, file: File) => Promise<{ error: Error | null }>;
    getPublicUrl: (path: string) => { data: { publicUrl: string } };
  };
}

export const uploadFile = async (
  file: File,
  bucketName: string,
  supabase: { storage: SupabaseStorageAPI }
): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${bucketName}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

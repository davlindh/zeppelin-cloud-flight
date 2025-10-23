import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures a user profile exists in the users table
 * Creates a profile if it doesn't exist
 */
export const ensureUserProfile = async (userId: string, email: string) => {
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (existingProfile) {
      return existingProfile;
    }

    // Create new profile if it doesn't exist
    const { data: newProfile, error } = await supabase
      .from('users')
      .insert({
        auth_user_id: userId,
        email: email,
        full_name: '',
        phone: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }

    return newProfile;
  } catch (error) {
    console.error('Failed to ensure user profile:', error);
    throw error;
  }
};

/**
 * Repairs missing user profile and returns user data
 */
export const repairUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No authenticated user');
    }

    await ensureUserProfile(user.id, user.email || '');

    // Return the user data in the expected format
    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || '',
      phone: user.user_metadata?.phone || ''
    };
  } catch (error) {
    console.error('Failed to repair user profile:', error);
    throw error;
  }
};

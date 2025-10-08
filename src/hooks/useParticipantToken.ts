import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VerifyTokenResult {
  valid: boolean;
  participant_id: string | null;
  participant_email: string | null;
  participant_name: string | null;
}

export const useVerifyParticipantToken = (token: string | null) => {
  return useQuery({
    queryKey: ['verify-participant-token', token],
    queryFn: async (): Promise<VerifyTokenResult> => {
      if (!token) {
        return { valid: false, participant_id: null, participant_email: null, participant_name: null };
      }

      const { data, error } = await supabase
        .rpc('verify_participant_token', { _token: token });

      if (error) {
        console.error('Token verification error:', error);
        throw error;
      }

      const result = data?.[0];
      return {
        valid: result?.valid || false,
        participant_id: result?.participant_id || null,
        participant_email: result?.participant_email || null,
        participant_name: result?.participant_name || null,
      };
    },
    enabled: !!token,
    retry: false,
  });
};

interface CompleteProfileData {
  token: string;
  bio: string;
  skills: string[];
  experience_level?: string;
  interests?: string[];
  time_commitment?: string;
  contributions?: string[];
  availability?: string;
  avatar_path?: string;
}

export const useCompleteParticipantProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CompleteProfileData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Du måste vara inloggad för att slutföra profilen');
      }

      const { data: result, error } = await supabase.rpc('complete_participant_profile', {
        _token: data.token,
        _auth_user_id: user.id,
        _bio: data.bio,
        _skills: data.skills,
        _experience_level: data.experience_level,
        _interests: data.interests,
        _time_commitment: data.time_commitment,
        _contributions: data.contributions,
        _availability: data.availability,
        _avatar_path: data.avatar_path,
      });

      if (error) throw error;

      const resultData = result?.[0];
      if (!resultData?.success) {
        throw new Error(resultData?.message || 'Failed to complete profile');
      }

      return resultData;
    },
    onSuccess: (data) => {
      toast({
        title: "Profil slutförd!",
        description: "Din deltagarprofil är nu publik på Zeppel Inn.",
      });
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Fel",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

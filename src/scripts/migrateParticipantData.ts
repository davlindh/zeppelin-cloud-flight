// Migration script to convert approved participant submissions to database participants
// This script can be run from the admin panel or as a one-time migration

import { supabase } from '@/integrations/supabase/client';

interface SubmissionContent {
  bio?: string;
  description?: string;
  skills?: string[];
  experienceLevel?: string;
  interests?: string[];
  timeCommitment?: string;
  contributions?: string[];
  availability?: string;
  portfolioLinks?: string;
}

interface Submission {
  id: string;
  submitted_by: string;
  title: string;
  content: SubmissionContent;
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  how_found_us?: string;
  status: string;
  type: string;
}

export async function migrateApprovedParticipantSubmissions(): Promise<{
  success: boolean;
  migratedCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let migratedCount = 0;

  try {
    // Fetch all approved participant submissions
    const { data: submissions, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('type', 'participant')
      .eq('status', 'approved')
      .not('submitted_by', 'is', null);

    if (fetchError) {
      errors.push(`Failed to fetch submissions: ${fetchError.message}`);
      return { success: false, migratedCount: 0, errors };
    }

    if (!submissions || submissions.length === 0) {
      return { success: true, migratedCount: 0, errors: ['No approved participant submissions found'] };
    }

    // Process each submission
    for (const submission of submissions as Submission[]) {
      try {
        // Generate slug
        const generateSlug = (name: string) => {
          return name
            .toLowerCase()
            .replace(/[åäá]/g, 'a')
            .replace(/[öóø]/g, 'o') 
            .replace(/[üúù]/g, 'u')
            .replace(/[éèê]/g, 'e')
            .replace(/[íìî]/g, 'i')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .trim();
        };

        const participantData = {
          name: submission.submitted_by,
          slug: generateSlug(submission.submitted_by),
          bio: submission.content?.bio || submission.content?.description || '',
          skills: submission.content?.skills || [],
          experience_level: submission.content?.experienceLevel || null,
          interests: submission.content?.interests || [],
          time_commitment: submission.content?.timeCommitment || null,
          contributions: submission.content?.contributions || [],
          location: submission.location || null,
          contact_email: submission.contact_email || null,
          contact_phone: submission.contact_phone || null,
          how_found_us: submission.how_found_us || null,
          availability: submission.content?.availability || null,
          social_links: submission.content?.portfolioLinks ? 
            [{ platform: 'website', url: submission.content.portfolioLinks }] : []
        };

        // Insert participant
        const { error: insertError } = await supabase
          .from('participants')
          .upsert(participantData, { 
            onConflict: 'slug',
            ignoreDuplicates: false 
          });

        if (insertError) {
          errors.push(`Failed to insert participant ${submission.submitted_by}: ${insertError.message}`);
        } else {
          migratedCount++;
          console.log(`Successfully migrated participant: ${submission.submitted_by}`);
        }
      } catch (error: any) {
        errors.push(`Error processing submission ${submission.id}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      migratedCount,
      errors
    };
  } catch (error: any) {
    return {
      success: false,
      migratedCount: 0,
      errors: [`Migration failed: ${error.message}`]
    };
  }
}

export async function migrateStaticParticipants(): Promise<{
  success: boolean;
  migratedCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let migratedCount = 0;

  try {
    const staticParticipants = [
      {
        name: 'Irina Novokrescionova',
        slug: 'irina-novokrescionova',
        bio: 'En passionerad deltagare i vårt community med stor erfarenhet inom kreativt arbete.',
        avatar_path: '/images/projects/irina-novokrescionova.jpg',
        skills: ['kreativt arbete', 'design'],
        experience_level: 'expert',
        contributions: ['artistic']
      },
      {
        name: 'Jonatan',
        slug: 'jonatan',
        bio: 'Erfaren deltagare med teknisk bakgrund och stort intresse för innovation.',
        skills: ['teknik', 'innovation'],
        experience_level: 'advanced',
        contributions: ['technical']
      },
      {
        name: 'Anastasiya',
        slug: 'anastasiya',
        bio: 'Mångsidig deltagare med bred erfarenhet inom flera områden.',
        skills: ['mångsidig'],
        experience_level: 'intermediate',
        contributions: ['collaboration']
      },
      {
        name: 'Cooking Potato',
        slug: 'cooking-potato',
        bio: 'Kreativ deltagare med fokus på matlagning och gastronomi.',
        avatar_path: '/images/projects/cooking-potato.jpg',
        skills: ['matlagning', 'gastronomi'],
        experience_level: 'intermediate',
        contributions: ['culinary']
      }
    ];

    for (const participant of staticParticipants) {
      try {
        const { error } = await supabase
          .from('participants')
          .upsert(participant, { 
            onConflict: 'slug',
            ignoreDuplicates: false 
          });

        if (error) {
          errors.push(`Failed to migrate ${participant.name}: ${error.message}`);
        } else {
          migratedCount++;
          console.log(`Successfully migrated static participant: ${participant.name}`);
        }
      } catch (error: any) {
        errors.push(`Error migrating ${participant.name}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      migratedCount,
      errors
    };
  } catch (error: any) {
    return {
      success: false,
      migratedCount: 0,
      errors: [`Static migration failed: ${error.message}`]
    };
  }
}
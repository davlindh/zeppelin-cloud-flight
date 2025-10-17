import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProjectDetailLayout } from '@/components/showcase/projects/ProjectDetailLayout';

interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  full_description?: string;
  image_path?: string;
  purpose?: string;
  expected_impact?: string;
  associations?: string[];
  created_at: string;
  updated_at: string;
  
  // Related data
  tags?: string[];
  participants?: Array<{
    id: string;
    name: string;
    role: string;
    avatar_path?: string;
    bio?: string;
  }>;
  sponsors?: Array<{
    id: string;
    name: string;
    type: string;
    logo_path?: string;
    website?: string;
  }>;
  links?: Array<{
    type: string;
    url: string;
  }>;
  media?: Array<{
    type: string;
    url: string;
    title: string;
    description?: string;
  }>;
  budget?: {
    amount?: number;
    currency?: string;
    breakdown?: Array<{ item: string; cost: number; }>;
  };
  timeline?: {
    start_date?: string;
    end_date?: string;
    milestones?: Array<{ date: string; title: string; description?: string; }>;
  };
  access?: {
    requirements?: string[];
    target_audience?: string;
    capacity?: number;
    registration_required?: boolean;
  };
  voting?: {
    enabled: boolean;
    categories?: Array<{ name: string; description?: string; }>;
    results?: Array<{ category: string; score: number; votes: number; }>;
  };
}

// Extract helper functions to reduce complexity
const transformTags = (projectTags: unknown): string[] => {
  if (!Array.isArray(projectTags)) return [];

  return projectTags.map(tag =>
    typeof tag === 'string'
      ? tag
      : (tag as { tag?: string })?.tag
  ).filter(Boolean) as string[];
};

const transformParticipants = (projectParticipants: unknown) => {
  if (!Array.isArray(projectParticipants)) return [];

  return projectParticipants.map(junction => {
    const participant = (junction as { participants?: any; role?: string })?.participants;
    const role = (junction as { participants?: any; role?: string })?.role;
    return participant ? {
      id: participant.id,
      name: participant.name,
      role: role || 'participant',
      avatar_path: participant.avatar_path,
      bio: participant.bio
    } : null;
  }).filter(Boolean);
};

const transformSponsors = (projectSponsors: unknown) => {
  if (!Array.isArray(projectSponsors)) return [];

  return projectSponsors.map(junction => {
    const sponsor = (junction as { sponsors?: any })?.sponsors;
    return sponsor ? {
      id: sponsor.id || sponsor.name,
      name: sponsor.name,
      type: sponsor.type || 'supporter',
      logo_path: sponsor.logo_path,
      website: sponsor.website,
      description: sponsor.description
    } : null;
  }).filter(Boolean);
};

const transformBudget = (projectBudget: unknown) => {
  if (!Array.isArray(projectBudget) || projectBudget.length === 0) return;

  const budget = projectBudget[0] as any;
  if (typeof budget !== 'object' || budget === null) return;

  return {
    amount: typeof budget.amount === 'number' ? budget.amount : undefined,
    currency: typeof budget.currency === 'string' ? budget.currency : 'SEK',
    breakdown: Array.isArray(budget.breakdown)
      ? budget.breakdown.filter((item: unknown) =>
          item && typeof (item as any).item === 'string' && typeof (item as any).cost === 'number'
        )
      : undefined
  };
};

const transformTimeline = (projectTimeline: unknown) => {
  if (!Array.isArray(projectTimeline) || projectTimeline.length === 0) return;

  const timeline = projectTimeline[0] as any;
  if (typeof timeline !== 'object' || timeline === null) return;

  return {
    start_date: timeline.start_date,
    end_date: timeline.end_date,
    milestones: Array.isArray(timeline.milestones)
      ? timeline.milestones.filter((milestone: unknown) =>
          milestone && typeof (milestone as any).date === 'string' &&
          typeof (milestone as any).title === 'string'
        )
      : undefined
  };
};

const transformAccess = (projectAccess: unknown) => {
  if (!Array.isArray(projectAccess) || projectAccess.length === 0) return;

  const access = projectAccess[0] as any;
  if (typeof access !== 'object' || access === null) return;

  return {
    requirements: Array.isArray(access.requirements) ? access.requirements : [],
    target_audience: access.target_audience,
    capacity: access.capacity,
    registration_required: access.registration_required
  };
};

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Admin check and controls
  const { isAdmin } = useAdminAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Use TanStack Query for data fetching - replaces all manual data fetching
  const { data: projectData, isLoading: loading, error } = useProject(slug || '');

  // Handle UUID-to-slug redirect
  React.useEffect(() => {
    if (projectData && slug) {
      // Check if the slug parameter is actually a UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

      // If it's a UUID but we found a project, redirect to the slug URL
      if (isUUID && projectData.slug && projectData.slug !== slug) {
        console.log(`🔄 Redirecting from UUID ${slug} to slug ${projectData.slug}`);
        navigate(`/showcase/${projectData.slug}`, { replace: true });
        return;
      }
    }
  }, [projectData, slug, navigate]);

  // Simplified transformation using extracted helpers
  const project: ProjectDetail | null = useMemo(() => {
    if (!projectData) return null;

    return {
      // Basic project data
      id: projectData.id,
      title: projectData.title,
      description: projectData.description,
      full_description: projectData.full_description,
      image_path: projectData.image_path,
      purpose: projectData.purpose,
      expected_impact: projectData.expected_impact,
      associations: projectData.associations || [],
      created_at: projectData.created_at,
      updated_at: projectData.updated_at,

      // Safe relationship data
      tags: transformTags(projectData.project_tags),
      participants: transformParticipants(projectData.project_participants),
      sponsors: transformSponsors(projectData.project_sponsors),
      links: projectData.project_links || [],
      media: projectData.project_media || [],
      budget: transformBudget(projectData.project_budget),
      timeline: transformTimeline(projectData.project_timeline),
      access: transformAccess(projectData.project_access),
      voting: undefined,
    };
  }, [projectData]);

  const handleDelete = async () => {
    if (!project?.id) return;

    try {
      const { error } = await supabase.from("projects").delete().eq("id", project.id);
      if (error) throw error;

      toast({
        title: "Projekt raderat",
        description: "Projektet har tagits bort permanent.",
      });

      navigate("/showcase");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Något gick fel";
      toast({
        title: "Fel vid borttagning",
        description: message,
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Enhanced Hero skeleton */}
          <div className="relative h-[32rem] md:h-[40rem] lg:h-[44rem] gradient-subtle rounded-2xl overflow-hidden mb-16 animate-pulse">
            <div className="absolute inset-0">
              <div className="h-full bg-muted/40 rounded-2xl animate-pulse"></div>
            </div>
            <div className="relative p-12 md:p-20 h-full flex items-end">
              <div className="space-y-6 max-w-5xl animate-fade-in">
                <div className="skeleton h-6 w-40 mb-6 rounded-lg"></div>
                <div className="skeleton h-16 md:h-20 w-full max-w-4xl mb-6 rounded-xl"></div>
                <div className="skeleton h-8 w-4/5 mb-8 rounded-lg"></div>
                <div className="flex gap-3">
                  <div className="skeleton h-10 w-20 rounded-full"></div>
                  <div className="skeleton h-10 w-24 rounded-full"></div>
                  <div className="skeleton h-10 w-28 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-16 max-w-8xl">
            <div className="lg:col-span-2 space-y-10">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card-enhanced p-8 space-y-6 animate-pulse border-0 shadow-elegant">
                  <div className="skeleton h-8 w-56 rounded-lg"></div>
                  <div className="space-y-3">
                    <div className="skeleton h-5 w-full rounded"></div>
                    <div className="skeleton h-5 w-5/6 rounded"></div>
                    <div className="skeleton h-5 w-4/5 rounded"></div>
                    <div className="skeleton h-5 w-3/5 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-8">
              <div className="card-enhanced p-8 space-y-6 animate-pulse border-0 shadow-elegant">
                <div className="skeleton h-8 w-40 rounded-lg"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="skeleton h-14 w-14 rounded-full flex-shrink-0"></div>
                      <div className="space-y-2 flex-1">
                        <div className="skeleton h-4 w-3/4 rounded"></div>
                        <div className="skeleton h-3 w-1/2 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    const errorMessage = error instanceof Error ? error.message : (error || 'Projekt hittades inte');
    return (
      <div className="min-h-screen gradient-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <div className="card-enhanced p-12 md:p-16 inline-block border-0 shadow-glow">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-serif">
              {errorMessage}
            </h1>
            <Button onClick={() => navigate('/showcase')} className="btn-glow shadow-elegant hover:shadow-glow">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tillbaka till showcase
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <ProjectDetailLayout
        project={project}
        isAdmin={isAdmin}
        onEdit={() => {
          // Navigate to direct admin edit page
          navigate(`/admin/projects/${slug}/edit`, {
            state: {
              projectData: project,
              returnPath: `/showcase/${slug}`
            }
          });
        }}
        onDelete={() => setShowDeleteDialog(true)}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Är du säker?</AlertDialogTitle>
            <AlertDialogDescription>
              Detta kommer att ta bort projektet <strong>{project.title}</strong> permanent.
              Åtgärden kan inte ångras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProjectDetailHeroProps {
  project: {
    id: string;
    title: string;
    description: string;
    image_path?: string;
    associations?: string[];
  };
  isAdmin: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ProjectDetailHero: React.FC<ProjectDetailHeroProps> = ({
  project,
  isAdmin,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '/public/images/ui/placeholder-project.jpg';

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    const { data } = supabase.storage
      .from('project-images')
      .getPublicUrl(imagePath);

    return data.publicUrl;
  };

  return (
    <div className="relative h-[32rem] md:h-[40rem] lg:h-[44rem] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={getImageUrl(project.image_path)}
          alt={project.title}
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.currentTarget.src = '/public/images/ui/placeholder-project.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 h-full flex items-end">
        <div className="w-full max-w-6xl animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate('/showcase')}
            className="mb-6 md:mb-8 text-foreground/80 hover:text-foreground btn-glow backdrop-blur-md bg-background/30 border border-border/40 hover:bg-background/50 transition-all duration-300 shadow-elegant"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tillbaka till showcase
          </Button>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 md:mb-8 leading-[0.9] tracking-tight font-serif">
            {project.title}
          </h1>

          {/* Admin controls */}
          {isAdmin && (
            <div className="flex gap-3 mb-6 md:mb-8">
              {onEdit && (
                <Button
                  onClick={onEdit}
                  variant="secondary"
                  className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 backdrop-blur-md"
                >
                  🗑️ Edit Project
                </Button>
              )}
              {onDelete && (
                <Button
                  onClick={onDelete}
                  variant="destructive"
                  className="bg-red-500/90 hover:bg-red-600 text-white border-red-500/30 backdrop-blur-md"
                >
                  🗑️ Delete Project
                </Button>
              )}
            </div>
          )}

          <p className="text-xl sm:text-2xl md:text-3xl text-foreground/90 mb-8 md:mb-10 max-w-5xl leading-relaxed font-light">
            {project.description}
          </p>

          {/* Tags */}
          {project.associations && (
            <div className="flex flex-wrap gap-3 md:gap-4 animate-scale-in">
              {project.associations.map((assoc, index) => (
                <Badge key={`assoc-${index}`} variant="outline" className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium bg-background/40 backdrop-blur-md border-border/50 hover:bg-background/60 transition-all duration-300 shadow-soft">
                  {assoc}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

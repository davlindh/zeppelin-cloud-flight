import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, ExternalLink, Sparkles, Trash2 } from 'lucide-react';
import { useProviderProjects } from '@/hooks/marketplace/useProviderProjects';
import { Skeleton } from '@/components/ui/skeleton';

interface ProviderProjectsSectionProps {
  providerId: string;
  isOwner?: boolean;
}

export const ProviderProjectsSection: React.FC<ProviderProjectsSectionProps> = ({
  providerId,
  isOwner = false,
}) => {
  const {
    providerProjects,
    isLoading,
    generatePortfolioFromProject,
    unlinkProject,
  } = useProviderProjects(providerId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Community Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!providerProjects || providerProjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Community Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No community projects linked yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Community Projects
          <Badge variant="secondary" className="ml-auto">
            {providerProjects.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {providerProjects.map((link) => (
            <Card key={link.id} className="overflow-hidden">
              <div className="flex gap-4 p-4">
                {link.project?.image_path && (
                  <img
                    src={link.project.image_path}
                    alt={link.project.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-lg mb-1">
                        {link.project?.title || 'Untitled Project'}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="capitalize">
                          {link.role}
                        </Badge>
                        {link.project?.type && (
                          <Badge variant="secondary">
                            {link.project.type}
                          </Badge>
                        )}
                        {link.isFeatured && (
                          <Badge variant="default" className="bg-amber-500">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>

                    {isOwner && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            generatePortfolioFromProject.mutate({
                              projectId: link.projectId,
                              participantId: link.projectId, // This needs participant context
                            })
                          }
                          disabled={generatePortfolioFromProject.isPending}
                        >
                          <Sparkles className="h-4 w-4 mr-1" />
                          Add to Portfolio
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => unlinkProject.mutate(link.id)}
                          disabled={unlinkProject.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {link.contributionDescription && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {link.contributionDescription}
                    </p>
                  )}

                  {link.project?.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {link.project.description}
                    </p>
                  )}

                  {link.project?.tags && link.project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {link.project.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {link.project.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{link.project.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {(link.startDate || link.endDate) && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {link.startDate && new Date(link.startDate).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' })}
                      {link.startDate && link.endDate && ' - '}
                      {link.endDate && new Date(link.endDate).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

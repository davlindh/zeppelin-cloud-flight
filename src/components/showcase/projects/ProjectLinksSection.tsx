import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Globe, Play, ExternalLink } from 'lucide-react';

interface ProjectLinksSectionProps {
  links?: Array<{
    type: string;
    url: string;
  }>;
}

export const ProjectLinksSection: React.FC<ProjectLinksSectionProps> = ({
  links
}) => {
  if (!links || links.length === 0) return null;

  const getLinkIcon = (type: string) => {
    switch (type) {
      case 'github': return <Github className="h-4 w-4" />;
      case 'website': return <Globe className="h-4 w-4" />;
      case 'demo': return <Play className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getLinkLabel = (type: string) => {
    switch (type) {
      case 'github': return 'GitHub Repository';
      case 'website': return 'Projektwebbsida';
      case 'demo': return 'Live Demo';
      default: return 'Extern länk';
    }
  };

  return (
    <Card className="card-glow reveal-up stagger-4">
      <CardHeader>
        <CardTitle className="text-xl">Projektlänkar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link, index) => (
            <Button key={index} variant="outline" asChild className="btn-glow h-auto p-4 justify-start">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  {getLinkIcon(link.type)}
                </div>
                <span className="font-medium">
                  {getLinkLabel(link.type)}
                </span>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

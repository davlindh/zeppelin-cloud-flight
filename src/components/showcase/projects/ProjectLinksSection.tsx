import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, Globe, Play, ExternalLink, Link, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';

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
    const lowerType = type.toLowerCase();
    if (lowerType.includes('github')) return <Github className="h-4 w-4" />;
    if (lowerType.includes('website') || lowerType.includes('webb')) return <Globe className="h-4 w-4" />;
    if (lowerType.includes('demo')) return <Play className="h-4 w-4" />;
    if (lowerType.includes('facebook')) return <Facebook className="h-4 w-4" />;
    if (lowerType.includes('instagram')) return <Instagram className="h-4 w-4" />;
    if (lowerType.includes('youtube')) return <Youtube className="h-4 w-4" />;
    if (lowerType.includes('linkedin')) return <Linkedin className="h-4 w-4" />;
    return <ExternalLink className="h-4 w-4" />;
  };

  const getLinkLabel = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('github')) return 'GitHub Repository';
    if (lowerType.includes('website') || lowerType.includes('webb')) return 'Projektwebbsida';
    if (lowerType.includes('demo')) return 'Live Demo';
    if (lowerType.includes('facebook')) return 'Facebook';
    if (lowerType.includes('instagram')) return 'Instagram';
    if (lowerType.includes('youtube')) return 'YouTube';
    if (lowerType.includes('linkedin')) return 'LinkedIn';
    return 'Extern länk';
  };

  const getLinkColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('github')) return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    if (lowerType.includes('demo')) return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20';
    if (lowerType.includes('facebook')) return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    if (lowerType.includes('instagram')) return 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100';
    if (lowerType.includes('youtube')) return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
    if (lowerType.includes('linkedin')) return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    return 'bg-muted/50 text-foreground border-border/40 hover:bg-muted';
  };

  return (
    <Card className="card-enhanced border-0 shadow-elegant hover:shadow-glow transition-all duration-500 group">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
          <div className="p-3 rounded-xl gradient-primary shadow-soft group-hover:shadow-glow transition-all duration-300">
            <Link className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
          </div>
          Projektlänkar
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link, index) => (
            <a 
              key={index} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`group/link flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg ${getLinkColor(link.type)}`}
            >
              <div className={`p-3 rounded-lg flex-shrink-0 group-hover/link:scale-110 group-hover/link:rotate-3 transition-all duration-300 ${
                link.type.toLowerCase().includes('demo') ? 'bg-primary/20' : 'bg-background/50'
              }`}>
                {getLinkIcon(link.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm mb-1 group-hover/link:text-primary transition-colors">
                  {getLinkLabel(link.type)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {link.url.replace(/^https?:\/\//, '')}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50 group-hover/link:opacity-100 group-hover/link:scale-110 transition-all" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

import React from 'react';
import { Play, FileText, Image, Headphones, User, Calendar, ExternalLink } from 'lucide-react';

interface ParticipantMediaItem {
  type: 'portfolio' | 'video' | 'audio' | 'document' | 'image';
  category: 'featured' | 'process' | 'archive' | 'collaboration';
  url: string;
  title: string;
  description?: string;
  year?: string;
}

interface ParticipantMediaProps {
  media?: ParticipantMediaItem[];
  participantName?: string;
}

export const ParticipantMedia: React.FC<ParticipantMediaProps> = ({ 
  media = [], 
  participantName = "Deltagare" 
}) => {
  if (media.length === 0) {
    return null;
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'audio': return <Headphones className="w-4 h-4" />;
      case 'image': 
      case 'portfolio': return <Image className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'featured': return 'bg-primary/10 text-primary border-primary/20';
      case 'process': return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
      case 'archive': return 'bg-muted/10 text-muted-foreground border-muted/20';
      case 'collaboration': return 'bg-accent/10 text-accent-foreground border-accent/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'featured': return 'Utvalt';
      case 'process': return 'Process';
      case 'archive': return 'Arkiv';
      case 'collaboration': return 'Samarbete';
      default: return category;
    }
  };

  const groupedMedia = media.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ParticipantMediaItem[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">
          {participantName}s Portfolio & Media
        </h3>
      </div>
      
      {Object.entries(groupedMedia).map(([category, items]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getCategoryColor(category)}`}>
              {getCategoryLabel(category)}
            </span>
            <span className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? 'objekt' : 'objekt'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 p-4 border border-border rounded-lg hover:shadow-md hover:border-primary/20 transition-all duration-200"
              >
                <div className="flex-shrink-0 p-2 rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {getMediaIcon(item.type)}
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground capitalize">
                      {item.type}
                    </span>
                    {item.year && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {item.year}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
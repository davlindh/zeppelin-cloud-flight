import React from 'react';
import { Play, FileText, Image, Headphones } from 'lucide-react';

interface Media {
  type: 'video' | 'audio' | 'image' | 'document';
  url: string;
  title: string;
  description?: string;
}

interface ProjectMediaProps {
  media?: Media[];
}

export const ProjectMedia: React.FC<ProjectMediaProps> = ({ media = [] }) => {
  if (media.length === 0) {
    return null;
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-5 h-5" />;
      case 'audio': return <Headphones className="w-5 h-5" />;
      case 'image': return <Image className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getMediaTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800';
      case 'audio': return 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800';
      case 'image': return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800';
      case 'document': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Media & Material</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {media.map((item, index) => (
          <a
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-4 border border-border rounded-lg hover:shadow-md hover:border-primary/20 transition-all group"
          >
            <div className={`flex-shrink-0 p-2 rounded border ${getMediaTypeColor(item.type)}`}>
              {getMediaIcon(item.type)}
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2 capitalize">{item.type}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
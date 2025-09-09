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
      case 'video': return 'text-red-600 bg-red-50';
      case 'audio': return 'text-purple-600 bg-purple-50';
      case 'image': return 'text-blue-600 bg-blue-50';
      case 'document': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Media & Material</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {media.map((item, index) => (
          <a
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
          >
            <div className={`flex-shrink-0 p-2 rounded ${getMediaTypeColor(item.type)}`}>
              {getMediaIcon(item.type)}
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-2 capitalize">{item.type}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
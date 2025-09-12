import React, { useState } from 'react';
import { Play, FileText, Image, Headphones, ExternalLink, Grid, List, Filter } from 'lucide-react';

interface Media {
  type: 'video' | 'audio' | 'image' | 'document';
  url: string;
  title: string;
  description?: string;
}

interface EnhancedProjectMediaProps {
  media?: Media[];
  showPreview?: boolean;
  allowCategorization?: boolean;
}

export const EnhancedProjectMedia: React.FC<EnhancedProjectMediaProps> = ({ 
  media = [], 
  showPreview = true,
  allowCategorization = true 
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<string>('all');

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
      case 'document': return 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800';
      default: return 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getMediaTypeName = (type: string) => {
    switch (type) {
      case 'video': return 'Video';
      case 'audio': return 'Ljud';
      case 'image': return 'Bild';
      case 'document': return 'Dokument';
      default: return type;
    }
  };

  const filteredMedia = filter === 'all' 
    ? media 
    : media.filter(item => item.type === filter);

  const mediaTypes = [...new Set(media.map(item => item.type))];

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-foreground">Media & Material</h3>
        
        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          {allowCategorization && mediaTypes.length > 1 && (
            <div className="flex items-center gap-1">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm bg-background border border-border rounded-md px-2 py-1 text-foreground"
              >
                <option value="all">Alla ({media.length})</option>
                {mediaTypes.map(type => (
                  <option key={type} value={type}>
                    {getMediaTypeName(type)} ({media.filter(m => m.type === type).length})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* View mode toggle */}
          <div className="flex border border-border rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-l-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-r-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Media grid/list */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "space-y-3"
      }>
        {filteredMedia.map((item, index) => (
          <a
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group border border-border rounded-lg hover:shadow-md hover:border-primary/20 transition-all duration-200 ${
              viewMode === 'grid' 
                ? 'flex flex-col' 
                : 'flex items-start gap-4 p-4'
            }`}
          >
            {viewMode === 'grid' ? (
              <>
                {/* Grid view */}
                {showPreview && item.type === 'image' && (
                  <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                    <img 
                      src={item.url} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  </div>
                )}
                
                <div className="p-4 flex-grow">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className={`flex-shrink-0 p-2 rounded-md border ${getMediaTypeColor(item.type)}`}>
                      {getMediaIcon(item.type)}
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                    {item.title}
                  </h4>
                  
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {item.description}
                    </p>
                  )}
                  
                  <span className="text-xs text-muted-foreground capitalize">
                    {getMediaTypeName(item.type)}
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* List view */}
                <div className={`flex-shrink-0 p-3 rounded-md border ${getMediaTypeColor(item.type)}`}>
                  {getMediaIcon(item.type)}
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  <span className="text-xs text-muted-foreground mt-2 capitalize">
                    {getMediaTypeName(item.type)}
                  </span>
                </div>
              </>
            )}
          </a>
        ))}
      </div>

      {filteredMedia.length === 0 && filter !== 'all' && (
        <div className="text-center py-8 text-muted-foreground">
          <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Inga mediafiler av typ "{getMediaTypeName(filter)}" hittades.</p>
          <button 
            onClick={() => setFilter('all')}
            className="text-primary hover:underline mt-1"
          >
            Visa alla mediafiler
          </button>
        </div>
      )}
    </div>
  );
};
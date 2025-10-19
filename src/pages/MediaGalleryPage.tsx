import React from 'react';
import { UnifiedMediaManager } from '@/components/media/UnifiedMediaManager';
import { ImageIcon, Video, Music } from 'lucide-react';

const MediaGalleryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/30">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center space-y-6">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-primary/5 rounded-full border border-primary/10">
            <ImageIcon className="w-5 h-5 text-primary" />
            <Video className="w-5 h-5 text-primary" />
            <Music className="w-5 h-5 text-primary" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-foreground mb-4 animate-fade-in">
            Mediagalleri från Zeppel Inn
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Utforska bilder, videor och annat material som deltagare har delat från våra evenemang. 
            <span className="block mt-2 text-primary/80 font-medium">
              Varje bidrag berättar en del av vår gemensamma berättelse.
            </span>
          </p>
        </div>
        
        {/* Gallery */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <UnifiedMediaManager
            mode="public"
            entityType="global"
            showFilters={true}
            showUpload={false}
            showLinking={false}
          />
        </div>
      </div>
    </div>
  );
};

export default MediaGalleryPage;
import React from 'react';
import { PublicMediaGallery } from '@/components/public/PublicMediaGallery';

const MediaGalleryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-gray-800 mb-4">
            Mediagalleri från Zeppel Inn
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Utforska bilder, videor och andra material som deltagare har delat från våra evenemang. 
            Varje bidrag berättar en del av vår gemensamma berättelse.
          </p>
        </div>
        
        <PublicMediaGallery />
      </div>
    </div>
  );
};

export default MediaGalleryPage;
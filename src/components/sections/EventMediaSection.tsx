import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PublicMediaUpload } from '@/components/public/PublicMediaUpload';
import { Upload, Camera, Video, Music, FileText, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const EventMediaSection: React.FC = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);

  const mediaTypes = [
    {
      icon: Camera,
      title: 'Foton',
      description: 'Bilder från eventet, workshops och presentationer',
      color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800'
    },
    {
      icon: Video,
      title: 'Videor',
      description: 'Inspelningar från föreläsningar och aktiviteter',
      color: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800'
    },
    {
      icon: Music,
      title: 'Ljud',
      description: 'Ljudinspelningar och podcastavsnitt',
      color: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800'
    },
    {
      icon: FileText,
      title: 'Dokument',
      description: 'Presentationer, rapport er och skrifter',
      color: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800'
    }
  ];

  return (
    <>
      <section
        className="py-12 sm:py-20 md:py-32 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100"
        aria-labelledby="media-upload-title"
        id="media-upload"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2
                  id="media-upload-title"
                  className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-gray-800 mb-6 leading-tight"
                >
                  Dela dina minnen från eventet
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Har du foton, videor eller andra material från Zeppel Inn-eventet? 
                  Dela med dig av dina upplevelser och hjälp oss bygga en gemensam berättelse.
                </p>
              </motion.div>
            </div>

            {/* Media Types Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {mediaTypes.map((type, index) => (
                <motion.div
                  key={type.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`p-6 rounded-xl border-2 ${type.color} hover:shadow-lg transition-all duration-200 hover:scale-105`}
                >
                  <div className="flex flex-col items-center text-center">
                    <type.icon className="w-8 h-8 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">{type.title}</h3>
                    <p className="text-sm opacity-80">{type.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Upload Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/90 backdrop-blur-md border border-purple-200 rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                Ladda upp ditt material
              </h3>
              
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Dina bidrag granskas av vårt team innan de publiceras. Vi accepterar bilder, videor, 
                ljudfiler och dokument upp till 50MB per fil.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
                <Button
                  onClick={() => setShowUploadForm(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Ladda upp material
                </Button>
                
                <Link to="/media">
                  <Button
                    variant="outline"
                    className="border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-full font-semibold transition-all duration-200"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Se galleri
                  </Button>
                </Link>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 max-w-3xl mx-auto">
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Kostnadsfritt att dela
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Snabb granskning
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Säker uppladdning
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Upload Form Dialog */}
      <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
        <DialogContent size="xl" className="max-h-[90vh] overflow-y-auto">
          <PublicMediaUpload
            onClose={() => setShowUploadForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
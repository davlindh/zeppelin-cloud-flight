import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Ship, Atom } from 'lucide-react';

export const VisionSection: React.FC = () => {
    return (
        <section id="vision" className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">Framtiden börjar i Karlskronas skärgård</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4 mb-6">
                        Föreställ dig en plats där historiens vingslag möter framtidens innovationer. Där barockens praktfulla byggnader och den vidsträckta skärgården blir scenen för konstnärer, teknologer och visionärer som tillsammans utforskar vad som händer när tradition möter transformation.
                    </p>
                    <p className="text-base text-gray-700 max-w-2xl mx-auto">
                        Zeppel Inn är inte bara ett evenemang – det är en rörelse. En två veckor lång resa där vi omvandlar djup kunskap till meningsfull handling och etablerar Karlskrona som en internationell ledstjärna för hållbar, konstnärlig och teknologisk utveckling.
                    </p>
                    <div className="flex justify-center gap-4 mt-8">
                        <Badge variant="secondary" className="flex items-center gap-2">
                            <Ship className="h-4 w-4" /> Kulturarv
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-2">
                            <Atom className="h-4 w-4" /> Teknologi
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" /> Innovation
                        </Badge>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

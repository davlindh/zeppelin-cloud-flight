import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Ship, Atom } from 'lucide-react';

export const VisionSection: React.FC = () => {
    return (
        <section id="vision" className="py-20 md:py-32 bg-white">
            <div className="container mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">En Vision för Karlskrona</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
                        Zeppel Inn är mer än ett evenemang – det är en levande manifestation av vår metodik att omvandla djup kunskap till meningsfull, praktisk handling. Vi etablerar Karlskrona som en internationell knutpunkt för konst, teknologi och hållbar innovation. Kärnan är en två veckor lång residensverksamhet där vi utforskar skärningspunkten mellan vårt kulturarv, den unika skärgårdsnaturen och framtidens teknologier.
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

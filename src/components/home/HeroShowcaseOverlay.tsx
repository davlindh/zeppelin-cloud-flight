import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCampaignsWithEvaluation } from '@/hooks/funding/useCampaignsWithEvaluation';
import { useEvents } from '@/hooks/useEvents';

interface HeroShowcaseOverlayProps {
  className?: string;
}

export const HeroShowcaseOverlay: React.FC<HeroShowcaseOverlayProps> = ({ className }) => {
  // Fetch featured campaign
  const { data: campaigns } = useCampaignsWithEvaluation({
    status: ['active'],
    visibility: 'public',
  });

  // Fetch upcoming published events only
  const { data: events } = useEvents({ status: 'published' });

  const featuredCampaign = React.useMemo(() => {
    if (!campaigns || campaigns.length === 0) return null;
    // Get the top campaign by ECKT score
    return [...campaigns]
      .sort((a, b) => {
        const aEckt = a.evaluation_summary?.weighted_eckt || 0;
        const bEckt = b.evaluation_summary?.weighted_eckt || 0;
        return bEckt - aEckt;
      })[0];
  }, [campaigns]);

  const upcomingEvent = React.useMemo(() => {
    if (!events || events.length === 0) return null;
    // Get the nearest upcoming event
    const now = new Date();
    return events
      .filter(e => new Date(e.starts_at) > now)
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0];
  }, [events]);

  // Don't render if no content
  if (!featuredCampaign && !upcomingEvent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className={`absolute bottom-8 right-8 max-w-sm hidden lg:block ${className}`}
    >
      <div className="space-y-3">
        {/* Featured Campaign Card */}
        {featuredCampaign && (
          <Link to={`/campaigns/${featuredCampaign.id}`}>
            <Card className="bg-white/95 backdrop-blur-md border-white/30 hover:shadow-xl transition-all duration-300 hover:scale-102 group cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge variant="secondary" className="mb-1 text-xs bg-amber-100 text-amber-700 border-amber-200">
                      Aktuellt projekt
                    </Badge>
                    <h4 className="font-semibold text-gray-800 text-sm leading-tight truncate group-hover:text-amber-700 transition-colors">
                      {featuredCampaign.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {featuredCampaign.description?.slice(0, 60)}...
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-amber-600 text-xs font-medium">
                      Se mer
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Upcoming Event Card */}
        {upcomingEvent && (
          <Link to={`/events/${upcomingEvent.slug || upcomingEvent.id}`}>
            <Card className="bg-white/95 backdrop-blur-md border-white/30 hover:shadow-xl transition-all duration-300 hover:scale-102 group cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex-shrink-0">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge variant="secondary" className="mb-1 text-xs bg-blue-100 text-blue-700 border-blue-200">
                      Kommande event
                    </Badge>
                    <h4 className="font-semibold text-gray-800 text-sm leading-tight truncate group-hover:text-blue-700 transition-colors">
                      {upcomingEvent.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(upcomingEvent.starts_at).toLocaleDateString('sv-SE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-blue-600 text-xs font-medium">
                      Se detaljer
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </motion.div>
  );
};

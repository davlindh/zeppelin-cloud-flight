import React, { useState, useEffect } from 'react';
import { useHomePage, useHomePageStats, useHomePageSections } from '@/contexts/HomePageContext';
import { Card, CardHeader, CardTitle, CardContent , Button } from '@/components/ui';

import { Badge, BadgeSuccess, BadgeWarning, BadgeInfo } from '@/components/ui/badge';
import { EnhancedImage } from '@/components/multimedia/EnhancedImage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ParticipantApplicationForm } from '@/components/public/forms';
import { PublicMediaUpload } from '@/components/public/PublicMediaUpload';
// Import section components - Swedish content
import { motion } from 'framer-motion';
import { Users, FolderOpen, Building, Calendar, ChevronDown, ChevronUp, Sparkles, Zap, Shield, Heart } from 'lucide-react';
import { VisionSection } from '@/components/sections/VisionSection';
import { SystematicsSection } from '@/components/sections/SystematicsSection';
import { EngagementSection } from '@/components/sections/EngagementSection';
import { PartnerSection } from '@/components/sections/PartnerSection';
import { EventMediaSection } from '@/components/sections/EventMediaSection';

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, description, trend }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value.toLocaleString()}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            <div className="text-primary/60">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Section Navigation Component
interface SectionNavigationProps {
  sections: Array<{ id: string; title: string; isVisible: boolean }>;
  currentSection: string;
  onSectionClick: (sectionId: string) => void;
}

const SectionNavigation: React.FC<SectionNavigationProps> = ({
  sections,
  currentSection,
  onSectionClick,
}) => {
  const getStoryTitle = (sectionId: string) => {
    const storyMap: Record<string, string> = {
      'hero': '🏠 Start',
      'partner': '🤝 Våra Partners',
      'engagement': '💫 Bli Delaktig',
      'vision': '🌟 Vår Vision',
      'media-upload': '📸 Dela Upplevelser',
      'systematics': '🔄 Resan från tanke till transformation'
    };
    return storyMap[sectionId] || sectionId;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block"
    >
      <Card className="p-3 bg-white/95 backdrop-blur-sm border-2 border-blue-200 shadow-xl">
        <div className="mb-3 text-center">
          <h3 className="text-sm font-bold text-gray-800">Resan genom Zeppel Inn</h3>
          <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-1"></div>
        </div>
        <div className="space-y-1">
          {sections
            .filter(section => section.isVisible)
            .map((section, index) => (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentSection === section.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md transform scale-105'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-60">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-xs">{getStoryTitle(section.id)}</span>
                </div>
              </button>
            ))}
        </div>
      </Card>
    </motion.div>
  );
};

// Scroll Progress Component
interface ScrollProgressProps {
  progress: number;
}

const ScrollProgress: React.FC<ScrollProgressProps> = ({ progress }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted"
    >
      <motion.div
        className="h-full bg-primary"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </motion.div>
  );
};

// Main HomePageLayout Component with Compound Pattern
interface HomePageLayoutProps {
  children?: React.ReactNode;
  showStats?: boolean;
  showNavigation?: boolean;
  showProgress?: boolean;
}

const HomePageLayout: React.FC<HomePageLayoutProps> = ({
  children,
  showStats = true,
  showNavigation = true,
  showProgress = true,
}) => {
  const { state } = useHomePage();
  const stats = useHomePageStats();
  const { sections, currentSection, setCurrentSection } = useHomePageSections();
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const { toast } = useToast();

  // Calculate scroll progress
  const scrollProgress = Math.min((state.scrollPosition / (document.body.scrollHeight - window.innerHeight)) * 100, 100);

  // Handle section navigation
  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setCurrentSection(sectionId);
    }
  };

  // Handle feature demonstration
  const handleFeatureClick = (feature: string) => {
    toast({
      title: `${feature} Feature`,
      description: `You've clicked on the ${feature} feature! This demonstrates our Context7-compliant components.`,
      variant: 'success',
    });
  };

  // Handle submission form
  const handleSubmissionClick = () => {
    setShowSubmissionForm(true);
  };

  return (
    <>
      {/* Scroll Progress */}
      {showProgress && <ScrollProgress progress={scrollProgress} />}

      {/* Section Navigation */}
      {showNavigation && (
        <SectionNavigation
          sections={sections}
          currentSection={currentSection}
          onSectionClick={handleSectionClick}
        />
      )}



      {/* Main Content */}
      <div className="relative">
        {children || (
          <div className="space-y-24">
            {/* Hero Section */}
            <section id="hero" className="py-16 sm:py-24 md:py-32 text-white min-h-screen flex items-center bg-cover bg-center relative overflow-hidden"
              style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4)), url('https://paywaomkmjssbtkzwnwd.supabase.co/storage/v1/object/public/media-files/media/1758057034630-b24da01qzrd.jpg')" }}>
              <div className="container mx-auto px-6 text-center md:text-left md:w-2/3 lg:w-1/2 relative z-10">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7 }}
                >
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-2 font-serif">
                    Zeppel Inn
                  </h1>
                  <h2 className="text-2xl md:text-3xl font-light mb-6 opacity-90">
                    Där historiens själ möter framtidens vision
                  </h2>
                  <p className="text-lg md:text-xl font-light mb-4 opacity-90 leading-relaxed">
                    I hjärtat av Karlskronas skärgård väcks drömmar till liv. Här, där barockens prakt möter digital innovation, skapar vi berättelser som överbryggar generationer och discipliner.
                  </p>
                  <p className="text-base md:text-lg font-light mb-8 opacity-80 leading-relaxed">
                    Välkommen till en plats där konstnärer, teknologer och visionärer tillsammans utforskar vad som händer när tradition möter transformation.
                  </p>
                  <Button
                    onClick={() => handleSectionClick('partner')}
                    className="hover:scale-105 transition-transform duration-300"
                  >
                    Se våra partners
                  </Button>
                </motion.div>
              </div>
            </section>

            {/* Compact Media Upload Section - Moved up for engagement */}
            <section id="media-upload" className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100">
              <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md border border-purple-200 rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
                  <div className="text-center">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-gray-800 mb-3 sm:mb-4 leading-tight">
                      Bli en del av vår gemensamma berättelse
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-4 leading-relaxed">
                      Varje ögonblick, varje upptäckt, varje möte vid Zeppel Inn är en del av en större berättelse om innovation och kreativitet.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-4">
                      <Button
                        onClick={() => setShowSubmissionForm(true)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                      >
                        Bli en del av Zeppel Inn idag
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowUploadForm(true)}
                        className="border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 px-6 py-2 rounded-full font-semibold transition-all duration-200"
                      >
                        Ladda upp material
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Partner + Stats Section - Moved up for credibility */}
            <PartnerSection />

            {/* Stats Section - Integrated with partners for social proof */}
            {showStats && (
              <section className="py-12 bg-muted/30">
                <div className="container mx-auto px-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsCard
                      title="Participants"
                      value={stats.totalParticipants}
                      icon={<Users className="h-6 w-6" />}
                      description="Active contributors"
                    />
                    <StatsCard
                      title="Projects"
                      value={stats.totalProjects}
                      icon={<FolderOpen className="h-6 w-6" />}
                      description="Showcase items"
                    />
                    <StatsCard
                      title="Partners"
                      value={stats.totalPartners}
                      icon={<Building className="h-6 w-6" />}
                      description="Supporting organizations"
                    />
                    <StatsCard
                      title="Events"
                      value={stats.upcomingEvents}
                      icon={<Calendar className="h-6 w-6" />}
                      description="Upcoming activities"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Systematics Section - Methodology before engagement */}
            <SystematicsSection />

            {/* Engagement Section - Call to action after methodology */}
            <EngagementSection />

            {/* Vision Section - Deeper storytelling */}
            <VisionSection />

            {/* Event Media Upload Section */}
            <EventMediaSection />
          </div>
        )}
      </div>

      {/* Feature Dialog */}
      <Dialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
        <DialogContent size="lg">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Enhanced Image Component
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• Lazy loading with intersection observer</li>
                  <li>• Progressive enhancement</li>
                  <li>• Error handling and fallbacks</li>
                  <li>• Full accessibility support</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  Badge System
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• Multiple variants and sizes</li>
                  <li>• Interactive and removable badges</li>
                  <li>• Animation support</li>
                  <li>• Accessibility compliant</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  Dialog System
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• Fully accessible modals</li>
                  <li>• Keyboard navigation</li>
                  <li>• Focus management</li>
                  <li>• Portal-based rendering</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Toast Notifications
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• Global state management</li>
                  <li>• Auto-dismiss functionality</li>
                  <li>• Multiple variants</li>
                  <li>• Progress indicators</li>
                </ul>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h5 className="font-medium mb-2">Context7 Compliance</h5>
              <p className="text-sm text-muted-foreground">
                All components follow Context7 best practices with 100% TypeScript accuracy,
                comprehensive accessibility features, and modern React patterns.
              </p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button onClick={() => {
              toast({
                title: 'Thank you!',
                description: 'Thanks for exploring our Context7 components!',
                variant: 'success',
              });
              setShowFeatureDialog(false);
            }}>
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submission Form Dialog */}
      <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
        <DialogContent>
          <ParticipantApplicationForm
            onClose={() => setShowSubmissionForm(false)}
          />
        </DialogContent>
      </Dialog>

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

// Compound Components for HomePageLayout
interface HomePageLayoutComposition {
  Stats: React.FC<{ children?: React.ReactNode }>;
  Navigation: React.FC<{ children?: React.ReactNode }>;
  Content: React.FC<{ children?: React.ReactNode }>;
  Section: React.FC<HomePageSectionProps>;
}

// Section Component
interface HomePageSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  background?: string;
}

const HomePageSection: React.FC<HomePageSectionProps> = ({
  id,
  title,
  children,
  className = '',
  background,
}) => {
  return (
    <section
      id={id}
      aria-label={`${title} section`}
      className={`py-12 sm:py-20 md:py-32 ${className}`}
      style={background ? { backgroundImage: background } : undefined}
    >
      <div className="container mx-auto px-4 sm:px-6">
        {children}
      </div>
    </section>
  );
};

// Stats Sub-component
const HomePageStats: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const stats = useHomePageStats();

  if (children) return <>{children}</>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatsCard
        title="Participants"
        value={stats.totalParticipants}
        icon={<Users className="h-6 w-6" />}
      />
      <StatsCard
        title="Projects"
        value={stats.totalProjects}
        icon={<FolderOpen className="h-6 w-6" />}
      />
      <StatsCard
        title="Partners"
        value={stats.totalPartners}
        icon={<Building className="h-6 w-6" />}
      />
      <StatsCard
        title="Events"
        value={stats.upcomingEvents}
        icon={<Calendar className="h-6 w-6" />}
      />
    </div>
  );
};

// Navigation Sub-component
const HomePageNavigation: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { sections, currentSection, setCurrentSection } = useHomePageSections();

  if (children) return <>{children}</>;

  return (
    <SectionNavigation
      sections={sections}
      currentSection={currentSection}
      onSectionClick={(sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          setCurrentSection(sectionId);
        }
      }}
    />
  );
};

// Content Sub-component
const HomePageContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  if (children) return <>{children}</>;

  return (
    <div className="space-y-12">
      {/* Placeholder content - section components can be added here */}
      <div className="text-center py-12">
        <h3 className="text-2xl font-bold mb-4">Advanced React Patterns Demo</h3>
        <p className="text-muted-foreground">
          This demonstrates compound components, render props, and advanced state management patterns.
        </p>
      </div>
    </div>
  );
};

// Assign compound components
const HomePageLayoutWithComposition = Object.assign(HomePageLayout, {
  Stats: HomePageStats,
  Navigation: HomePageNavigation,
  Content: HomePageContent,
  Section: HomePageSection,
});

export {
  HomePageLayoutWithComposition as HomePageLayout,
  StatsCard,
  SectionNavigation,
  ScrollProgress,
  HomePageStats,
  HomePageNavigation,
  HomePageContent,
  HomePageSection,
};

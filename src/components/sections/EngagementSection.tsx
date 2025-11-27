import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ParticipantApplicationForm } from '@/components/public/forms';
import { WaitlistForm } from '@/components/public/WaitlistForm';
import { VolunteerChecklistDialog } from '@/components/public/VolunteerChecklistForm';
import { Zap, HandHeart, Eye, ArrowRight } from 'lucide-react';

export const EngagementSection: React.FC = () => {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const navigate = useNavigate();

  const handleJoinClick = () => {
    setShowSubmissionForm(true);
  };

  const handleProjectsClick = () => {
    navigate('/showcase');
  };

  return (
    <>
      <section
        className="py-16 sm:py-24 md:py-32 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 relative overflow-hidden"
        aria-labelledby="engagement-title"
        id="engagement"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-400 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-teal-400 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-400 rounded-full blur-xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Main Engagement Card */}
            <div className="bg-white/95 backdrop-blur-md border border-emerald-200 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 mb-8">
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h2
                    id="engagement-title"
                    className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-gray-800 mb-4 sm:mb-6 leading-tight"
                  >
                    Bli en del av berättelsen som förändrar Karlskrona
                  </h2>
                </div>

                <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-4 leading-relaxed px-4">
                  Varje projekt, varje idé, varje möte hos Zeppel Inn bidrar till att väva samman Karlskronas rika kulturarv med framtidens innovationer.
                  Tillsammans skapar vi inte bara konst och teknologi – vi bygger en levande berättelse om vad som är möjligt när kreativitet möter engagemang.
                </p>

                <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl p-4 mb-6 sm:mb-8 border-l-4 border-emerald-500">
                  <p className="text-sm sm:text-base text-emerald-700 font-medium italic">
                    "Här förvandlas drömmar till verklighet, en penseldrag, en kodrad, en idé i taget."
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
                  <Button
                    variant="default"
                    onClick={handleJoinClick}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    Bli en del av Zeppel Inn idag
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleProjectsClick}
                    className="border-2 border-emerald-300 text-emerald-600 hover:bg-emerald-50 px-8 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Se pågående projekt
                  </Button>
                </div>
              </div>
            </div>

            {/* Two-Column: Waitlist + Volunteer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Waitlist Section */}
              <WaitlistForm 
                context="residency"
                title="Pinga mig när ansökan öppnar"
                description="Nästa ansökningsperiod till Zeppel Inn Residenset öppnar snart."
              />

              {/* Volunteer Section */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-full">
                    <HandHeart className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Bidra med din tid</h3>
                    <p className="text-sm text-gray-600">Du behöver inte vara expert – alla bidrag räknas!</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {['Snickra', 'Köra båt', 'Laga mat', 'Dokumentera', 'Koda'].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-white rounded-full text-sm text-emerald-700 border border-emerald-200"
                    >
                      {skill}
                    </span>
                  ))}
                  <span className="px-3 py-1 bg-emerald-100 rounded-full text-sm text-emerald-700 font-medium">
                    +mer...
                  </span>
                </div>

                <Button
                  onClick={() => setShowVolunteerForm(true)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium"
                >
                  <HandHeart className="w-4 h-4 mr-2" />
                  Jag vill hjälpa till
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm max-w-xl mx-auto">
              <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                <span className="text-gray-700 font-medium">Partneransökningar öppna</span>
              </div>
              <div className="flex items-center justify-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                <span className="w-3 h-3 bg-amber-500 rounded-full mr-3"></span>
                <span className="text-gray-700 font-medium">Deltagare – öppnar snart</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Participant Application Dialog */}
      <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <ParticipantApplicationForm
            onClose={() => setShowSubmissionForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Volunteer Dialog */}
      <VolunteerChecklistDialog
        open={showVolunteerForm}
        onOpenChange={setShowVolunteerForm}
      />
    </>
  );
};

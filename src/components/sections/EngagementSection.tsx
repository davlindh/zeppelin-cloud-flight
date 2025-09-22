import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ParticipantApplicationForm } from '@/components/public/forms';

export const EngagementSection: React.FC = () => {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
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
          <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-md border border-emerald-200 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12">
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
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

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 sm:mb-10">
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
                  Se pågående projekt
                </Button>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 max-w-3xl mx-auto shadow-lg border border-emerald-100">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mr-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Kommer snart</h3>
                </div>

                <p className="text-sm sm:text-base text-gray-600 mb-6 px-4 leading-relaxed">
                  Nästa ansökningsperiod till Zeppel Inn Residenset öppnar inom kort. Säkerställa din plats i denna unika kreativa satsning i Karlskronas skärgård.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    <span className="text-gray-700 font-medium">Partneransökningar öppna</span>
                  </div>
                  <div className="flex items-center justify-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="w-3 h-3 bg-amber-500 rounded-full mr-3"></span>
                    <span className="text-gray-700 font-medium">Deltagare</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
        <DialogContent>
          <ParticipantApplicationForm
            onClose={() => setShowSubmissionForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ComprehensiveSubmissionForm } from '@/components/public/ComprehensiveSubmissionForm';

export const EngagementSection: React.FC = () => {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const handleJoinClick = () => {
    setShowSubmissionForm(true);
  };

  return (
    <>
      <section
        className="py-12 sm:py-20 md:py-32 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100"
        aria-labelledby="engagement-title"
        id="engagement"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md border border-blue-200 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12">
            <div className="text-center">
              <h2
                id="engagement-title"
                className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-gray-800 mb-4 sm:mb-6 leading-tight"
              >
                Vill du forma framtiden tillsammans med oss?
              </h2>

              <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-4 leading-relaxed px-4">
                Zeppel Inn samlar konstnärer, teknologer och samhällsbyggare i Karlskronas skärgård.
                Här gör vi kunskap till handling – och handling till framtid.
              </p>

              <p className="text-sm sm:text-base text-blue-600 font-medium mb-6 sm:mb-8">
                "Från forskning till handling – och från handling till framtid."
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6 sm:mb-8">
                <Button
                  variant="default"
                  onClick={handleJoinClick}
                  className="hover:scale-105 transition-transform duration-200"
                >
                  Bli en del av Zeppel Inn idag
                </Button>

                <Button
                  variant="secondary"
                  // to="/showcase" // Removed 'to' prop as Button component might not support it directly
                  className="hover:scale-105 transition-transform duration-200"
                >
                  Se pågående projekt
                </Button>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 max-w-2xl mx-auto shadow-lg border border-amber-100">
                <div className="flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 text-amber-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Kommer snart</h3>
                </div>

                <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
                  Nästa ansökningsperiod till Zeppel Inn Residenset öppnar inom kort. Säkerställa din plats i denna unika kreativa satsning i Karlskronas skärgård.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center text-xs sm:text-sm text-gray-500 gap-2 sm:gap-4">
                  <span className="flex items-center mr-4">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Partneransökningar öppna
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    Deltagare
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
        <DialogContent size="xl">
          <ComprehensiveSubmissionForm
            onClose={() => setShowSubmissionForm(false)}
            initialType="participant"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

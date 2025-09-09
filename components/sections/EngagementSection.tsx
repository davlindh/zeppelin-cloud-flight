import React, { useState } from 'react';
import { Button } from '../ui';
import { Modal } from '../ui';

export const EngagementSection: React.FC = () => {
  const [showInterestModal, setShowInterestModal] = useState(false);

  const handleJoinClick = () => {
    setShowInterestModal(true);
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
                  variant="primary"
                  onClick={handleJoinClick}
                  className="hover:scale-105 transition-transform duration-200"
                >
                  Bli en del av Zeppel Inn idag
                </Button>

                <Button
                  variant="secondary"
                  to="/showcase"
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

      <Modal
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
      >
        <div className="space-y-6">
          <h2 className="text-3xl font-bold font-serif text-gray-800">
            Bli en del av Zeppel Inn-residen
          </h2>

          <p className="text-gray-600">
            Anmäl ditt intresse att delta i denna unika konstnärliga och teknologiska satsning i Karlskronas skärgård. Vi söker konstnärer, teknologer, samhällsbyggare och partners.
          </p>

          <div className="bg-amber-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Vad vi erbjuder</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Tvärvetenskapliga workshops och kollaborationer</li>
              <li>• Tillgång till unika lokaliteter i skärgården</li>
              <li>• Nätverksmöjligheter med internationella deltagare</li>
              <li>• Presentation av ditt arbete för allmänheten</li>
              <li>• Teknisk och konstnärlig laboratoriemoment</li>
            </ul>
          </div>

          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Namn</label>
                <input
                  type="text"
                  placeholder="Ditt namn"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="din@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jag är...</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">Välj din roll/start</option>
                <option value="artist">Konstnär/Artistäg</option>
                <option value="technologist">Teknolog/Forskare</option>
                <option value="sociologist">Samhällsbyggare/Forskare</option>
                <option value="partner">Partner/Organisation</option>
                <option value="facilitator">Workshop-ledare</option>
                <option value="other">Annat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Berätta om din bakgrund och varför du vill delta</label>
              <textarea
                rows={4}
                placeholder="Berätta kort om dina erfarenheter, intresseområden och hur du kan bidra till Zeppel Inn..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              ></textarea>
            </div>

            <Button variant="primary" className="w-full">
              Skicka intresseanmälan
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center">
            Vi behandlar dina uppgifter konfidentiellt och kontaktar dig inom 2 veckor med mer information om kommande ansökningsperioder.
          </p>
        </div>
      </Modal>
    </>
  );
};

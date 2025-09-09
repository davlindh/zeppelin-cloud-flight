import React from 'react';

const SystemStep: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="text-center p-6">
        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-white shadow-md mb-6 mx-auto border-4 border-gray-200">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{children}</p>
    </div>
);

export const SystematicsSection: React.FC = () => {
    return (
        <section id="systematik" className="py-20 md:py-32 bg-gray-100">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12 md:mb-20">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">Vår Systematik: Från Forskning till Handling</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">Vår styrka ligger i hur vi tänker. Vi använder en rigorös trestegsmodell för att omvandla komplex kunskap till mätbar, meningsfull handling. Zeppel Inn är den levande arenan där denna systematik blir verklighet.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-10">
                    <SystemStep
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>}
                        title="1. Kunskapsdomänen"
                    >
                        Allt börjar med en grund av verifierad kunskap. Vi analyserar och utvärderar information – från akademisk forskning till lokala berättelser – för att säkerställa dess noggrannhet, relevans och trovärdighet.
                    </SystemStep>
                    <SystemStep
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>}
                        title="2. Operationella Domänen"
                    >
                        Här översätter vi den validerade kunskapen till konkreta, testbara modeller och strategier. Vi utvecklar handlingskraftiga ramverk som kan appliceras i verkliga scenarier.
                    </SystemStep>
                    <SystemStep
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>}
                        title="3. Kommunikationsdomänen"
                    >
                        För att verklig förändring ska ske måste den kommuniceras. Vi skapar tydliga, övertygande narrativ som överbryggar klyftan mellan experter, beslutsfattare och allmänhet.
                    </SystemStep>
                </div>
            </div>
        </section>
    );
};

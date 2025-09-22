import React from 'react';
import { Book, Beaker, Megaphone } from 'lucide-react';

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
        <section id="systematik" className="py-16 md:py-24 bg-gray-100">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12 md:mb-20">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">Resan från tanke till transformation</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4 mb-4">Varje stor förändring börjar med en metod. Vår trestegsmodell är inte bara en process – den är en filosofi som vägleder oss från abstrakta idéer till konkreta resultat som förändrar samhällen.</p>
                    <p className="text-base text-gray-700 max-w-2xl mx-auto">I Zeppel Inn blir denna systematik levande konst, där varje steg i processen bidrar till att skapa något större än summan av dess delar.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-10">
                    <SystemStep
                        icon={<Book className="h-10 w-10 text-gray-700" />}
                        title="1. Kunskapsdomänen"
                    >
                        <p className="mb-3">Allt börjar med en grund av verifierad kunskap.</p>
                        <p className="text-sm">Vi analyserar och utvärderar information – från akademisk forskning till lokala berättelser – för att säkerställa dess noggrannhet, relevans och trovärdighet.</p>
                    </SystemStep>
                    <SystemStep
                        icon={<Beaker className="h-10 w-10 text-gray-700" />}
                        title="2. Operationella Domänen"
                    >
                        <p className="mb-3">Här översätter vi den validerade kunskapen till konkreta, testbara modeller och strategier.</p>
                        <p className="text-sm">Vi utvecklar handlingskraftiga ramverk som kan appliceras i verkliga scenarier.</p>
                    </SystemStep>
                    <SystemStep
                        icon={<Megaphone className="h-10 w-10 text-gray-700" />}
                        title="3. Kommunikationsdomänen"
                    >
                        <p className="mb-3">För att verklig förändring ska ske måste den kommuniceras.</p>
                        <p className="text-sm">Vi skapar tydliga, övertygande narrativ som överbryggar klyftan mellan experter, beslutsfattare och allmänhet.</p>
                    </SystemStep>
                </div>
            </div>
        </section>
    );
};

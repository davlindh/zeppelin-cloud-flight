
import React from 'react';

const ButtonPrimary: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} className="bg-amber-400 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-500 transition-all duration-300 transform hover:scale-105 inline-block text-center">
        {children}
    </a>
);

const ButtonSecondary: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} className="bg-white text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-sm inline-block text-center">
        {children}
    </a>
);

export const Hero: React.FC = () => {
    return (
        <section 
            className="text-white min-h-screen flex items-center bg-cover bg-center" 
            style={{ backgroundImage: "linear-gradient(rgba(20, 30, 40, 0.7), rgba(20, 30, 40, 0.7)), url('https://picsum.photos/seed/hero/1920/1080')" }}
        >
            <div className="container mx-auto px-6 text-left md:w-2/3 lg:w-1/2">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4 font-serif">Zeppel Inn</h1>
                <p className="text-xl md:text-2xl font-serif mb-8">Där kunskap blir handling. En arena för konst, teknologi och samhällsutveckling, förankrad i Karlskrona skärgårds unika landskap av granit och hav.</p>
                <div className="flex flex-col sm:flex-row justify-start items-start gap-4">
                    <ButtonPrimary href="#showcase">Utforska Showcase</ButtonPrimary>
                    <ButtonSecondary href="#partner">Våra Partners</ButtonSecondary>
                </div>
            </div>
        </section>
    );
};

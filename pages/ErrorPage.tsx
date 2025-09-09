import React from 'react';
import { useRouteError, Link, isRouteErrorResponse } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export const ErrorPage: React.FC = () => {
    const error = useRouteError();
    console.error(error);

    let errorStatus = "Error";
    let errorMessage = "Ett oväntat fel har inträffat.";

    if (isRouteErrorResponse(error)) {
        errorStatus = `${error.status}`;
        errorMessage = error.statusText || 'Sidan kunde inte hittas.';
        if (error.status === 404) {
            errorMessage = "Sidan du letar efter verkar inte finnas.";
        }
    } else if (error instanceof Error) {
        errorStatus = "Application Error";
        errorMessage = error.message;
    }


    return (
        <div className="bg-gray-50 text-gray-800 font-sans">
            <Header />
            <main className="min-h-screen flex flex-col items-center justify-center bg-white pt-20">
                <div className="text-center px-6 py-24">
                    <div className="text-sm font-medium text-gray-500 mb-2">
                        <Link to="/home" className="hover:text-amber-500">Hem</Link>
                        <span className="mx-2">/</span>
                        <span>Error</span>
                    </div>
                    <h1 className="text-8xl font-extrabold text-gray-800 tracking-tighter">{errorStatus}</h1>
                    <p className="text-2xl font-serif text-gray-600 mt-4 mb-8">{errorMessage}</p>
                    <Link
                        to="/home"
                        className="bg-amber-400 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-500 transition-all duration-300 transform hover:scale-105 inline-block"
                    >
                        Gå tillbaka till startsidan
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
};

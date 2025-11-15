import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui';

export const Footer: React.FC = () => {
    return (
        <footer id="kontakt" className="bg-gray-900 text-white">
            <div className="container mx-auto px-6 py-16">
                {/* Quick CTAs Row */}
                <div className="text-center mb-12">
                    <h3 className="text-2xl font-bold mb-4 font-serif">Fortsätt din resa</h3>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        Zeppel Inn blir vad vi bygger tillsammans. Var med och skapa framtiden genom konst, teknologi och samhällsutveckling.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
                        <Button
                            variant="default"
                            onClick={() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="hover:scale-105 transition-transform duration-300"
                        >
                            Delta i Residenset
                        </Button>

                        <Button
                            variant="secondary"
                            asChild
                            className="hover:scale-105 transition-transform duration-300"
                        >
                            <Link to="/showcase">Utforska Showcase</Link>
                        </Button>

                        <Button
                            variant="secondary"
                            asChild
                            className="hover:scale-105 transition-transform duration-300"
                        >
                            <Link to="/campaigns">Support Campaigns</Link>
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={() => {
                                window.scrollTo({ top: 2200, behavior: 'smooth' });  
                            }}
                            className="hover:scale-105 transition-transform duration-300"
                        >
                            Bli Partner
                        </Button>
                    </div>
                </div>

                {/* Follow Section */}
                <div className="text-center py-8 border-t border-b border-gray-800 my-8">
                    <h4 className="text-lg font-semibold mb-4">Följ vår resa</h4>
                    <p className="text-gray-400 mb-6">
                        Håll dig uppdaterad om våra framsteg, evenemang och möjligheter att bidra.
                    </p>

                    <div className="flex justify-center items-center gap-6">
                        {/* Social Media Links */}
                        <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300 group">
                            <div className="w-10 h-10 rounded-full border-2 border-gray-400 group-hover:border-amber-400 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M25.362 23.393c6.734 0 12.536-5.66 12.536-12.847C37.898 5.908 32.096.25 25.362.25 18.628.25 12.826 5.908 12.826 13.546c0 6.468 4.743 11.8 10.94 12.503-.333-1.986-.667-4.017-.333-5.717-1.373-1.037-2.36-.357-2.36-2.357 0-2.647 2.61-4.999 5.063-4.999 2.726 0 3.962 1.954 4.839 3.927 2.073.193 2.52 1.209 2.52 1.209.484-1.860 2.002-.557 2.002-.557.914-.684 1.044-.957 1.044-.957l1.009-.566.105-.059c2.21.24 3.709.227 4.989.009l.063-1.1c-.273 1.786-.107 3.043-.646 4.917-.907.523-1.816 1.033-2.754 1.487 1.277 3.96-1.247 10.61-1.247 10.61-.926 2.667-.477 5.707-.477 5.707l-.934 1.603s-1.084-1.113-2.003-1.113c-.859 0-1.833.383-1.833.383z"/>
                                </svg>
                            </div>
                        </a>

                        <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300 group">
                            <div className="w-10 h-10 rounded-full border-2 border-gray-400 group-hover:border-amber-400 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M20 10c0-5.514-4.486-10-10-10S0 4.486 0 10s4.486 10 10 10 10-4.486 10-10zm-8 0V2h2v8h5l-3 3-3-3h2z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </a>

                        <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300 group">
                            <div className="w-10 h-10 rounded-full border-2 border-gray-400 group-hover:border-amber-400 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.017 0H7.99C3.58 0 0 3.58 0 8.008v3.974C0 16.41 3.58 20 7.99 20h4.027C16.42 20 20 16.41 20 11.982V8.008C20 3.58 16.42 0 12.017 0zM10 17.5h-2c0 .276.223.5.5.5s.5-.224.5-.5z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </a>
                    </div>

                    <div className="mt-6">
                        <div className="space-y-2">
                            <a href="mailto:lindhdavid2@gmail.com" className="text-amber-400 hover:text-amber-300 underline transition-colors duration-300 block">
                                David L - lindhdavid2@gmail.com
                            </a>
                            <a href="mailto:artzebs@gmail.com" className="text-amber-400 hover:text-amber-300 underline transition-colors duration-300 block">
                                Anastasiya L - artzebs@gmail.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright & Credits */}
                <div className="text-center">
                    <div className="text-gray-500 text-sm py-8">
                        <p>&copy; 2025 Zeppel Inn. Ett initiativ av Faving Team.</p>
                        <p className="mt-2">
                            Skapad med ♥ för konst, teknologi och samhällsutveckling i Karlskrona skärgård.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

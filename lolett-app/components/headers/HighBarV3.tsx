'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, X } from 'lucide-react';

export function HighBarV3() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled ? 'bg-[#F3EFEA]/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>

                {/* Bande Promo Ultra Contrastée (Style Magazine) */}
                <div className={`bg-[#060712] text-[#F3EFEA] py-1.5 text-center text-[10px] uppercase tracking-[0.3em] font-medium transition-transform duration-500 ${isScrolled ? '-translate-y-full absolute w-full' : 'translate-y-0 relative'}`}>
                    Édition Limitée : La Collection Été est disponible
                </div>

                {/* Navigation Sticky Exceptionnelle */}
                <header className={`px-6 md:px-12 transition-all duration-700 ${isScrolled ? 'py-4 mt-0' : 'py-8 mt-1.5'}`}>
                    <div className="max-w-[1600px] mx-auto flex items-center justify-between">

                        {/* Bouton Menu Immersif */}
                        <button
                            onClick={() => setMenuOpen(true)}
                            className={`flex items-center gap-3 group transition-colors duration-300 ${isScrolled ? 'text-[#1B0B94]' : 'text-[#F3EFEA]'}`}
                        >
                            <div className="flex flex-col gap-1 w-6">
                                <span className={`block h-[1px] w-full bg-current transition-all group-hover:w-4`} />
                                <span className={`block h-[1px] w-4 bg-current transition-all group-hover:w-full`} />
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold hidden sm:block">Menu</span>
                        </button>

                        {/* Logo Dynamique (Rétrécit au scroll) */}
                        <Link href="/test/header-3" className={`absolute left-1/2 -translate-x-1/2 transition-all duration-700 ${isScrolled ? 'text-[#1B0B94]' : 'text-[#F3EFEA]'}`}>
                            <span className={`font-[family-name:var(--font-newsreader)] tracking-tight leading-none block transition-all duration-700 ${isScrolled ? 'text-4xl' : 'text-5xl md:text-7xl'}`}>
                                LOLETT
                            </span>
                        </Link>

                        {/* Utilitaires */}
                        <div className={`flex items-center gap-6 transition-colors duration-300 ${isScrolled ? 'text-[#1B0B94]' : 'text-[#F3EFEA]'}`}>
                            <button className="hover:text-[#B89547] transition-colors">
                                <Search size={22} strokeWidth={1} />
                            </button>
                            <button className="hover:text-[#B89547] transition-colors relative">
                                <ShoppingBag size={22} strokeWidth={1} />
                                <span className={`absolute -bottom-1 -right-2 w-4 h-4 text-[8px] flex items-center justify-center rounded-full font-bold ${isScrolled ? 'bg-[#1B0B94] text-[#F3EFEA]' : 'bg-[#F3EFEA] text-[#1B0B94]'}`}>2</span>
                            </button>
                        </div>

                    </div>
                </header>
            </div>

            {/* Fullscreen Menu Overlay */}
            {menuOpen && (
                <div className="fixed inset-0 z-[100] bg-[#060712] text-[#F3EFEA] flex flex-col p-8 md:p-16 animate-in fade-in duration-500">
                    <div className="flex justify-between items-center mb-16">
                        <span className="font-[family-name:var(--font-newsreader)] text-3xl">LOLETT</span>
                        <button onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-[#B89547] transition-colors">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Fermer</span>
                            <X size={24} strokeWidth={1} />
                        </button>
                    </div>

                    <nav className="flex flex-col gap-8 text-4xl md:text-6xl font-[family-name:var(--font-newsreader)] italic font-light">
                        <Link href="#" className="hover:text-[#B89547] transition-colors hover:translate-x-4 duration-300">Femme</Link>
                        <Link href="#" className="hover:text-[#B89547] transition-colors hover:translate-x-4 duration-300">Homme</Link>
                        <Link href="#" className="hover:text-[#B89547] transition-colors hover:translate-x-4 duration-300">Nouveautés</Link>
                        <Link href="#" className="hover:text-[#B89547] transition-colors hover:translate-x-4 duration-300 mt-8 text-2xl text-[#F3EFEA]/50">Le Journal Privé</Link>
                    </nav>
                </div>
            )}
        </>
    );
}

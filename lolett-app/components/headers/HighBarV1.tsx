import Link from 'next/link';
import { Search, ShoppingBag, User } from 'lucide-react';

export function HighBarV1() {
    return (
        <div className="w-full relative z-50">
            {/* TopBar fine statique */}
            <div className="bg-[#F3EFEA] text-[#1B0B94] py-1 border-b border-[#1B0B94]/10 text-center text-[9px] uppercase tracking-[0.2em] font-medium">
                Livraison offerte dès 200€ d&apos;achat
            </div>

            {/* Header Éditorial Centré */}
            <header className="absolute top-full left-0 right-0 bg-transparent text-[#1B0B94] py-4 border-b border-[#1B0B94]/10 hover:bg-[#F3EFEA] transition-colors duration-500">
                <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between">

                    {/* Navigation Gauche */}
                    <nav className="flex-1 flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-medium">
                        <Link href="#" className="hover:text-[#B89547] transition-colors">La Collection Femme</Link>
                        <Link href="#" className="hover:text-[#B89547] transition-colors">L&apos;Édition Homme</Link>
                    </nav>

                    {/* Logo Central */}
                    <Link href="/test/header-1" className="flex-shrink-0 text-center">
                        <span className="font-[family-name:var(--font-newsreader)] text-4xl tracking-tight leading-none block">
                            LOLETT
                        </span>
                    </Link>

                    {/* Icônes Droite */}
                    <div className="flex-1 flex items-center justify-end gap-6">
                        <button className="hover:text-[#B89547] transition-colors">
                            <Search size={18} strokeWidth={1.5} />
                        </button>
                        <Link href="#" className="hover:text-[#B89547] transition-colors">
                            <User size={18} strokeWidth={1.5} />
                        </Link>
                        <button className="hover:text-[#B89547] transition-colors flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium hidden sm:inline-flex">Panier</span>
                            <ShoppingBag size={18} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </header>
        </div>
    );
}

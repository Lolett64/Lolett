import Link from 'next/link';
import { Search, ShoppingBag, User } from 'lucide-react';

export function HighBarV2() {
    return (
        <header className="w-full relative z-50 bg-[#F3EFEA] text-[#1B0B94] py-6 border-b border-[#1B0B94]/10 shadow-[0_4px_30px_rgba(27,11,148,0.03)]">
            <div className="max-w-[1600px] mx-auto px-8 flex items-end justify-between">

                {/* Logo Gauche avec Baseline "Maison de Couture" */}
                <div className="flex flex-col">
                    <Link href="/test/header-2" className="inline-block">
                        <span className="font-[family-name:var(--font-newsreader)] text-5xl tracking-tight leading-none">
                            LOLETT
                        </span>
                    </Link>
                    <span className="text-[8px] uppercase tracking-[0.4em] font-medium text-[#B89547] mt-2 ml-1">
                        Maison fondée en 2026
                    </span>
                </div>

                {/* Navigation très espacée (Style Luxe) */}
                <nav className="hidden lg:flex items-center gap-12 text-[9px] uppercase tracking-[0.3em] font-medium pb-1">
                    <Link href="#" className="hover:text-[#B89547] hover:border-b hover:border-[#B89547] pb-1 transition-all">Femme</Link>
                    <Link href="#" className="hover:text-[#B89547] hover:border-b hover:border-[#B89547] pb-1 transition-all">Homme</Link>
                    <Link href="#" className="hover:text-[#B89547] hover:border-b hover:border-[#B89547] pb-1 transition-all">Les Ateliers</Link>
                    <Link href="#" className="hover:text-[#B89547] hover:border-b hover:border-[#B89547] pb-1 transition-all text-[#1B0B94]/60">Le Journal</Link>
                </nav>

                {/* Icônes Utilitaires */}
                <div className="flex items-center gap-8 pb-1">
                    <button className="hover:text-[#B89547] transition-colors">
                        <Search size={20} strokeWidth={1} />
                    </button>
                    <Link href="#" className="hover:text-[#B89547] transition-colors">
                        <User size={20} strokeWidth={1} />
                    </Link>
                    <button className="hover:text-[#B89547] transition-colors relative flex items-center justify-center w-8 h-8 rounded-full border border-[#1B0B94]/20 hover:border-[#B89547] hover:bg-[#B89547]/5">
                        <ShoppingBag size={14} strokeWidth={1.5} />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1B0B94] text-[#F3EFEA] text-[8px] flex items-center justify-center rounded-full font-bold">2</span>
                    </button>
                </div>

            </div>
        </header>
    );
}

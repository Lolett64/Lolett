'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SlidersHorizontal, ArrowRight } from 'lucide-react';
import { ProductGrid } from './ProductGrid';
import { ProductSorting, type SortOption } from './ProductSorting';
import { ProductFiltersV3 } from './ProductFiltersV3';
import { type FilterState } from './ProductFilters';
import { ActiveFilters, type ActiveFilter } from './ActiveFilters';
import { EmptyState } from './EmptyState';
import { cn } from '@/lib/utils';
import type { Product, Category, Size } from '@/types';

interface ShopContentV3Props {
    gender: 'homme' | 'femme';
    products: Product[];
    categories: Category[];
    heroImage: string;
    heroImagePosition?: string;
    heroTitle: string;
    heroSubtitle: string;
    activeCategory?: string;
}

export function ShopContentV3_V3({
    gender,
    products,
    categories,
    heroImage,
    heroImagePosition = 'center 65%',
    heroTitle,
    heroSubtitle,
    activeCategory,
}: ShopContentV3Props) {
    const [sort, setSort] = useState<SortOption>('newest');
    const [filters, setFilters] = useState<FilterState>({ colors: [], sizes: [] });
    const [showFilters, setShowFilters] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 200);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const filtered = useMemo(() => {
        return products.filter((product) => {
            if (filters.priceMin !== undefined && product.price < filters.priceMin) return false;
            if (filters.priceMax !== undefined && product.price > filters.priceMax) return false;
            if (filters.colors.length > 0) {
                const productColors = product.colors?.map((c) => c.name) ?? [];
                if (!filters.colors.some((color) => productColors.includes(color))) return false;
            }
            if (filters.sizes.length > 0) {
                if (!filters.sizes.some((size) => product.sizes.includes(size as Size))) return false;
            }
            return true;
        });
    }, [products, filters]);

    const sorted = useMemo(() => {
        const copy = [...filtered];
        switch (sort) {
            case 'newest': return copy.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            default: return copy;
        }
    }, [filtered, sort]);

    return (
        <div className="min-h-screen pb-20" style={{ background: '#FDF5E6' }}>

            {/* ═══ V3 HERO : "Luminous Atelier" ═══ */}
            <div className="relative h-[50vh] md:h-[60vh] overflow-hidden bg-white">
                <Image src={heroImage} alt={heroTitle} fill className="object-cover opacity-90" style={{ objectPosition: heroImagePosition }} priority />

                {/* Very soft white vignette to keep it light */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent" />

                <div className="absolute inset-0 flex items-center px-6 md:px-24">
                    <div className="bg-white/40 backdrop-blur-md p-10 md:p-16 border border-white/50 max-w-xl">
                        <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl text-[#1B0B94] mb-6 tracking-tight">
                            {heroTitle}
                        </h1>
                        <p className="text-[#1B0B94]/80 text-sm md:text-base font-medium max-w-sm leading-relaxed mb-8">
                            {heroSubtitle}
                        </p>
                        <div className="flex items-center gap-3 text-[#1B0B94] font-black text-[10px] uppercase tracking-[0.3em]">
                            <span>Explorer l'Atelier</span>
                            <ArrowRight size={14} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ V3 BARRE : "Sticky Minimalist" ═══ */}
            <div className={cn(
                "sticky top-20 z-[60] py-4 transition-all duration-500 px-6",
                isScrolled ? "bg-white/80 backdrop-blur-xl border-b border-[#1B0B94]/5 shadow-sm" : "bg-transparent"
            )}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex gap-8 overflow-x-auto no-scrollbar">
                        <Link href={`/shop/${gender}`} className={cn("text-[10px] uppercase tracking-[0.2em] font-black transition-colors", !activeCategory ? "text-[#1B0B94]" : "text-[#1B0B94]/30 hover:text-[#1B0B94]")}>
                            Tous
                        </Link>
                        {categories.map(cat => (
                            <Link
                                key={cat.id}
                                href={`/shop/${gender}/${cat.slug}`}
                                className={cn("text-[10px] uppercase tracking-[0.2em] font-black transition-colors", cat.slug === activeCategory ? "text-[#1B0B94]" : "text-[#1B0B94]/30 hover:text-[#1B0B94]")}
                            >
                                {cat.label}
                            </Link>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowFilters(true)}
                        className="flex items-center gap-3 px-6 py-2 rounded-full border border-[#1B0B94]/10 text-[10px] uppercase tracking-widest font-bold text-[#1B0B94] hover:bg-[#1B0B94] hover:text-white transition-all duration-500"
                    >
                        <SlidersHorizontal size={14} />
                        <span>FILTRER</span>
                    </button>
                </div>
            </div>

            {/* ═══ V3 CONTENT Area ═══ */}
            <div className="max-w-7xl mx-auto mt-16 px-6 relative">

                <div className="flex items-center justify-between mb-16 px-1">
                    <div className="flex items-center gap-6">
                        <h2 className="font-[family-name:var(--font-newsreader)] text-3xl italic text-[#1B0B94]">La Sélection</h2>
                        <div className="hidden md:block h-[1px] w-20 bg-[#1B0B94]/10" />
                        <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B0B94]/30">
                            {sorted.length} Articles
                        </span>
                    </div>
                    <ProductSorting value={sort} onChange={setSort} />
                </div>

                <ProductGrid products={sorted} columns={3} />

                {sorted.length === 0 && (
                    <EmptyState title="Atelier vide" message="Nous n'avons pas trouvé de pièces correspondant à vos critères." />
                )}
            </div>

            {/* Slide-in Drawer (shared component) */}
            {showFilters && (
                <ProductFiltersV3
                    products={products}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClose={() => setShowFilters(false)}
                    variant="drawer"
                />
            )}
        </div>
    );
}

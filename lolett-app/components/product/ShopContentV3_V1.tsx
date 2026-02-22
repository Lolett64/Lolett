'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SlidersHorizontal, ChevronRight } from 'lucide-react';
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

export function ShopContentV3_V1({
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
    const [showFiltersMobile, setShowFiltersMobile] = useState(false);

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
            case 'newest': return copy.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            case 'price-asc': return copy.sort((a, b) => a.price - b.price);
            case 'price-desc': return copy.sort((a, b) => b.price - a.price);
            default: return copy;
        }
    }, [filtered, sort]);

    const activeFilters = useMemo(() => {
        const active: ActiveFilter[] = [];
        if (filters.priceMin) active.push({ key: 'priceMin', label: 'Prix min', value: `${filters.priceMin}€` });
        if (filters.priceMax) active.push({ key: 'priceMax', label: 'Prix max', value: `${filters.priceMax}€` });
        filters.colors.forEach(c => active.push({ key: `color-${c}`, label: 'Nuance', value: c }));
        filters.sizes.forEach(s => active.push({ key: `size-${s}`, label: 'Taille', value: s }));
        return active;
    }, [filters]);

    return (
        <div className="min-h-screen pb-20" style={{ background: '#FDF5E6' }}>

            {/* ═══ V1 HERO : "Impact Héritage" ═══ */}
            <div className="relative h-[85vh] min-h-[600px] overflow-hidden">
                <Image src={heroImage} alt={heroTitle} fill className="object-cover" style={{ objectPosition: heroImagePosition }} priority />

                {/* Layer 1: Global Overlay */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Layer 2: Deep Gradient for Title Readability */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end pb-32 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-[1px] bg-[#B89547]" />
                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#B89547] font-bold">
                            Collection {gender === 'homme' ? 'Homme' : 'Femme'}
                        </span>
                    </div>

                    <h1 className="font-[family-name:var(--font-playfair)] text-6xl md:text-8xl text-white mb-6 leading-[0.9] tracking-tight">
                        {heroTitle.split(' ')[0]} <br />
                        <span className="italic ml-8 md:ml-16">{heroTitle.split(' ').slice(1).join(' ')}</span>
                    </h1>

                    <p className="max-w-xl text-lg md:text-xl text-white/80 font-light leading-relaxed mb-8">
                        {heroSubtitle}
                    </p>
                </div>
            </div>

            {/* ═══ V1 BARRE : "Console Flottante" ═══ */}
            <div className="relative -mt-10 z-20 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 p-2 flex items-center justify-between overflow-hidden">
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-2 py-1">
                        <Link href={`/shop/${gender}`} className={cn("px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all", !activeCategory ? "bg-[#1B0B94] text-white shadow-lg" : "text-[#1B0B94]/60 hover:text-[#1B0B94] hover:bg-[#1B0B94]/5")}>
                            Tout voir
                        </Link>
                        {categories.map(cat => (
                            <Link
                                key={cat.id}
                                href={`/shop/${gender}/${cat.slug}`}
                                className={cn("px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all whitespace-nowrap", cat.slug === activeCategory ? "bg-[#1B0B94] text-white shadow-lg" : "text-[#1B0B94]/60 hover:text-[#1B0B94] hover:bg-[#1B0B94]/5")}
                            >
                                {cat.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ V1 CONTENT AREA ═══ */}
            <div className="max-w-7xl mx-auto mt-20 px-6 lg:px-12">

                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Sidebar Filtres (V3 partagée) */}
                    <aside className="hidden lg:block w-72 shrink-0">
                        <div className="sticky top-32">
                            <ProductFiltersV3
                                products={products}
                                filters={filters}
                                onFiltersChange={setFilters}
                                variant="sidebar"
                            />
                        </div>
                    </aside>

                    <main className="flex-1">
                        {/* Toolbar Mobile & Sorting */}
                        <div className="flex items-center justify-between mb-10 pb-6 border-b border-[#1B0B94]/10">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1B0B94]/40">
                                    {sorted.length} Modèles
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <ProductSorting value={sort} onChange={setSort} />
                                <button
                                    onClick={() => setShowFiltersMobile(true)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-[#1B0B94]/20 text-[10px] uppercase font-bold text-[#1B0B94]"
                                >
                                    <SlidersHorizontal size={14} /> Filtres
                                </button>
                            </div>
                        </div>

                        <ActiveFilters
                            filters={activeFilters}
                            onRemove={k => setFilters(prev => ({ ...prev, [k.includes('color') ? 'colors' : k.includes('size') ? 'sizes' : k]: undefined }))}
                            onClearAll={() => setFilters({ colors: [], sizes: [] })}
                        />

                        {sorted.length === 0 ? (
                            <EmptyState title="Aucun résultat" message="Ajustez vos filtres pour découvrir notre collection." />
                        ) : (
                            <ProductGrid products={sorted} columns={3} />
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Drawer */}
            {showFiltersMobile && (
                <ProductFiltersV3
                    products={products}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClose={() => setShowFiltersMobile(false)}
                    variant="drawer"
                />
            )}
        </div>
    );
}

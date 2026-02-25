'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
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

export function ShopContentV3_V2({
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
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);

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

            {/* ═══ V2 HERO : "Éditorial Magazine" ═══ */}
            <div className="relative h-[65vh] md:h-[75vh] flex items-center px-6 md:px-20 overflow-hidden">
                <div className="absolute right-0 top-0 w-2/3 h-full grayscale-[0.2] contrast-125">
                    <Image src={heroImage} alt={heroTitle} fill className="object-cover" style={{ objectPosition: heroImagePosition }} priority />
                    {/* Gradient over image only */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FDF5E6] via-[#FDF5E6]/40 to-transparent" />
                </div>

                <div className="relative z-10 max-w-2xl">
                    <span className="font-[family-name:var(--font-newsreader)] text-3xl italic text-[#B89547] mb-4 block">
                        {gender === 'homme' ? 'L\'Homme Lolett' : 'La Femme Lolett'}
                    </span>
                    <h1 className="font-[family-name:var(--font-playfair)] text-7xl md:text-9xl text-[#1B0B94] leading-[0.8] tracking-tighter mb-8">
                        {heroTitle.split(' ')[0]} <br />
                        <span className="ml-4 md:ml-12">{heroTitle.split(' ')[1]}</span>
                    </h1>
                    <div className="w-24 h-1 bg-[#1B0B94] mb-8" />
                    <p className="font-sans text-xs uppercase tracking-[0.2em] font-bold text-[#1B0B94]/60 max-w-xs leading-loose">
                        {heroSubtitle}
                    </p>
                </div>
            </div>

            {/* ═══ V2 BARRE : "Navigation Éditoriale" ═══ */}
            <div className="max-w-[1600px] mx-auto px-6 md:px-20 py-12 flex flex-col items-center">
                <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
                    <Link href={`/shop/${gender}`} className={cn("relative group font-[family-name:var(--font-newsreader)] text-2xl italic", !activeCategory ? "text-[#1B0B94]" : "text-[#1B0B94]/40 hover:text-[#1B0B94]")}>
                        Tout voir
                        <div className={cn("absolute -bottom-2 left-0 h-[1px] bg-[#B89547] transition-all duration-500", !activeCategory ? "w-full" : "w-0 group-hover:w-full")} />
                    </Link>
                    {categories.map(cat => (
                        <Link
                            key={cat.id}
                            href={`/shop/${gender}/${cat.slug}`}
                            className={cn("relative group font-[family-name:var(--font-newsreader)] text-2xl italic", cat.slug === activeCategory ? "text-[#1B0B94]" : "text-[#1B0B94]/40 hover:text-[#1B0B94]")}
                        >
                            {cat.label}
                            <div className={cn("absolute -bottom-2 left-0 h-[1px] bg-[#B89547] transition-all duration-500", cat.slug === activeCategory ? "w-full" : "w-0 group-hover:w-full")} />
                        </Link>
                    ))}
                </div>
            </div>

            {/* ═══ V2 CONTENT : "Filtres Horizontaux" ═══ */}
            <div className="max-w-[1600px] mx-auto px-6 md:px-20">

                <div className="border-t border-b border-[#1B0B94]/10 py-6 mb-12 flex items-center justify-between">
                    <button
                        onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                        className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-black text-[#1B0B94] hover:text-[#B89547] transition-colors"
                    >
                        <SlidersHorizontal size={14} />
                        <span>AFFINER LA SÉLECTION</span>
                        <ChevronDown size={14} className={cn("transition-transform duration-500", isFilterExpanded && "rotate-180")} />
                    </button>

                    <div className="flex items-center gap-8">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1B0B94]/30">
                            {sorted.length} ARCHIVES
                        </span>
                        <ProductSorting value={sort} onChange={setSort} />
                    </div>
                </div>

                {/* Expandable Horizontal Filters */}
                <div className={cn("overflow-hidden transition-all duration-700 ease-in-out", isFilterExpanded ? "max-h-[500px] mb-20 opacity-100" : "max-h-0 opacity-0")}>
                    <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-10 shadow-inner">
                        <ProductFiltersV3
                            products={products}
                            filters={filters}
                            onFiltersChange={setFilters}
                            variant="horizontal"
                        />
                        <div className="mt-10 flex justify-center">
                            <button
                                onClick={() => setIsFilterExpanded(false)}
                                className="bg-[#1B0B94] text-white px-10 py-4 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-[#B89547] transition-all duration-500"
                            >
                                Appliquer les filtres
                            </button>
                        </div>
                    </div>
                </div>

                <ProductGrid products={sorted} columns={3} />

                {sorted.length === 0 && (
                    <EmptyState title="Page vierge" message="Aucune pièce ne correspond à cette recherche éditoriale." />
                )}
            </div>

            {/* Mobile Drawer (fallback) */}
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

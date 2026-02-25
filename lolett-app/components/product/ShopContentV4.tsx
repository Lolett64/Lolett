'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SlidersHorizontal } from 'lucide-react';
import { ProductGrid } from './ProductGrid';
import { ProductSorting, type SortOption } from './ProductSorting';
import { ProductFiltersV3 } from './ProductFiltersV3';
import { type FilterState } from './ProductFilters';
import { ActiveFilters, type ActiveFilter } from './ActiveFilters';
import { EmptyState } from './EmptyState';
import { cn } from '@/lib/utils';
import type { Product, Category, Size } from '@/types';

interface ShopContentV4Props {
    gender: 'homme' | 'femme';
    products: Product[];
    categories: Category[];
    heroImage: string;
    heroImagePosition?: string;
    heroImageScale?: number;
    heroTitle: string;
    heroSubtitle: string;
    activeCategory?: string;
    heroHeight?: string;
}

export function ShopContentV4({
    gender,
    products,
    categories,
    heroImage,
    heroImagePosition = 'center 65%',
    heroImageScale = 1,
    heroTitle,
    heroSubtitle,
    activeCategory,
    heroHeight = "h-[45vh] min-h-[400px]",
}: ShopContentV4Props) {
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
            case 'newest': return copy.sort((a, b) =>
                (b.createdAt ? new Date(b.createdAt).getTime() : 0) -
                (a.createdAt ? new Date(a.createdAt).getTime() : 0)
            );
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

            {/* ═══ HERO : Hauteur dynamique ═══ */}
            <div className={cn("relative overflow-hidden", heroHeight)}>
                <Image
                    src={heroImage}
                    alt={heroTitle}
                    fill
                    className="object-cover"
                    style={{
                        objectPosition: heroImagePosition,
                        transform: `scale(${heroImageScale})`
                    }}
                    priority
                />

                {/* Deep Gradient for Title Readability (V1 style refined) */}
                <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end pb-16 px-6 sm:px-12 lg:px-20 max-w-[1600px] mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-[1px] bg-[#B89547]" />
                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#B89547] font-bold">
                            Collection {gender === 'homme' ? 'Homme' : 'Femme'}
                        </span>
                    </div>

                    <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl text-white mb-4 leading-[0.9] tracking-tight">
                        {heroTitle.split(' ')[0]} <span className="italic ml-4">{heroTitle.split(' ').slice(1).join(' ')}</span>
                    </h1>

                    <p className="max-w-xl text-sm md:text-base text-white/70 font-light leading-relaxed">
                        {heroSubtitle}
                    </p>
                </div>
            </div>

            {/* ═══ BARRE : Style V2 (Éditorial) ═══ */}
            <div className="max-w-[1600px] mx-auto px-6 md:px-20 py-10 flex flex-col items-center">
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

            {/* ═══ CONTENT AREA : Style V1 (Sidebar + Grid) ═══ */}
            <div className="max-w-[1600px] mx-auto mt-10 px-6 lg:px-12">

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
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1B0B94]/10">
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

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
    const [filters, setFilters] = useState<FilterState>({ sizes: [] });
    const [showFilters, setShowFilters] = useState(false);

    const filtered = useMemo(() => {
        return products.filter((product) => {
            if (filters.priceMin !== undefined && product.price < filters.priceMin) return false;
            if (filters.priceMax !== undefined && product.price > filters.priceMax) return false;
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
        filters.sizes.forEach(s => active.push({ key: `size-${s}`, label: 'Taille', value: s }));
        return active;
    }, [filters]);

    const handleRemoveFilter = (key: string) => {
        if (key === 'priceMin') {
            setFilters(prev => ({ ...prev, priceMin: undefined }));
        } else if (key === 'priceMax') {
            setFilters(prev => ({ ...prev, priceMax: undefined }));
        } else if (key.startsWith('size-')) {
            const size = key.replace('size-', '');
            setFilters(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }));
        }
    };

    return (
        <div className="min-h-screen pb-20" style={{ background: '#FDF5E6' }}>

            {/* ═══ HERO ═══ */}
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
                <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end pb-16 px-6 sm:px-12 lg:px-20 max-w-[1600px] mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-[1px] bg-[#B89547]" />
                        <span className="font-sans text-sm uppercase tracking-[0.4em] text-[#B89547] font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                            {gender === 'homme' ? 'Pour Lui' : 'Pour Elle'}
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

            {/* ═══ CATEGORIES ═══ */}
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

            {/* ═══ CONTENT ═══ */}
            <div className="max-w-[1600px] mx-auto mt-4 px-6 lg:px-12">

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1B0B94]/8">
                    <button
                        onClick={() => setShowFilters(true)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-[#1B0B94]/15 text-[10px] uppercase tracking-[0.12em] font-medium text-[#1B0B94] hover:border-[#1B0B94]/30 transition-colors"
                    >
                        <SlidersHorizontal size={13} />
                        Filtres
                    </button>

                    <div className="flex items-center gap-6">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1B0B94]/35">
                            {sorted.length} Modèle{sorted.length > 1 ? 's' : ''}
                        </span>
                        <ProductSorting value={sort} onChange={setSort} />
                    </div>
                </div>

                <ActiveFilters
                    filters={activeFilters}
                    onRemove={handleRemoveFilter}
                    onClearAll={() => setFilters({ sizes: [] })}
                />

                {sorted.length === 0 ? (
                    <EmptyState title="Aucun résultat" message="Ajustez vos filtres pour découvrir notre collection." />
                ) : (
                    <ProductGrid products={sorted} columns={3} />
                )}
            </div>

            {/* Drawer */}
            {showFilters && (
                <ProductFiltersV3
                    products={products}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClose={() => setShowFilters(false)}
                />
            )}
        </div>
    );
}

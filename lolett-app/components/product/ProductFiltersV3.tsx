import { FilterState } from './ProductFilters';
import { Product, Size } from '@/types';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { X, ChevronDown, Check } from 'lucide-react';

interface ProductFiltersV3Props {
    products: Product[];
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    onClose?: () => void;
    isMobile?: boolean;
    variant?: 'sidebar' | 'horizontal' | 'drawer';
}

export function ProductFiltersV3({
    products,
    filters,
    onFiltersChange,
    onClose,
    isMobile = false,
    variant = 'sidebar',
}: ProductFiltersV3Props) {
    const [localFilters, setLocalFilters] = useState<FilterState>(filters);

    const availableColors = useMemo(() => {
        const colors = new Set<string>();
        products.forEach((p) => {
            p.colors?.forEach((c) => colors.add(c.name));
        });
        return Array.from(colors).sort();
    }, [products]);

    const availableSizes = useMemo(() => {
        const sizes = new Set<string>();
        products.forEach((p) => {
            p.sizes.forEach((s) => sizes.add(s));
        });
        return Array.from(sizes).sort();
    }, [products]);

    const priceRange = useMemo(() => {
        const prices = products.map((p) => p.price);
        return { min: Math.min(...prices), max: Math.max(...prices) };
    }, [products]);

    const toggleFilter = (key: 'colors' | 'sizes', value: string) => {
        setLocalFilters((prev) => ({
            ...prev,
            [key]: prev[key].includes(value)
                ? prev[key].filter((v) => v !== value)
                : [...prev[key], value],
        }));
    };

    const handleApply = () => {
        onFiltersChange(localFilters);
        if (onClose) onClose();
    };

    const colorMap = useMemo(() => {
        const map: Record<string, string> = {};
        products.forEach(p => p.colors?.forEach(c => map[c.name] = c.hex));
        return map;
    }, [products]);

    const renderFiltresContent = () => (
        <div className={cn("flex flex-col gap-10", variant === 'horizontal' && "flex-row gap-12")}>
            {/* Prix */}
            <div className={cn("min-w-[180px]", variant === 'horizontal' && "flex-1")}>
                <h4 className="font-[family-name:var(--font-newsreader)] text-xl italic text-[#1B0B94] mb-4">Budget</h4>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        className="w-full bg-transparent border-b border-[#1B0B94]/20 py-2 text-xs focus:border-[#1B0B94] outline-none transition-colors"
                        value={localFilters.priceMin ?? ''}
                        onChange={e => setLocalFilters(p => ({ ...p, priceMin: e.target.value ? Number(e.target.value) : undefined }))}
                    />
                    <span className="text-[#1B0B94]/30">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        className="w-full bg-transparent border-b border-[#1B0B94]/20 py-2 text-xs focus:border-[#1B0B94] outline-none transition-colors"
                        value={localFilters.priceMax ?? ''}
                        onChange={e => setLocalFilters(p => ({ ...p, priceMax: e.target.value ? Number(e.target.value) : undefined }))}
                    />
                </div>
            </div>

            {/* Couleurs */}
            <div className={cn(variant === 'horizontal' && "flex-[2]")}>
                <h4 className="font-[family-name:var(--font-newsreader)] text-xl italic text-[#1B0B94] mb-4">Nuances</h4>
                <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => {
                        const isSelected = localFilters.colors.includes(color);
                        return (
                            <button
                                key={color}
                                onClick={() => toggleFilter('colors', color)}
                                className={cn(
                                    "group flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all duration-300",
                                    isSelected
                                        ? "bg-[#1B0B94] border-[#1B0B94] text-white shadow-md"
                                        : "border-[#1B0B94]/10 bg-white/50 text-[#1B0B94]/70 hover:border-[#1B0B94]/40"
                                )}
                            >
                                <span
                                    className="w-4 h-4 rounded-full border border-black/5"
                                    style={{ backgroundColor: colorMap[color] || '#ccc' }}
                                />
                                <span className="text-[10px] uppercase tracking-wider font-medium">{color}</span>
                                {isSelected && <X size={10} className="ml-1 opacity-60" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tailles */}
            <div className={cn(variant === 'horizontal' && "flex-1")}>
                <h4 className="font-[family-name:var(--font-newsreader)] text-xl italic text-[#1B0B94] mb-4">Tailles</h4>
                <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => {
                        const isSelected = localFilters.sizes.includes(size);
                        return (
                            <button
                                key={size}
                                onClick={() => toggleFilter('sizes', size)}
                                className={cn(
                                    "w-10 h-10 flex items-center justify-center rounded-lg border text-[10px] uppercase font-bold transition-all duration-300",
                                    isSelected
                                        ? "bg-[#1B0B94] border-[#1B0B94] text-white shadow-md scale-105"
                                        : "border-[#1B0B94]/10 bg-white/30 text-[#1B0B94]/60 hover:bg-[#1B0B94]/5 hover:border-[#1B0B94]/30"
                                )}
                            >
                                {size}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bouton Appliquer (Sidebar/Drawer only) */}
            {variant !== 'horizontal' && (
                <button
                    onClick={handleApply}
                    className="mt-4 w-full bg-[#1B0B94] text-white py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#B89547] transition-all duration-500 shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                    Afficher les résultats
                </button>
            )}
        </div>
    );

    if (variant === 'drawer') {
        return (
            <div className="fixed inset-0 z-[100] bg-[#1B0B94]/20 backdrop-blur-sm flex justify-end">
                <div className="w-full max-w-sm bg-[#FDF5E6] h-full shadow-2xl p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="font-[family-name:var(--font-newsreader)] text-4xl italic text-[#1B0B94]">Filtres</h2>
                        <button onClick={onClose} className="p-2 hover:bg-[#1B0B94]/5 rounded-full transition-colors">
                            <X size={24} className="text-[#1B0B94]" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {renderFiltresContent()}
                    </div>
                </div>
            </div>
        );
    }

    return renderFiltresContent();
}

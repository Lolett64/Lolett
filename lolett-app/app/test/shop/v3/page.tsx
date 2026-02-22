import { ShopContentV3_V3 } from '@/components/product/ShopContentV3_V3';
import { productRepository, categoryRepository } from '@/lib/adapters';

export default async function ShopV3Page() {
    const products = await productRepository.findMany({ gender: 'homme' });
    const categories = await categoryRepository.findByGender('homme');

    return (
        <div className="pt-20 bg-[#FDF5E6]">
            <div className="bg-white text-[#1B0B94] border-b border-[#1B0B94]/10 py-2 text-center text-[10px] uppercase tracking-widest font-black sticky top-20 z-[100]">
                CONCEPT 3 : ATELIER MODERNE (Focus Minimalisme & Luminosité)
            </div>
            <ShopContentV3_V3
                gender="homme"
                products={products}
                categories={categories}
                heroImage="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1600&q=80"
                heroTitle="L'Atelier Sud"
                heroSubtitle="Pureté des lignes et matières naturelles. Une collection pensée pour l'essentiel."
            />
        </div>
    );
}

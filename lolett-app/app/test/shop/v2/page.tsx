import { ShopContentV3_V2 } from '@/components/product/ShopContentV3_V2';
import { productRepository, categoryRepository } from '@/lib/adapters';

export default async function ShopV2Page() {
    const products = await productRepository.findMany({ gender: 'homme' });
    const categories = await categoryRepository.findByGender('homme');

    return (
        <div className="pt-20 bg-[#FDF5E6]">
            <div className="bg-[#B89547] text-white py-2 text-center text-[10px] uppercase tracking-widest font-black sticky top-20 z-[100]">
                CONCEPT 2 : ÉDITORIAL MAGAZINE (Focus Typo & Fluidité)
            </div>
            <ShopContentV3_V2
                gender="homme"
                products={products}
                categories={categories}
                heroImage="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1600&q=80"
                heroTitle="Ligne Riviera"
                heroSubtitle="L'expression d'un style décontracté et raffiné, inspiré par les côtes ensoleillées."
            />
        </div>
    );
}

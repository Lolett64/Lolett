import { ShopContentV3_V1 } from '@/components/product/ShopContentV3_V1';
import { productRepository, categoryRepository } from '@/lib/adapters';

export default async function ShopV1Page() {
    const products = await productRepository.findMany({ gender: 'homme' });
    const categories = await categoryRepository.findByGender('homme');

    return (
        <div className="pt-20 bg-[#FDF5E6]">
            <div className="bg-[#1B0B94] text-white py-2 text-center text-[10px] uppercase tracking-widest font-black sticky top-20 z-[100]">
                CONCEPT 1 : CONSOLE HÉRITAGE (Focus Impact & Luxe)
            </div>
            <ShopContentV3_V1
                gender="homme"
                products={products}
                categories={categories}
                heroImage="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1600&q=80"
                heroTitle="Élégance Solaire"
                heroSubtitle="Découvrez une sélection pensée pour les journées lumineuses du Sud. Lin premium et coupes intemporelles."
            />
        </div>
    );
}

import { productRepository, lookRepository } from '@/lib/adapters';
import { LooksSection } from '@/components/sections/home/LooksSection';
import { LooksSectionV2 } from '@/components/sections/home/LooksSectionV2';
import { LooksSectionV3 } from '@/components/sections/home/LooksSectionV3';

export default async function LooksTestPage() {
  const looks = await lookRepository.findMany();

  const lookProductsEntries = await Promise.all(
    looks.map(async (look: { id: string; productIds: string[] }) => {
      const products = await productRepository.findByIds(look.productIds);
      return [look.id, products] as const;
    })
  );
  const lookProducts = Object.fromEntries(lookProductsEntries);

  return (
    <div>
      {/* Label V1 */}
      <div className="bg-black py-4 text-center text-lg font-bold text-white">
        V1 — Fond clair + SVG décoratif
      </div>
      <LooksSection looks={looks} lookProducts={lookProducts} />

      {/* Label V2 */}
      <div className="bg-black py-4 text-center text-lg font-bold text-white">
        V2 — Fond sombre premium + bordure dorée
      </div>
      <LooksSectionV2 looks={looks} lookProducts={lookProducts} />

      {/* Label V3 */}
      <div className="bg-black py-4 text-center text-lg font-bold text-white">
        V3 — Split layout (info gauche / image droite)
      </div>
      <LooksSectionV3 looks={looks} lookProducts={lookProducts} />
    </div>
  );
}

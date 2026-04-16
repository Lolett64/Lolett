import { ProductRow, TH } from './ProductRow';
import type { Product } from './ProductRow';

export function CategoryTable({ products }: { products: Product[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200/50 bg-[#FDF5E6]">
          <tr>
            <th className={TH}>Produit</th>
            <th className={`${TH} text-right`}>Prix</th>
            <th className={`${TH} text-center`}>Stock</th>
            <th className={`${TH} text-center hidden sm:table-cell`}>Statut</th>
            <th className={`${TH} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/50">
          {products.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

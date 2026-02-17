'use client';

import { BrandHeading } from '@/components/brand/BrandHeading';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { useCartStore, useCartCalculation, CartItem, OrderSummary } from '@/features/cart';

export default function PanierPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const { cartProducts, itemCount } = useCartCalculation(items);

  return (
    <div className="pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="container">
        <Breadcrumbs items={[{ label: 'Panier' }]} />

        <div className="mt-6 mb-8 sm:mt-8 sm:mb-12">
          <BrandHeading as="h1" size="2xl">
            Mon Panier
          </BrandHeading>
          {cartProducts.length > 0 && (
            <p className="text-lolett-gray-600 mt-4">
              {itemCount} article{itemCount > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {cartProducts.length === 0 ? (
          <EmptyCart
            showIcon
            title="Ton panier est vide"
            message="T'es à deux clics d'être le plus stylé de ta terrasse."
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="space-y-4 sm:space-y-6 lg:col-span-2">
              {cartProducts.map((item) => (
                <CartItem
                  key={`${item.productId}-${item.size}`}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <div className="lg:col-span-1">
              <OrderSummary items={items} variant="cart" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

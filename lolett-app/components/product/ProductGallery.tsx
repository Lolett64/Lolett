'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { BrandBadge } from '@/components/brand/BrandBadge';

interface ProductGalleryProps {
  images: string[];
  name: string;
  selectedImage: number;
  onSelectImage: (index: number) => void;
  isNew?: boolean;
  isLowStock?: boolean;
  stockCount?: number;
}

export function ProductGallery({
  images,
  name,
  selectedImage,
  onSelectImage,
  isNew,
  isLowStock,
  stockCount,
}: ProductGalleryProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-[#f5f0e8] relative aspect-[3/4] overflow-hidden rounded-xl sm:rounded-2xl">
        <Image
          src={images[selectedImage]}
          alt={name}
          fill
          className="object-contain"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2 sm:top-4 sm:left-4">
          {isNew && <BrandBadge variant="new">Nouveau</BrandBadge>}
          {isLowStock && <BrandBadge variant="lowStock">Plus que {stockCount}</BrandBadge>}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 sm:gap-3">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onSelectImage(index)}
              aria-label={`Vue ${index + 1}`}
              className={cn(
                'relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg transition-all sm:h-24 sm:w-20',
                selectedImage === index
                  ? 'ring-lolett-gold ring-2'
                  : 'opacity-60 hover:opacity-100'
              )}
            >
              <Image
                src={image}
                alt={`${name} - Vue ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

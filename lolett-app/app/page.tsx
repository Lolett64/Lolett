import {
  HeroSection,
  MarqueeSection,
  NewArrivalsSection,
  CollectionsSection,
  LooksSection,
  BrandStorySection,
  TestimonialsSection,
  SocialFeedSection,
  NewsletterSection,
} from '@/components/sections/home';
import { getNewProducts } from '@/data/products';
import { looks } from '@/data/looks';
import { reviews } from '@/data/reviews';

export default function HomePage() {
  const newProducts = getNewProducts(4);

  return (
    <>
      <HeroSection />
      <MarqueeSection />
      <NewArrivalsSection products={newProducts} />
      <CollectionsSection />
      <LooksSection looks={looks} />
      <BrandStorySection />
      <TestimonialsSection reviews={reviews} />
      <SocialFeedSection />
      <NewsletterSection />
    </>
  );
}

import type { Metadata } from 'next';
import {
  HeroHistoireV2,
  OrigineSection,
  VisionSection,
  MediterraneeSection,
  CTAHistoireV2,
} from '@/components/sections/histoire/v2';

export const metadata: Metadata = {
  title: 'Notre Histoire V2 — Test',
  robots: 'noindex',
};

export default function NotreHistoireV2Page() {
  return (
    <div className="relative">
      <HeroHistoireV2 />
      <OrigineSection />
      <VisionSection />
      <MediterraneeSection />
      <CTAHistoireV2 />
    </div>
  );
}

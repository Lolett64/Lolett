import { BrandHeading } from '@/components/brand/BrandHeading';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ContactInfo } from '@/components/contact/ContactInfo';
import { ContactForm } from '@/components/forms/ContactForm';

export default function ContactPage() {
  return (
    <div className="pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="container">
        <Breadcrumbs items={[{ label: 'Contact' }]} />

        <div className="mt-6 mb-8 text-center sm:mt-8 sm:mb-12">
          <BrandHeading as="h1" size="2xl">
            Contacte-nous
          </BrandHeading>
          <p className="text-lolett-gray-600 mx-auto mt-4 max-w-[55ch] leading-relaxed">
            Une question, une suggestion ? On est là pour toi.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-20">
          <ContactInfo />
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

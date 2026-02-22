import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTAHistoire() {
  return (
    <section className="border-t border-[#d9d0c0] bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <span className="font-display text-6xl font-bold leading-none text-[#f0ece4]">IV.</span>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Installe-toi, regarde,<br />et si tu craques…
        </h2>
        <p className="mt-4 text-sm italic text-[#9a8f84]">On t&apos;avait prévenu.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/shop/femme"
            className="inline-flex items-center gap-2 rounded-full bg-[#1a1510] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#1B0B94]"
          >
            Shop Femme <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/shop/homme"
            className="inline-flex items-center gap-2 rounded-full border border-[#d5cfc5] px-8 py-3.5 text-sm font-semibold text-[#1a1510] transition-all hover:border-[#1B0B94]"
          >
            Shop Homme <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

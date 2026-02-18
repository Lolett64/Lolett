import Image from 'next/image';

const femmeOptions = [
  {
    label: 'A — Duomo Florence — cadrage center center (par défaut)',
    url: 'https://plus.unsplash.com/premium_photo-1683141076955-bddd5efbb03c?w=1600&q=80',
    objectPosition: 'center center',
  },
  {
    label: 'A2 — Duomo Florence — cadrage 30% center (décalé gauche)',
    url: 'https://plus.unsplash.com/premium_photo-1683141076955-bddd5efbb03c?w=1600&q=80',
    objectPosition: '30% center',
  },
  {
    label: 'A3 — Duomo Florence — cadrage 70% center (décalé droite)',
    url: 'https://plus.unsplash.com/premium_photo-1683141076955-bddd5efbb03c?w=1600&q=80',
    objectPosition: '70% center',
  },
  {
    label: 'B — Café + vue Duomo Florence, lifestyle italien (8192×5464)',
    url: 'https://plus.unsplash.com/premium_photo-1663040271283-bd044a62da1a?w=1600&q=80',
  },
  {
    label: 'C — Robe rouge en gondole, Venise (7106×4737)',
    url: 'https://images.unsplash.com/photo-1770286491134-396412da6463?w=1600&q=80',
  },
  {
    label: 'D — Femme marchant le long d\'un canal, Venise (6000×3375 ultra-wide)',
    url: 'https://images.unsplash.com/photo-1741554555137-800f4b3919ed?w=1600&q=80',
  },
  {
    label: 'E — Robe bleue claire, sourire, lumière chaude (6000×4000)',
    url: 'https://images.unsplash.com/photo-1762341531803-346fe8132e05?w=1600&q=80',
  },
  {
    label: 'F — Robe florale, trottoir Rome (5568×3712)',
    url: 'https://images.unsplash.com/photo-1630082999227-d840d7f20141?w=1600&q=80',
  },
  {
    label: 'G — Femme adossée mur, pose décontractée (5935×3962)',
    url: 'https://images.unsplash.com/photo-1556136412-7ea719d2af4d?w=1600&q=80',
  },
  {
    label: 'H — Femme marchant rue bâtiment jaune (6000×4000)',
    url: 'https://images.unsplash.com/photo-1518004976887-f5dca2256319?w=1600&q=80',
  },
  {
    label: 'I — Robe off-shoulder, côte Amalfi, golden hour (5184×3456)',
    url: 'https://images.unsplash.com/flagged/photo-1578508158380-1e3ec4bca372?w=1600&q=80',
  },
  {
    label: 'J — Voyageuse Stradun Dubrovnik (7952×5304)',
    url: 'https://plus.unsplash.com/premium_photo-1661962728154-86dcca0cef7f?w=1600&q=80',
  },
];

/* ─── HOMME VALIDÉ ─── */
const hommeValidated = {
  label: 'VALIDÉ — Cour orangers, center 65%',
  url: 'https://images.unsplash.com/photo-1771148885935-c57afa2726bc?w=1600&q=80',
  objectPosition: 'center 65%',
};

export default function HeroTestPage() {
  return (
    <div className="min-h-screen bg-[#fefcf8] pt-24 pb-20">
      <div className="container max-w-6xl">
        <h1 className="font-display mb-2 text-3xl font-bold text-[#1a1510]">
          Test Bannières Hero — Collection Femme
        </h1>
        <p className="mb-12 text-[#6b6b7a]">
          10 options en format bannière paysage. Homme validé en bas pour référence visuelle.
        </p>

        {/* ─── FEMME ─── */}
        <section className="mb-20">
          <div className="space-y-10">
            {femmeOptions.map((opt, i) => (
              <div key={i}>
                <p className="mb-3 text-sm font-semibold tracking-wider uppercase text-[#1a1510]">
                  {opt.label}
                </p>
                <div className="relative overflow-hidden rounded-xl" style={{ height: 'clamp(320px, 40vw, 520px)' }}>
                  <Image
                    src={opt.url}
                    alt={opt.label}
                    fill
                    className="object-cover"
                    style={{ objectPosition: opt.objectPosition ?? 'center center' }}
                    sizes="100vw"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to right, rgba(26,21,16,0.65), rgba(26,21,16,0.2))' }}
                  />
                  <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12">
                    <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#c4a44e' }}>
                      LOLETT
                    </span>
                    <h3 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">
                      Collection Femme
                    </h3>
                    <p className="mt-2 max-w-[45ch] text-sm text-white/70 sm:text-base">
                      Robes fluides, tops en lin. L&apos;art de vivre à la méditerranéenne.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── HOMME (RÉFÉRENCE) ─── */}
        <section>
          <h2 className="font-display mb-8 text-2xl font-semibold" style={{ color: '#c4a44e' }}>
            Homme — Validé (référence)
          </h2>
          <div className="relative overflow-hidden rounded-xl" style={{ height: 'clamp(320px, 40vw, 520px)' }}>
            <Image
              src={hommeValidated.url}
              alt={hommeValidated.label}
              fill
              className="object-cover"
              style={{ objectPosition: hommeValidated.objectPosition }}
              sizes="100vw"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to right, rgba(26,21,16,0.65), rgba(26,21,16,0.2))' }}
            />
            <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12">
              <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#c4a44e' }}>
                LOLETT
              </span>
              <h3 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">
                Collection Homme
              </h3>
              <p className="mt-2 max-w-[45ch] text-sm text-white/70 sm:text-base">
                Lin léger, coton premium. Tout ce qu&apos;il faut pour un été au Sud.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

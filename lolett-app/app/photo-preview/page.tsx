import Image from 'next/image';

export default function PhotoPreviewPage() {
  return (
    <div className="min-h-screen bg-[#1a1510] pt-24 pb-20">
      <div className="container max-w-5xl">
        <h1 className="font-display mb-4 text-2xl font-bold text-white">
          Photo complète — Homme cour méditerranéenne
        </h1>
        <p className="mb-8 text-white/60">
          Dis-moi quelle partie tu veux cadrer pour la bannière (haut, centre, bas, etc.)
        </p>
        <div className="relative w-full overflow-hidden rounded-xl">
          <Image
            src="https://images.unsplash.com/photo-1771148885935-c57afa2726bc?w=2000&q=90"
            alt="Homme cour méditerranéenne orangers — photo complète"
            width={2000}
            height={1500}
            className="h-auto w-full"
            sizes="100vw"
          />
        </div>
      </div>
    </div>
  );
}

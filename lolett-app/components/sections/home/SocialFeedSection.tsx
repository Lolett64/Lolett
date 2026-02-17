import Image from 'next/image';
import { TikTokIcon, InstagramIcon } from '@/components/icons';

const socialItems = [
  { photo: 'photo-1469334031218-e382a71b716b', platform: 'instagram' },
  { photo: 'photo-1617137968427-85924c800a22', platform: 'tiktok' },
  { photo: 'photo-1485968579169-a6e9dc7b4b7e', platform: 'instagram' },
  { photo: 'photo-1523359346063-d879354c0ea5', platform: 'tiktok' },
] as const;

export function SocialFeedSection() {
  return (
    <section className="bg-lolett-gray-900 relative overflow-hidden py-20 sm:py-28 lg:py-36">
      <div className="container">
        <div className="mb-12 text-center sm:mb-16">
          {/* Social icons with brand colors */}
          <div className="mb-6 inline-flex items-center gap-4">
            <div className="rounded-full bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] p-2">
              <InstagramIcon className="h-5 w-5 flex-shrink-0 text-white" />
            </div>
            <div className="rounded-full bg-black p-2">
              <TikTokIcon className="h-5 w-5 flex-shrink-0 text-white" />
            </div>
            <span className="text-lg font-medium text-white">@lolett</span>
          </div>
          <h2 className="font-display text-4xl leading-[1.1] font-bold text-white sm:text-5xl lg:text-6xl">
            Rejoins la Communauté
          </h2>
        </div>

        {/* Social grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {socialItems.map((item, i) => (
            <a
              key={i}
              href={
                item.platform === 'instagram'
                  ? 'https://instagram.com/lolett'
                  : 'https://tiktok.com/@lolett'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl"
            >
              <Image
                src={`https://images.unsplash.com/${item.photo}?w=600&q=80`}
                alt={`${item.platform === 'instagram' ? 'Instagram' : 'TikTok'} ${i + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                  item.platform === 'instagram'
                    ? 'bg-transparent group-hover:bg-gradient-to-br group-hover:from-[#833AB4]/70 group-hover:via-[#E1306C]/70 group-hover:to-[#F77737]/70'
                    : 'bg-transparent group-hover:bg-black/70'
                }`}
              >
                {item.platform === 'instagram' ? (
                  <InstagramIcon className="h-8 w-8 scale-50 text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
                ) : (
                  <TikTokIcon className="h-8 w-8 scale-50 text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
                )}
              </div>
            </a>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* Instagram CTA */}
          <a
            href="https://instagram.com/lolett"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] px-8 py-4 font-medium text-white shadow-lg transition-all duration-300 hover:opacity-90"
          >
            <InstagramIcon className="h-5 w-5" />
            <span>Suivre sur Instagram</span>
          </a>
          {/* TikTok CTA */}
          <a
            href="https://tiktok.com/@lolett"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-black px-8 py-4 font-medium text-white shadow-lg transition-all duration-300 hover:bg-gray-900"
          >
            <TikTokIcon className="h-5 w-5" />
            <span>Suivre sur TikTok</span>
          </a>
        </div>
      </div>
    </section>
  );
}

'use client';

import { cn } from '@/lib/utils';
import { TikTokIcon, InstagramIcon } from '@/components/icons';

interface SocialDropdownProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function SocialDropdown({ isOpen, onOpen, onClose }: SocialDropdownProps) {
  return (
    <div className="relative hidden sm:block" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        className="text-white group-data-[scrolled=true]/header:text-[#5a4d3e] group-data-[scrolled=true]/header:hover:text-[#1a1510] touch-target flex items-center justify-center p-2.5 transition-colors"
        aria-label="Réseaux sociaux"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-lg font-semibold">@</span>
      </button>

      <div
        className={cn(
          'absolute top-full right-0 pt-2 transition-all duration-300',
          isOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        )}
      >
        <div className="border-lolett-gray-200 flex min-w-[140px] flex-col gap-2 rounded-xl border bg-white p-3 shadow-lg">
          <a
            href="https://instagram.com/lolett"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-gradient-to-r hover:from-[#833AB4]/10 hover:via-[#E1306C]/10 hover:to-[#F77737]/10"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737]">
              <InstagramIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-lolett-gray-700 group-hover:text-lolett-gray-900 text-sm font-medium">
              Instagram
            </span>
          </a>
          <a
            href="https://tiktok.com/@lolett"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-black/5"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black">
              <TikTokIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-lolett-gray-700 group-hover:text-lolett-gray-900 text-sm font-medium">
              TikTok
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

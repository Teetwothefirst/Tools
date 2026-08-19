'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Info, Plus, Check } from 'lucide-react';
import { ContentItemDto } from '@netflix/shared-types';

interface HeroBannerProps {
  item: ContentItemDto;
  onOpenDetails: (item: ContentItemDto) => void;
  isInWatchlist?: boolean;
  onToggleWatchlist?: (id: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  item,
  onOpenDetails,
  isInWatchlist = false,
  onToggleWatchlist,
}) => {
  return (
    <div className="relative w-full h-[75vh] sm:h-[85vh] flex items-end justify-start overflow-hidden select-none">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url(${item.backdropUrl || item.posterUrl})` }}
      />

      {/* Hero Dark Vignette Gradient Overlay */}
      <div className="absolute inset-0 hero-vignette" />

      {/* Content Metadata & Buttons */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="max-w-2xl space-y-4">
          {/* Metadata Badges */}
          <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-gray-300">
            <span className="bg-netflix-red text-white px-2.5 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
              FEATURED
            </span>
            <span className="border border-gray-500/60 px-1.5 py-0.2 rounded text-gray-300">
              {item.maturityRating || 'TV-MA'}
            </span>
            <span>{item.releaseYear}</span>
            <span className="border border-white/30 px-1 rounded text-[10px] text-white">4K ULTRA HD</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-['Outfit'] drop-shadow-lg leading-none">
            {item.title}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-200 line-clamp-3 leading-relaxed drop-shadow-md">
            {item.description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Link
              href={`/watch/${item.id}`}
              className="flex items-center gap-2 bg-white hover:bg-gray-200 text-black px-6 sm:px-8 py-3 rounded-md font-bold text-sm sm:text-base transition-all hover:scale-105 shadow-xl"
            >
              <Play className="w-5 h-5 fill-black" />
              Play
            </Link>

            <button
              onClick={() => onOpenDetails(item)}
              className="flex items-center gap-2 bg-gray-500/40 hover:bg-gray-500/60 text-white px-5 sm:px-7 py-3 rounded-md font-semibold text-sm sm:text-base backdrop-blur-md border border-white/20 transition-all hover:scale-105"
            >
              <Info className="w-5 h-5" />
              More Info
            </button>

            {onToggleWatchlist && (
              <button
                onClick={() => onToggleWatchlist(item.id)}
                className="p-3 bg-black/40 hover:bg-black/60 text-white rounded-full border border-white/30 backdrop-blur-md transition-transform hover:scale-110"
                title={isInWatchlist ? 'Remove from My List' : 'Add to My List'}
              >
                {isInWatchlist ? <Check className="w-5 h-5 text-green-400" /> : <Plus className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

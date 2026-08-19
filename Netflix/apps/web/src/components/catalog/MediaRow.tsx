'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentItemDto } from '@netflix/shared-types';
import { MediaCard } from './MediaCard';

interface MediaRowProps {
  title: string;
  items: ContentItemDto[];
  onOpenDetails: (item: ContentItemDto) => void;
  watchlistIds?: string[];
  onToggleWatchlist?: (id: string) => void;
}

export const MediaRow: React.FC<MediaRowProps> = ({
  title,
  items,
  onOpenDetails,
  watchlistIds = [],
  onToggleWatchlist,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      rowRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative space-y-2 py-4 px-4 sm:px-6 lg:px-8 group">
      <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] tracking-wide">
        {title}
      </h2>

      <div className="relative flex items-center">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-30 hidden group-hover:flex items-center justify-center w-10 h-full bg-black/60 hover:bg-black/80 text-white transition-opacity duration-300 rounded-r-md backdrop-blur-sm"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={rowRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-2 scroll-smooth w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onOpenDetails={onOpenDetails}
              isInWatchlist={watchlistIds.includes(item.id)}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-30 hidden group-hover:flex items-center justify-center w-10 h-full bg-black/60 hover:bg-black/80 text-white transition-opacity duration-300 rounded-l-md backdrop-blur-sm"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

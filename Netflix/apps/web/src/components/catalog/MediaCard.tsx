'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Plus, Check, Info, ThumbsUp } from 'lucide-react';
import { ContentItemDto } from '@netflix/shared-types';

interface MediaCardProps {
  item: ContentItemDto;
  onOpenDetails: (item: ContentItemDto) => void;
  isInWatchlist?: boolean;
  onToggleWatchlist?: (id: string) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onOpenDetails,
  isInWatchlist = false,
  onToggleWatchlist,
}) => {
  return (
    <div className="group relative flex-shrink-0 w-44 sm:w-56 cursor-pointer select-none rounded-md overflow-hidden bg-netflix-darkGray media-card-hover border border-white/5">
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
        <img
          src={item.posterUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover Quick Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/watch/${item.id}`}
              className="p-2 bg-white hover:bg-gray-200 text-black rounded-full transition-transform hover:scale-110"
              title="Play Now"
            >
              <Play className="w-4 h-4 fill-black" />
            </Link>

            {onToggleWatchlist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWatchlist(item.id);
                }}
                className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full border border-white/30 transition-transform hover:scale-110"
                title={isInWatchlist ? 'Remove from My List' : 'Add to My List'}
              >
                {isInWatchlist ? <Check className="w-4 h-4 text-green-400" /> : <Plus className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(item);
              }}
              className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full border border-white/30 ml-auto transition-transform hover:scale-110"
              title="More Info"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-sm font-bold text-white truncate drop-shadow">{item.title}</h3>

          <div className="flex items-center gap-2 text-[10px] text-gray-300 mt-1">
            <span className="text-green-400 font-semibold">98% Match</span>
            <span className="border border-gray-600 px-1 rounded">{item.maturityRating || 'TV-MA'}</span>
            <span>{item.releaseYear}</span>
          </div>

          {item.genres && item.genres.length > 0 && (
            <p className="text-[10px] text-gray-400 truncate mt-1">
              {item.genres.map((g) => g.genre?.name || g.name).join(' • ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

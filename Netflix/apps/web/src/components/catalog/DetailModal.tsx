'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Play, Plus, Check, Star, Clock, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { ContentItemDto } from '@netflix/shared-types';
import { apiClient } from '@/lib/api';

interface DetailModalProps {
  item: ContentItemDto | null;
  onClose: () => void;
  isInWatchlist?: boolean;
  onToggleWatchlist?: (id: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  onClose,
  isInWatchlist = false,
  onToggleWatchlist,
}) => {
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const [likedState, setLikedState] = useState<boolean | null>(null);

  if (!item) return null;

  const seasons = item.tvShow?.seasons || [];
  const currentSeason = seasons[selectedSeasonIndex];

  const handleRate = (isLike: boolean) => {
    const newState = likedState === isLike ? null : isLike;
    setLikedState(newState);
    apiClient.post('/playback/rate', { profileId: 'p1', contentId: item.id, isLike }).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-netflix-darkGray rounded-xl overflow-hidden shadow-2xl border border-white/10 my-8 text-white animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-transform hover:scale-110 border border-white/20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Header */}
        <div className="relative w-full h-80 sm:h-96 bg-gray-900">
          <img
            src={item.backdropUrl || item.posterUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-darkGray via-netflix-darkGray/40 to-transparent" />

          {/* Header Controls Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
            <h2 className="text-3xl sm:text-5xl font-black font-['Outfit'] drop-shadow-md">{item.title}</h2>

            <div className="flex items-center gap-3">
              <Link
                href={`/watch/${item.id}`}
                className="flex items-center gap-2 bg-white hover:bg-gray-200 text-black px-6 py-2.5 rounded-md font-bold text-sm transition-all hover:scale-105"
              >
                <Play className="w-4 h-4 fill-black" />
                Play Now
              </Link>

              {onToggleWatchlist && (
                <button
                  onClick={() => onToggleWatchlist(item.id)}
                  className="p-2.5 bg-black/50 hover:bg-black/70 text-white rounded-full border border-white/30 transition-transform hover:scale-110"
                  title={isInWatchlist ? 'Remove from My List' : 'Add to My List'}
                >
                  {isInWatchlist ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
                </button>
              )}

              <button
                onClick={() => handleRate(true)}
                className={`p-2.5 rounded-full border transition-transform hover:scale-110 ${
                  likedState === true
                    ? 'bg-emerald-600/80 border-emerald-400 text-white'
                    : 'bg-black/50 border-white/30 text-white hover:bg-black/70'
                }`}
                title="I like this"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleRate(false)}
                className={`p-2.5 rounded-full border transition-transform hover:scale-110 ${
                  likedState === false
                    ? 'bg-red-600/80 border-red-400 text-white'
                    : 'bg-black/50 border-white/30 text-white hover:bg-black/70'
                }`}
                title="Not for me"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300">
                <span className="text-emerald-400 font-bold">98% Match</span>
                <span>{item.releaseYear}</span>
                <span className="border border-gray-600 px-1.5 py-0.5 rounded font-mono">{item.maturityRating || 'TV-MA'}</span>
                {item.movie?.runtimeMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {item.movie.runtimeMinutes} mins
                  </span>
                )}
                <span className="border border-white/30 px-1 rounded text-[10px] font-bold">4K Ultra HD</span>
                <span className="border border-white/30 px-1 rounded text-[10px]">5.1 Audio</span>
              </div>

              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">{item.description}</p>
            </div>

            {/* Cast & Genres */}
            <div className="space-y-3 text-xs sm:text-sm text-gray-400 border-l border-white/10 pl-4 hidden md:block">
              {item.director && (
                <p>
                  <span className="text-gray-500 font-medium">Director:</span>{' '}
                  <span className="text-gray-200">{item.director}</span>
                </p>
              )}
              {item.genres && item.genres.length > 0 && (
                <p>
                  <span className="text-gray-500 font-medium">Genres:</span>{' '}
                  <span className="text-gray-200">{item.genres.map((g) => g.genre?.name || g.name).join(', ')}</span>
                </p>
              )}
              <p>
                <span className="text-gray-500 font-medium">Maturity Rating:</span>{' '}
                <span className="text-gray-200">{item.maturityRating || 'TV-MA'}</span>
              </p>
            </div>
          </div>

          {/* Episode List Section (for TV Shows) */}
          {item.type === 'TV_SHOW' && seasons.length > 0 && (
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-['Outfit']">Episodes</h3>
                {seasons.length > 1 && (
                  <select
                    value={selectedSeasonIndex}
                    onChange={(e) => setSelectedSeasonIndex(Number(e.target.value))}
                    className="bg-black/60 border border-white/20 text-white text-xs px-3 py-1.5 rounded-md focus:outline-none"
                  >
                    {seasons.map((season, idx) => (
                      <option key={season.id} value={idx}>
                        {season.title || `Season ${season.seasonNumber}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Episodes List */}
              <div className="space-y-3">
                {currentSeason?.episodes?.map((ep) => (
                  <Link
                    key={ep.id}
                    href={`/watch/${item.id}?episodeId=${ep.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg bg-black/40 hover:bg-black/70 border border-white/5 hover:border-white/20 transition-all group"
                  >
                    <span className="font-extrabold text-gray-500 text-lg group-hover:text-white w-6 text-center">
                      {ep.episodeNumber}
                    </span>
                    <div className="relative w-28 h-16 rounded overflow-hidden shrink-0 bg-gray-800">
                      <img src={ep.thumbnailUrl} alt={ep.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 fill-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white group-hover:text-netflix-red truncate">
                          {ep.title}
                        </h4>
                        <span className="text-xs text-gray-400">{ep.runtimeMinutes}m</span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1">{ep.overview}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

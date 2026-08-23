'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { HeroBanner } from '@/components/catalog/HeroBanner';
import { MediaRow } from '@/components/catalog/MediaRow';
import { DetailModal } from '@/components/catalog/DetailModal';
import { ContentItemDto } from '@netflix/shared-types';
import { apiClient } from '@/lib/api';

const tvHero: ContentItemDto = {
  id: 'demo-show-1',
  title: 'Chronicles of Eldoria',
  description: 'Forgotten heirs seek to reclaim a shattered continent from dragon lords.',
  type: 'TV_SHOW',
  releaseYear: 2026,
  maturityRating: 'TV_14' as any,
  posterUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600',
  backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200',
  featured: true,
  genres: [{ id: '1', name: 'Fantasy', slug: 'scifi' }],
  cast: [{ id: '1', name: 'Aria Stark' }],
  tvShow: {
    totalSeasons: 2,
    totalEpisodes: 16,
    seasons: [
      {
        id: 's1',
        showId: 'demo-show-1',
        seasonNumber: 1,
        title: 'Season 1: The Gathering Storm',
        episodes: [
          {
            id: 'ep1',
            seasonId: 's1',
            episodeNumber: 1,
            title: 'The Fallen Crown',
            overview: 'A young hunter discovers a legendary blade.',
            runtimeMinutes: 52,
            thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500',
            mediaAssetId: 'm1',
          },
        ],
      },
    ],
  },
};

const tvRows = [
  {
    id: 'binge-shows',
    title: 'Binge-Worthy TV Series',
    items: [tvHero],
  },
];

export default function TVShowsPage() {
  const [hero, setHero] = useState<ContentItemDto>(tvHero);
  const [rows, setRows] = useState(tvRows);
  const [selectedItem, setSelectedItem] = useState<ContentItemDto | null>(null);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [genreFilter, setGenreFilter] = useState('all');

  useEffect(() => {
    apiClient
      .get(`/search?type=TV_SHOW${genreFilter !== 'all' ? `&genre=${genreFilter}` : ''}`)
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          setRows([{ id: 'filtered-shows', title: genreFilter === 'all' ? 'Top TV Shows' : `${genreFilter.toUpperCase()} TV Series`, items: data }]);
        }
      })
      .catch(() => {});
  }, [genreFilter]);

  const handleToggleWatchlist = (id: string) => {
    setWatchlistIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen bg-netflix-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pb-16">
        <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between z-30 relative">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold font-['Outfit']">TV Shows</h1>
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="bg-black/80 border border-white/20 text-xs font-semibold px-3 py-1.5 rounded text-white focus:outline-none focus:border-netflix-red cursor-pointer"
            >
              <option value="all">Genres</option>
              <option value="scifi">Sci-Fi & Fantasy</option>
              <option value="action">Action</option>
              <option value="crime">Crime & Drama</option>
            </select>
          </div>
        </div>

        <HeroBanner
          item={hero}
          onOpenDetails={(item) => setSelectedItem(item)}
          isInWatchlist={watchlistIds.includes(hero.id)}
          onToggleWatchlist={handleToggleWatchlist}
        />

        <div className="-mt-12 sm:-mt-20 relative z-20 space-y-6">
          {rows.map((row) => (
            <MediaRow
              key={row.id}
              title={row.title}
              items={row.items}
              onOpenDetails={(item) => setSelectedItem(item)}
              watchlistIds={watchlistIds}
              onToggleWatchlist={handleToggleWatchlist}
            />
          ))}
        </div>
      </main>

      <DetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        isInWatchlist={selectedItem ? watchlistIds.includes(selectedItem.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
      />
    </div>
  );
}

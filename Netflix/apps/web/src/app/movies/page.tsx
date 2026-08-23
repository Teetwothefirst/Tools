'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { HeroBanner } from '@/components/catalog/HeroBanner';
import { MediaRow } from '@/components/catalog/MediaRow';
import { DetailModal } from '@/components/catalog/DetailModal';
import { ContentItemDto } from '@netflix/shared-types';
import { apiClient } from '@/lib/api';

const movieHero: ContentItemDto = {
  id: 'demo-movie-hero',
  title: 'Cyber Sentinel: 2099',
  description: 'In a rain-drenched megacity controlled by Rogue AI networks, a lone cybernetic enforcer must uncover a conspiracy that threatens the survival of humanity.',
  type: 'MOVIE',
  releaseYear: 2026,
  maturityRating: 'TV_MA' as any,
  posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600',
  backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200',
  featured: true,
  genres: [{ id: '1', name: 'Sci-Fi & Fantasy', slug: 'scifi' }],
  cast: [{ id: '1', name: 'Kaito Tanaka' }],
  director: 'Elena Rostova',
  runtimeMinutes: 124,
};

const movieRows = [
  {
    id: 'blockbusters',
    title: 'Blockbuster Action Movies',
    items: [
      movieHero,
      {
        id: 'demo-2',
        title: 'Eclipse Protocol',
        description: 'Deep-space research crew realizes something ancient is watching them.',
        type: 'MOVIE',
        releaseYear: 2025,
        maturityRating: 'PG13' as any,
        posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
        backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200',
        featured: false,
        genres: [{ id: '1', name: 'Sci-Fi', slug: 'scifi' }],
        cast: [],
      },
      {
        id: 'demo-3',
        title: 'Shadows of Kyoto',
        description: 'Undercover detectives navigate honor and battle across nightlit alleyways.',
        type: 'MOVIE',
        releaseYear: 2025,
        maturityRating: 'R' as any,
        posterUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600',
        backdropUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200',
        featured: true,
        genres: [{ id: '2', name: 'Action', slug: 'action' }],
        cast: [],
      },
    ] as ContentItemDto[],
  },
];

export default function MoviesPage() {
  const [hero, setHero] = useState<ContentItemDto>(movieHero);
  const [rows, setRows] = useState(movieRows);
  const [selectedItem, setSelectedItem] = useState<ContentItemDto | null>(null);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [genreFilter, setGenreFilter] = useState('all');

  useEffect(() => {
    apiClient
      .get(`/search?type=MOVIE${genreFilter !== 'all' ? `&genre=${genreFilter}` : ''}`)
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          setRows([{ id: 'filtered-movies', title: genreFilter === 'all' ? 'Top Movies for You' : `${genreFilter.toUpperCase()} Movies`, items: data }]);
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
        {/* Genre Selector Header */}
        <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between z-30 relative">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold font-['Outfit']">Movies</h1>
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="bg-black/80 border border-white/20 text-xs font-semibold px-3 py-1.5 rounded text-white focus:outline-none focus:border-netflix-red cursor-pointer"
            >
              <option value="all">Genres</option>
              <option value="scifi">Sci-Fi & Fantasy</option>
              <option value="action">Action & Adventure</option>
              <option value="thriller">Thriller</option>
              <option value="crime">Crime</option>
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

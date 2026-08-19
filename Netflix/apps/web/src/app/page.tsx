'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { HeroBanner } from '@/components/catalog/HeroBanner';
import { MediaRow } from '@/components/catalog/MediaRow';
import { DetailModal } from '@/components/catalog/DetailModal';
import { ContentItemDto } from '@netflix/shared-types';
import { apiClient } from '@/lib/api';

// Demo fallback catalog items if API server is offline
const fallbackHeroItem: ContentItemDto = {
  id: 'demo-hero-1',
  title: 'Cyber Sentinel: 2099',
  description:
    'In a rain-drenched megacity controlled by Rogue AI networks, a lone cybernetic enforcer must uncover a conspiracy that threatens the survival of humanity.',
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

const fallbackRows = [
  {
    id: 'trending',
    title: 'Trending Now',
    items: [
      fallbackHeroItem,
      {
        id: 'demo-2',
        title: 'Eclipse Protocol',
        description: 'Deep-space research crew realizes something ancient is watching them from the dark side of the moon.',
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
  {
    id: 'shows',
    title: 'Binge-Worthy TV Shows',
    items: [
      {
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
        cast: [],
        tvShow: {
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
      },
    ] as ContentItemDto[],
  },
];

export default function HomePage() {
  const [heroItem, setHeroItem] = useState<ContentItemDto>(fallbackHeroItem);
  const [rows, setRows] = useState<{ id: string; title: string; items: ContentItemDto[] }[]>(fallbackRows);
  const [selectedItem, setSelectedItem] = useState<ContentItemDto | null>(null);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);

  useEffect(() => {
    // Fetch Hero Item
    apiClient
      .get('/catalog/hero')
      .then((data: any) => {
        if (data) setHeroItem(data);
      })
      .catch(() => {});

    // Fetch Rows
    apiClient
      .get('/catalog/rows')
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) setRows(data);
      })
      .catch(() => {});
  }, []);

  const handleToggleWatchlist = (id: string) => {
    setWatchlistIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-netflix-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Hero Section */}
        <HeroBanner
          item={heroItem}
          onOpenDetails={(item) => setSelectedItem(item)}
          isInWatchlist={watchlistIds.includes(heroItem.id)}
          onToggleWatchlist={handleToggleWatchlist}
        />

        {/* Content Rows */}
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

      {/* Details Modal */}
      <DetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        isInWatchlist={selectedItem ? watchlistIds.includes(selectedItem.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 text-xs text-gray-500 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          <div className="space-y-2">
            <p className="hover:underline cursor-pointer">Audio and Subtitles</p>
            <p className="hover:underline cursor-pointer">Media Center</p>
            <p className="hover:underline cursor-pointer">Privacy Policy</p>
          </div>
          <div className="space-y-2">
            <p className="hover:underline cursor-pointer">Help Center</p>
            <p className="hover:underline cursor-pointer">Investor Relations</p>
            <p className="hover:underline cursor-pointer">Legal Notices</p>
          </div>
          <div className="space-y-2">
            <p className="hover:underline cursor-pointer">Gift Cards</p>
            <p className="hover:underline cursor-pointer">Jobs</p>
            <p className="hover:underline cursor-pointer">Cookie Preferences</p>
          </div>
          <div className="space-y-2">
            <p className="hover:underline cursor-pointer">Terms of Use</p>
            <p className="hover:underline cursor-pointer">Corporate Information</p>
            <p className="hover:underline cursor-pointer">Contact Us</p>
          </div>
        </div>
        <p className="text-gray-600">© 2026 StreamFlix, Inc. All rights reserved. Netflix-inspired platform.</p>
      </footer>
    </div>
  );
}

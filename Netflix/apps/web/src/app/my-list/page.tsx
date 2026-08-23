'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { DetailModal } from '@/components/catalog/DetailModal';
import { ContentItemDto } from '@netflix/shared-types';
import { useProfileStore } from '@/stores/useProfileStore';
import { apiClient } from '@/lib/api';
import { Play, Plus, Check, Trash2, Bookmark } from 'lucide-react';
import Link from 'next/link';

const fallbackWatchlist: ContentItemDto[] = [
  {
    id: 'demo-hero-1',
    title: 'Cyber Sentinel: 2099',
    description: 'In a rain-drenched megacity controlled by Rogue AI networks, a lone cybernetic enforcer must uncover a conspiracy.',
    type: 'MOVIE',
    releaseYear: 2026,
    maturityRating: 'TV_MA' as any,
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200',
    featured: true,
    genres: [{ id: '1', name: 'Sci-Fi & Fantasy', slug: 'scifi' }],
    cast: [{ id: '1', name: 'Kaito Tanaka' }],
    runtimeMinutes: 124,
  },
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
];

export default function MyListPage() {
  const [items, setItems] = useState<ContentItemDto[]>(fallbackWatchlist);
  const [selectedItem, setSelectedItem] = useState<ContentItemDto | null>(null);
  const { activeProfile } = useProfileStore();

  useEffect(() => {
    if (activeProfile?.id) {
      apiClient
        .get(`/playback/watchlist?profileId=${activeProfile.id}`)
        .then((data: any) => {
          if (Array.isArray(data) && data.length > 0) {
            setItems(data);
          }
        })
        .catch(() => {});
    }
  }, [activeProfile?.id]);

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (activeProfile?.id) {
      apiClient.post('/playback/watchlist/toggle', { profileId: activeProfile.id, contentId: id }).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-netflix-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-8 h-8 text-netflix-red" />
          <h1 className="text-3xl sm:text-4xl font-bold font-['Outfit']">My Watchlist</h1>
          <span className="text-sm text-gray-400 font-medium">({items.length} titles)</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <p className="text-gray-400 text-lg">Your watchlist is currently empty.</p>
            <p className="text-xs text-gray-500">Add titles to your list so you can easily find them later.</p>
            <Link
              href="/"
              className="inline-block bg-netflix-red text-white font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative bg-netflix-darkGray rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:z-30 hover:shadow-2xl border border-white/10"
              >
                <div className="aspect-[2/3] relative w-full overflow-hidden">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                    <div className="flex items-center justify-between mb-2">
                      <Link
                        href={`/watch/${item.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-white text-black rounded-full hover:bg-netflix-red hover:text-white transition-colors shadow-lg"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </Link>
                      <button
                        onClick={(e) => handleRemove(item.id, e)}
                        className="p-2 bg-black/60 text-red-400 hover:bg-red-600 hover:text-white rounded-full transition-colors border border-white/20"
                        title="Remove from My List"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-white truncate">{item.title}</p>
                    <p className="text-[10px] text-gray-300">{item.releaseYear} • {item.maturityRating}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <DetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        isInWatchlist={true}
        onToggleWatchlist={(id) => {
          setItems((prev) => prev.filter((item) => item.id !== id));
        }}
      />
    </div>
  );
}

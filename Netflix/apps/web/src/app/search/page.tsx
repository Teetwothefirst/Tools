'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { MediaCard } from '@/components/catalog/MediaCard';
import { DetailModal } from '@/components/catalog/DetailModal';
import { ContentItemDto } from '@netflix/shared-types';
import { apiClient } from '@/lib/api';
import { SearchX } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const genre = searchParams?.get('genre') || '';

  const [results, setResults] = useState<ContentItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItemDto | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/catalog/search?q=${encodeURIComponent(query)}&genre=${encodeURIComponent(genre)}`)
      .then((data: any) => {
        if (Array.isArray(data)) setResults(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [query, genre]);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit'] mb-6">
        {query ? `Search results for "${query}"` : 'Browse Catalog'}
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-md skeleton-shimmer" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {results.map((item) => (
            <MediaCard key={item.id} item={item} onOpenDetails={(i) => setSelectedItem(i)} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 space-y-4">
          <SearchX className="w-16 h-16 text-netflix-red" />
          <p className="text-lg font-semibold text-white">No matches found for "{query}"</p>
          <p className="text-sm max-w-md text-center">
            Try searching for movie titles, TV shows, actors, directors, or genres.
          </p>
        </div>
      )}

      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-netflix-black text-white flex flex-col">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-md skeleton-shimmer" />
            ))}
          </div>
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}

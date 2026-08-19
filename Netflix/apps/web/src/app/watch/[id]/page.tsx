'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { HlsPlayer } from '@/features/player/HlsPlayer';
import { ContentItemDto } from '@netflix/shared-types';
import { apiClient } from '@/lib/api';

const sampleHlsStream = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

function WatchContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const episodeId = searchParams?.get('episodeId') as string | undefined;

  const [item, setItem] = useState<ContentItemDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      apiClient
        .get(`/catalog/items/${id}`)
        .then((data: any) => {
          if (data) setItem(data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  const streamUrl =
    item?.movie?.mediaAsset?.masterManifestUrl ||
    item?.tvShow?.seasons?.[0]?.episodes?.[0]?.mediaAsset?.masterManifestUrl ||
    sampleHlsStream;

  return (
    <div className="w-screen h-screen bg-black">
      <HlsPlayer
        streamUrl={streamUrl}
        title={item?.title || 'Cyber Sentinel: 2099'}
        subtitle={episodeId ? 'Season 1 • Episode 1: The Fallen Crown' : `${item?.releaseYear || 2026} • HD`}
        contentId={id}
        episodeId={episodeId}
      />
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-black" />}>
      <WatchContent />
    </Suspense>
  );
}

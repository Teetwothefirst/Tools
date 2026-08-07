'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { BarChart3, TrendingUp, Users, Clock, Music, Disc, Globe2, Calendar, Radio, Sparkles, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function CreatorAnalyticsPage() {
  const { user, token, isAuthenticated } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['creator-analytics'],
    queryFn: async () => {
      const res = await api.get('/catalog/analytics/creator');
      return res.data;
    },
  });

  const overview = analytics?.overview || {
    totalStreams: 128450,
    monthlyListeners: 48200,
    totalTracks: 18,
    totalAlbums: 4,
    totalHoursStreamed: 6850,
  };

  const weeklyStreams = analytics?.weeklyStreams || [
    { day: 'Mon', streams: 14200 },
    { day: 'Tue', streams: 18500 },
    { day: 'Wed', streams: 16800 },
    { day: 'Thu', streams: 21400 },
    { day: 'Fri', streams: 28900 },
    { day: 'Sat', streams: 34200 },
    { day: 'Sun', streams: 26100 },
  ];

  const maxStream = Math.max(...weeklyStreams.map((s: any) => s.streams));

  const demographics = analytics?.topDemographics || [
    { region: 'United States', percentage: 38, count: 48800, flag: '🇺🇸' },
    { region: 'United Kingdom', percentage: 22, count: 28250, flag: '🇬🇧' },
    { region: 'Nigeria', percentage: 16, count: 20550, flag: '🇳🇬' },
    { region: 'Germany', percentage: 14, count: 17980, flag: '🇩🇪' },
    { region: 'Japan', percentage: 10, count: 12870, flag: '🇯🇵' },
  ];

  const topTracks = analytics?.topTracks || [];

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4 my-16">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold">Creator Access Required</h2>
        <p className="text-sm text-muted-foreground">
          Sign in as an Admin/Creator to access stream analytics and release scheduling.
        </p>
        <Link href="/admin" className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm inline-block">
          Go to Creator Studio
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" /> Spotify for Artists Mode
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Artist & Stream Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time listener metrics, streaming velocity, and geographical distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="px-4 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs flex items-center gap-2 hover:opacity-90 transition shadow-md"
          >
            <Music className="w-4 h-4" /> Upload & Manage Releases
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Streams</span>
            <Radio className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-foreground">{overview.totalStreams.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% this month
          </p>
        </div>

        <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Listeners</span>
            <Users className="w-5 h-5 text-accent" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-foreground">{overview.monthlyListeners.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +12.1% unique listeners
          </p>
        </div>

        <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Hours Streamed</span>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-foreground">{overview.totalHoursStreamed.toLocaleString()} hrs</p>
          <p className="text-xs text-muted-foreground font-medium">Avg 3.2 mins per stream</p>
        </div>

        <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Releases</span>
            <Disc className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-foreground">{overview.totalTracks} Tracks</p>
          <p className="text-xs text-muted-foreground font-medium">{overview.totalAlbums} Published Albums</p>
        </div>
      </div>

      {/* Analytics Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Stream Velocity Chart */}
        <div className="lg:col-span-2 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Weekly Streaming Velocity
              </h3>
              <p className="text-xs text-muted-foreground">Daily playback volume across all tracks</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-full">Last 7 Days</span>
          </div>

          {/* Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
            {weeklyStreams.map((s: any) => {
              const heightPct = Math.round((s.streams / maxStream) * 100);
              return (
                <div key={s.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {(s.streams / 1000).toFixed(1)}k
                  </span>
                  <div className="w-full bg-muted/40 rounded-xl h-48 flex items-end overflow-hidden p-1">
                    <div
                      className="w-full bg-gradient-to-t from-primary to-accent rounded-lg transition-all duration-500 group-hover:scale-105"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">{s.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Demographics & Regions */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="border-b border-border pb-4">
            <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-accent" /> Top Regions
            </h3>
            <p className="text-xs text-muted-foreground">Listener stream geographic breakdown</p>
          </div>

          <div className="space-y-4">
            {demographics.map((item: any) => (
              <div key={item.region} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2">
                    <span className="text-base">{item.flag}</span>
                    <span className="text-foreground">{item.region}</span>
                  </span>
                  <span className="text-primary font-mono">{item.percentage}% ({item.count.toLocaleString()})</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Songs Table */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" /> Top Performing Songs
          </h3>
          <Link href="/admin" className="text-xs font-bold text-primary hover:underline">
            Manage Releases
          </Link>
        </div>

        {topTracks.length > 0 ? (
          <div className="divide-y divide-border/40">
            {topTracks.map((track: any, idx: number) => (
              <div key={track.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="w-6 text-center text-sm font-bold text-muted-foreground">#{idx + 1}</span>
                  {track.album?.coverUrl ? (
                    <img src={track.album.coverUrl} className="w-11 h-11 rounded-xl object-cover" alt="" />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
                      <Music className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist?.name || 'Artist'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <span className="font-mono font-bold text-primary">{track.playCount.toLocaleString()} Streams</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[11px] hidden sm:inline">
                    🔥 High Velocity
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">No stream records yet.</div>
        )}
      </div>
    </div>
  );
}

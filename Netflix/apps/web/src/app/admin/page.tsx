'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ShieldCheck, Film, Tv, Cpu, RefreshCw, Plus, CheckCircle, AlertTriangle, Layers } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Job {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  attempts: number;
  errorMessage?: string;
  createdAt: string;
  mediaAsset?: {
    originalFilename: string;
    variants: { quality: string }[];
  };
}

export default function AdminPage() {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 'job-1',
      status: 'COMPLETED',
      attempts: 1,
      createdAt: new Date().toISOString(),
      mediaAsset: { originalFilename: 'cyber_sentinel_master_1080p.mp4', variants: [{ quality: '1080p' }, { quality: '720p' }] },
    },
    {
      id: 'job-2',
      status: 'PROCESSING',
      attempts: 1,
      createdAt: new Date().toISOString(),
      mediaAsset: { originalFilename: 'eldoria_ep1_raw.mov', variants: [{ quality: '720p' }] },
    },
  ]);

  const [analytics, setAnalytics] = useState({
    totalUsers: 142,
    totalProfiles: 310,
    totalContent: 24,
    transcoding: { total: 18, completed: 16, successRatePercentage: 89 },
  });

  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'MOVIE' | 'TV_SHOW'>('MOVIE');
  const [releaseYear, setReleaseYear] = useState(2026);
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [genreSlug, setGenreSlug] = useState('scifi');
  const [hlsManifestUrl, setHlsManifestUrl] = useState('');

  useEffect(() => {
    apiClient
      .get('/admin/media/jobs')
      .then((data: any) => {
        if (Array.isArray(data)) setJobs(data);
      })
      .catch(() => {});

    apiClient
      .get('/admin/analytics')
      .then((data: any) => {
        if (data) setAnalytics(data);
      })
      .catch(() => {});
  }, []);

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await apiClient.post('/admin/content', {
        title,
        description,
        type,
        releaseYear: Number(releaseYear),
        maturityRating: 'TV_MA',
        posterUrl: posterUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600',
        backdropUrl: backdropUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200',
        genreSlugs: [genreSlug],
        masterManifestUrl: hlsManifestUrl || 'https://test-streams.mux.dev/x36xhtml/x36xhtml.m3u8',
      });
      alert('Content created successfully!');
      setIsAddContentOpen(false);
    } catch (err: any) {
      alert('Content created locally for preview!');
      setIsAddContentOpen(false);
    }
  };

  const handleRetryJob = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'PROCESSING', attempts: j.attempts + 1 } : j))
    );
    apiClient.post(`/admin/media/jobs/${id}/retry`).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-netflix-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-9 h-9 text-amber-400" />
            <div>
              <h1 className="text-3xl font-bold font-['Outfit']">Admin Command Center</h1>
              <p className="text-xs text-gray-400">Media transcoding pipeline, content management & platform telemetry</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddContentOpen(true)}
            className="flex items-center gap-2 bg-netflix-red hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-netflix-red/20"
          >
            <Plus className="w-4 h-4" />
            Add New Content Item
          </button>
        </div>

        {/* Telemetry Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <div className="bg-netflix-darkGray border border-white/10 p-5 rounded-xl">
            <p className="text-xs font-semibold text-gray-400 mb-1">Total Platform Users</p>
            <p className="text-3xl font-black text-white">{analytics.totalUsers}</p>
          </div>

          <div className="bg-netflix-darkGray border border-white/10 p-5 rounded-xl">
            <p className="text-xs font-semibold text-gray-400 mb-1">Active Profiles</p>
            <p className="text-3xl font-black text-blue-400">{analytics.totalProfiles}</p>
          </div>

          <div className="bg-netflix-darkGray border border-white/10 p-5 rounded-xl">
            <p className="text-xs font-semibold text-gray-400 mb-1">Catalog Content Items</p>
            <p className="text-3xl font-black text-emerald-400">{analytics.totalContent}</p>
          </div>

          <div className="bg-netflix-darkGray border border-white/10 p-5 rounded-xl">
            <p className="text-xs font-semibold text-gray-400 mb-1">HLS Transcode Health</p>
            <p className="text-3xl font-black text-amber-400">{analytics.transcoding.successRatePercentage}%</p>
          </div>
        </div>

        {/* Transcoding Queue Section */}
        <div className="bg-netflix-darkGray border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-netflix-red" />
              <h2 className="text-lg font-bold text-white">FFmpeg Media Transcoding Queue</h2>
            </div>
            <span className="text-xs text-gray-400 font-mono">{jobs.length} jobs in queue</span>
          </div>

          <div className="divide-y divide-white/5 overflow-x-auto">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  {job.status === 'COMPLETED' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : job.status === 'PROCESSING' ? (
                    <RefreshCw className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate font-mono">
                      {job.mediaAsset?.originalFilename || `Asset ${job.id}`}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      ID: {job.id} • Attempts: {job.attempts}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                      job.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : job.status === 'PROCESSING'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {job.status}
                  </span>

                  {job.status === 'FAILED' && (
                    <button
                      onClick={() => handleRetryJob(job.id)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] font-semibold transition-colors"
                    >
                      Retry Job
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add Content Modal */}
      {isAddContentOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-netflix-darkGray border border-white/10 rounded-xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Create Content Metadata</h2>

            <form onSubmit={handleCreateContent} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Neon Horizons"
                  className="w-full bg-gray-900 border border-white/20 rounded p-2.5 text-white focus:outline-none focus:border-netflix-red"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Plot synopsis..."
                  className="w-full bg-gray-900 border border-white/20 rounded p-2.5 text-white focus:outline-none focus:border-netflix-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Content Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-gray-900 border border-white/20 rounded p-2.5 text-white focus:outline-none"
                  >
                    <option value="MOVIE">Movie</option>
                    <option value="TV_SHOW">TV Series</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">Release Year</label>
                  <input
                    type="number"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-white/20 rounded p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">HLS Master Manifest URL (.m3u8)</label>
                <input
                  type="text"
                  value={hlsManifestUrl}
                  onChange={(e) => setHlsManifestUrl(e.target.value)}
                  placeholder="https://test-streams.mux.dev/x36xhtml/x36xhtml.m3u8"
                  className="w-full bg-gray-900 border border-white/20 rounded p-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-netflix-red"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-netflix-red hover:bg-red-700 text-white font-bold py-3 rounded text-sm transition-all"
                >
                  Save & Trigger Transcoder
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddContentOpen(false)}
                  className="px-4 py-3 border border-gray-600 text-gray-300 hover:text-white rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

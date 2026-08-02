'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Music, Sparkles, RefreshCw, Upload, Radio, ArrowRight, ShieldCheck, Headphones, Layers, Lock, Cpu, Globe } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function StandaloneLandingPage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Landing Navigation Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/60 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
            <Music className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
            MusicPlatform
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
          <Link href="/app" className="hover:text-primary transition-colors">Streaming App</Link>
          <Link href="/converter" className="hover:text-primary transition-colors">Media Converter</Link>
          <Link href="/admin" className="hover:text-primary transition-colors">Creator Studio</Link>
          <a href="http://localhost:4000/api/docs" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Swagger API</a>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/app"
              className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-sm hover:opacity-90 transition shadow-md flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> Open Web Player
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition hidden sm:block"
              >
                Sign In
              </Link>
              <Link
                href="/app"
                className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-sm hover:opacity-90 transition shadow-md flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Launch Platform
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Landing Hero */}
      <main className="flex-1 space-y-24 py-12 lg:py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <section className="text-center space-y-8 relative">
          {/* Subtle Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold tracking-wider uppercase">
            <Sparkles className="w-4 h-4" /> Next-Generation Music & Media Creation Platform
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-[1.08]">
            Stream, Convert & Create <span className="bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent">Without Limits.</span>
          </h1>

          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            The full-stack platform combining high-fidelity audio streaming, instant FFmpeg video-to-audio conversion, Supabase cloud storage, and artist creator tools.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/app"
              className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-black rounded-2xl text-base shadow-xl shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-3 group"
            >
              <Play className="w-5 h-5 fill-current" /> Launch Web Player <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/converter"
              className="px-7 py-4 bg-card text-foreground border border-border/80 font-extrabold rounded-2xl text-base hover:bg-muted/40 transition shadow-md flex items-center gap-2.5"
            >
              <RefreshCw className="w-5 h-5 text-primary" /> Universal Media Converter
            </Link>

            <Link
              href="/admin"
              className="px-7 py-4 bg-accent/15 text-accent border border-accent/30 font-extrabold rounded-2xl text-base hover:bg-accent/25 transition flex items-center gap-2.5"
            >
              <Upload className="w-5 h-5" /> Admin Studio
            </Link>
          </div>
        </section>

        {/* Feature Highlights Showcase Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-card border border-border/80 rounded-3xl space-y-4 shadow-lg hover:border-primary/50 transition group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-foreground">High-Fidelity Audio Player</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Global persistent audio player bar supporting continuous background playback, playlists, liked song libraries, and recently played streaming history.
            </p>
            <Link href="/app" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-2">
              Explore Streaming Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-8 bg-card border border-border/80 rounded-3xl space-y-4 shadow-lg hover:border-primary/50 transition group">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-foreground">Universal FFmpeg Converter</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              On-the-fly media conversion engine for turning MP4, MKV, MOV, and WEBM video files into studio-quality 320kbps MP3s, WAV, and AAC streams.
            </p>
            <Link href="/converter" className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline pt-2">
              Try Media Converter <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-8 bg-card border border-border/80 rounded-3xl space-y-4 shadow-lg hover:border-primary/50 transition group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-foreground">Cloud Storage & Admin Studio</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload tracks and album covers directly to Supabase Storage buckets with real-time metadata extraction, artist biography editing, and RBAC control.
            </p>
            <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:underline pt-2">
              Access Creator Studio <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Technical Architecture Strip */}
        <section className="bg-card border border-border rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-black text-foreground">Built on Tier-1 Engineering Architecture</h2>
            <p className="text-xs text-muted-foreground">Modular Monorepo architecture designed for high scalability and security.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-background/50 rounded-2xl border border-border/50 space-y-1">
              <p className="text-lg font-extrabold text-primary">Next.js 14</p>
              <p className="text-[11px] text-muted-foreground">App Router & React 18</p>
            </div>

            <div className="p-4 bg-background/50 rounded-2xl border border-border/50 space-y-1">
              <p className="text-lg font-extrabold text-accent">NestJS API</p>
              <p className="text-[11px] text-muted-foreground">Passport JWT & Swagger</p>
            </div>

            <div className="p-4 bg-background/50 rounded-2xl border border-border/50 space-y-1">
              <p className="text-lg font-extrabold text-purple-400">Prisma ORM</p>
              <p className="text-[11px] text-muted-foreground">PostgreSQL & Supabase SSL</p>
            </div>

            <div className="p-4 bg-background/50 rounded-2xl border border-border/50 space-y-1">
              <p className="text-lg font-extrabold text-emerald-400">FFmpeg Engine</p>
              <p className="text-[11px] text-muted-foreground">320kbps Audio Encoder</p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="rounded-3xl bg-gradient-to-r from-primary to-accent p-8 sm:p-12 text-primary-foreground text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Ready to Start Listening and Creating?</h2>
          <p className="text-sm sm:text-base opacity-90 max-w-lg mx-auto">
            Launch the web player to explore the music catalog, or convert video files into audio streams instantly.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              href="/app"
              className="px-8 py-3.5 bg-background text-foreground font-extrabold rounded-2xl text-sm hover:opacity-95 transition shadow-lg"
            >
              Launch Web Player
            </Link>
          </div>
        </section>
      </main>

      {/* Landing Footer */}
      <footer className="border-t border-border/60 py-8 px-6 text-center text-xs text-muted-foreground space-y-2">
        <p>© 2026 MusicPlatform. Built with Next.js 14, NestJS, Prisma, and Supabase Cloud Storage.</p>
        <div className="flex justify-center gap-6 text-xs font-semibold pt-1">
          <Link href="/app" className="hover:text-foreground">App Catalog</Link>
          <Link href="/converter" className="hover:text-foreground">Media Converter</Link>
          <Link href="/admin" className="hover:text-foreground">Admin Studio</Link>
          <a href="http://localhost:4000/api/docs" target="_blank" rel="noreferrer" className="hover:text-foreground">Swagger API</a>
        </div>
      </footer>
    </div>
  );
}

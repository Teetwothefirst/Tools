'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, Code, Globe, Twitter, Send } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  shareUrl: string;
  type: 'playlist' | 'track' | 'album' | 'artist';
}

export function ShareModal({ isOpen, onClose, title, shareUrl, type }: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!isOpen) return null;

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${shareUrl}` : shareUrl;
  const embedSnippet = `<iframe src="${fullUrl}" width="100%" height="152" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Share {type.toUpperCase()}</h3>
              <p className="text-xs text-muted-foreground truncate max-w-xs">{title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Link Copy */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-primary" /> Direct Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={fullUrl}
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs flex items-center gap-1.5 hover:opacity-90 transition flex-shrink-0"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* HTML Embed Snippet */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
            <Code className="w-3.5 h-3.5 text-accent" /> HTML Embed Code
          </label>
          <div className="space-y-2">
            <textarea
              readOnly
              rows={2}
              value={embedSnippet}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-[11px] font-mono text-muted-foreground focus:outline-none"
            />
            <button
              onClick={handleCopyEmbed}
              className="w-full py-2 bg-card border border-border text-foreground font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-muted/50 transition"
            >
              {copiedEmbed ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedEmbed ? 'Embed Snippet Copied!' : 'Copy Embed Code'}
            </button>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${title} on MusicPlatform!`)}&url=${encodeURIComponent(fullUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-[#1DA1F2]/10 text-[#1DA1F2] border border-[#1DA1F2]/30 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#1DA1F2]/20 transition"
          >
            <Twitter className="w-4 h-4" /> Post on X
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${title}: ${fullUrl}`)}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/20 transition"
          >
            <Send className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

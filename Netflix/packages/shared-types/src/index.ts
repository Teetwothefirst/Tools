// Global User Roles
export enum UserRole {
  USER = 'USER',
  CONTENT_MANAGER = 'CONTENT_MANAGER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

// Profile Maturity Content Restrictions
export enum MaturityRating {
  G = 'G',
  PG = 'PG',
  PG13 = 'PG13',
  R = 'R',
  NC17 = 'NC17',
  TV_Y = 'TV_Y',
  TV_Y7 = 'TV_Y7',
  TV_G = 'TV_G',
  TV_PG = 'TV_PG',
  TV_14 = 'TV_14',
  TV_MA = 'TV_MA',
}

// Media Transcoding Status
export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// HLS Stream Video Quality Levels
export enum VideoQuality {
  Q_360P = '360p',
  Q_480P = '480p',
  Q_720P = '720p',
  Q_1080P = '1080p',
}

// Subscription Status Tiers
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  PAST_DUE = 'PAST_DUE',
  EXPIRED = 'EXPIRED',
}

// API Response Standard Envelope
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    details?: any;
  };
  timestamp: string;
}

// User & Profile Types
export interface UserDto {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

export interface ProfileDto {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  isKids: boolean;
  maturityRating: MaturityRating;
  language: string;
  autoplayNext: boolean;
  subtitleLanguage: string;
  audioLanguage: string;
}

// Media & Catalog Types
export interface GenreDto {
  id: string;
  name: string;
  slug: string;
}

export interface VideoVariantDto {
  id: string;
  quality: VideoQuality;
  playlistUrl: string;
  bitrate: number;
}

export interface SubtitleTrackDto {
  id: string;
  language: string;
  label: string;
  vttUrl: string;
  isDefault: boolean;
}

export interface AudioTrackDto {
  id: string;
  language: string;
  label: string;
  audioUrl: string;
  isDefault: boolean;
}

export interface MediaAssetDto {
  id: string;
  originalFilename: string;
  status: ProcessingStatus;
  masterManifestUrl?: string;
  durationSeconds?: number;
  variants: VideoVariantDto[];
  subtitles: SubtitleTrackDto[];
  audioTracks: AudioTrackDto[];
}

export interface ContentItemDto {
  id: string;
  title: string;
  description: string;
  type: 'MOVIE' | 'TV_SHOW';
  releaseYear: number;
  maturityRating: MaturityRating;
  posterUrl: string;
  backdropUrl: string;
  logoUrl?: string;
  trailerUrl?: string;
  featured: boolean;
  genres: GenreDto[];
  cast: { id: string; name: string; characterName?: string; photoUrl?: string }[];
  director?: string;
  runtimeMinutes?: number;
  mediaAsset?: MediaAssetDto;
  seasons?: SeasonDto[];
}

export interface SeasonDto {
  id: string;
  showId: string;
  seasonNumber: number;
  title: string;
  overview?: string;
  posterUrl?: string;
  episodes: EpisodeDto[];
}

export interface EpisodeDto {
  id: string;
  seasonId: string;
  episodeNumber: number;
  title: string;
  overview: string;
  runtimeMinutes: number;
  thumbnailUrl: string;
  introStartSec?: number;
  introEndSec?: number;
  outroStartSec?: number;
  mediaAssetId: string;
  mediaAsset?: MediaAssetDto;
}

// Playback Tracking Types
export interface PlaybackProgressDto {
  id: string;
  profileId: string;
  contentId: string;
  episodeId?: string;
  progressSeconds: number;
  durationSeconds: number;
  completionPercentage: number;
  lastWatchedAt: string;
}

export interface ContinueWatchingItemDto {
  content: ContentItemDto;
  episode?: EpisodeDto;
  progress: PlaybackProgressDto;
}

// Subscription Plan
export interface SubscriptionPlanDto {
  id: string;
  name: string;
  priceMonthly: number;
  videoQuality: string;
  maxScreens: number;
  has4K: boolean;
}

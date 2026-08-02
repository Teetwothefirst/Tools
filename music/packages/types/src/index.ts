export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: Omit<User, 'createdAt' | 'updatedAt'>;
  tokens: AuthTokens;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface Artist {
  id: string;
  name: string;
  bio?: string | null;
  imageUrl?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Album {
  id: string;
  title: string;
  coverUrl?: string | null;
  releaseDate?: string | Date | null;
  artistId: string;
  artist?: Artist;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Track {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  playCount?: number;
  lyrics?: string | null;
  artistId?: string;
  artist?: Artist;
  albumId?: string | null;
  album?: Album | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  userId: string;
  user?: User;
  tracks?: Track[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

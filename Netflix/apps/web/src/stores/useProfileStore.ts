import { create } from 'zustand';
import { ProfileDto } from '@netflix/shared-types';

interface ProfileState {
  activeProfile: ProfileDto | null;
  setActiveProfile: (profile: ProfileDto | null) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  activeProfile: {
    id: 'demo-profile-1',
    userId: 'demo-user-1',
    name: 'Alex',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    isKids: false,
    maturityRating: 'TV_MA' as any,
    language: 'en',
    autoplayNext: true,
    subtitleLanguage: 'en',
    audioLanguage: 'en',
  },
  setActiveProfile: (profile) => set({ activeProfile: profile }),
}));

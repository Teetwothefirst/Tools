'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Lock } from 'lucide-react';
import { useProfileStore } from '@/stores/useProfileStore';
import { ProfileDto } from '@netflix/shared-types';

const demoProfiles: ProfileDto[] = [
  {
    id: 'p1',
    userId: 'u1',
    name: 'Alex',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    isKids: false,
    maturityRating: 'TV_MA' as any,
    language: 'en',
    autoplayNext: true,
    subtitleLanguage: 'en',
    audioLanguage: 'en',
  },
  {
    id: 'p2',
    userId: 'u1',
    name: 'Sam',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    isKids: false,
    maturityRating: 'TV_14' as any,
    language: 'en',
    autoplayNext: true,
    subtitleLanguage: 'en',
    audioLanguage: 'en',
  },
  {
    id: 'p3',
    userId: 'u1',
    name: 'Kids Room',
    avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
    isKids: true,
    maturityRating: 'TV_G' as any,
    language: 'en',
    autoplayNext: true,
    subtitleLanguage: 'en',
    audioLanguage: 'en',
  },
];

export default function ProfilesPage() {
  const router = useRouter();
  const { setActiveProfile } = useProfileStore();

  const handleSelectProfile = (profile: ProfileDto) => {
    setActiveProfile(profile);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-netflix-black text-white flex flex-col items-center justify-center p-6 select-none">
      <div className="text-center max-w-4xl w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <h1 className="text-4xl sm:text-6xl font-black font-['Outfit'] tracking-tight">Who's watching?</h1>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-4">
          {demoProfiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => handleSelectProfile(profile)}
              className="group flex flex-col items-center gap-3 cursor-pointer"
            >
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-md overflow-hidden border-2 border-transparent group-hover:border-white transition-all group-hover:scale-105 shadow-2xl">
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                {profile.isKids && (
                  <span className="absolute bottom-2 right-2 bg-netflix-red text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                    KIDS
                  </span>
                )}
              </div>
              <span className="text-gray-400 group-hover:text-white font-medium text-sm sm:text-base transition-colors">
                {profile.name}
              </span>
            </div>
          ))}

          {/* Add Profile Card */}
          <div className="group flex flex-col items-center gap-3 cursor-pointer">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-md bg-white/5 group-hover:bg-white/15 border-2 border-dashed border-white/20 group-hover:border-white flex items-center justify-center transition-all group-hover:scale-105">
              <Plus className="w-12 h-12 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <span className="text-gray-400 group-hover:text-white font-medium text-sm sm:text-base transition-colors">
              Add Profile
            </span>
          </div>
        </div>

        <div className="pt-8">
          <button className="border border-gray-500 text-gray-400 hover:border-white hover:text-white px-8 py-2.5 rounded font-semibold text-sm uppercase tracking-widest transition-all">
            Manage Profiles
          </button>
        </div>
      </div>
    </div>
  );
}

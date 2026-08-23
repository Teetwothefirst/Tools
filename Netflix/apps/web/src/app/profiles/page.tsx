'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Check, Shield, Trash2 } from 'lucide-react';
import { useProfileStore } from '@/stores/useProfileStore';
import { ProfileDto } from '@netflix/shared-types';
import { apiClient } from '@/lib/api';

const avatarOptions = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
];

const initialProfiles: ProfileDto[] = [
  {
    id: 'p1',
    userId: 'demo-user-1',
    name: 'Alex',
    avatarUrl: avatarOptions[0],
    isKids: false,
    maturityRating: 'TV_MA' as any,
    language: 'en',
    autoplayNext: true,
    subtitleLanguage: 'en',
    audioLanguage: 'en',
  },
  {
    id: 'p2',
    userId: 'demo-user-1',
    name: 'Sam',
    avatarUrl: avatarOptions[1],
    isKids: false,
    maturityRating: 'TV_14' as any,
    language: 'en',
    autoplayNext: true,
    subtitleLanguage: 'en',
    audioLanguage: 'en',
  },
  {
    id: 'p3',
    userId: 'demo-user-1',
    name: 'Kids Room',
    avatarUrl: avatarOptions[4],
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
  const [profiles, setProfiles] = useState<ProfileDto[]>(initialProfiles);
  const [isManaging, setIsManaging] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Profile Form State
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileIsKids, setNewProfileIsKids] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);

  useEffect(() => {
    apiClient
      .get('/profiles')
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          setProfiles(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectProfile = (profile: ProfileDto) => {
    if (isManaging) return;
    setActiveProfile(profile);
    router.push('/');
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    const newProfile: ProfileDto = {
      id: `p-${Date.now()}`,
      userId: 'demo-user-1',
      name: newProfileName.trim(),
      avatarUrl: selectedAvatar,
      isKids: newProfileIsKids,
      maturityRating: newProfileIsKids ? ('TV_Y7' as any) : ('TV_MA' as any),
      language: 'en',
      autoplayNext: true,
      subtitleLanguage: 'en',
      audioLanguage: 'en',
    };

    setProfiles((prev) => [...prev, newProfile]);
    apiClient.post('/profiles', newProfile).catch(() => {});
    setIsAddModalOpen(false);
    setNewProfileName('');
    setNewProfileIsKids(false);
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    apiClient.delete(`/profiles/${id}`).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-netflix-black text-white flex flex-col items-center justify-center p-6 select-none relative">
      <div className="text-center max-w-4xl w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <h1 className="text-4xl sm:text-6xl font-black font-['Outfit'] tracking-tight">
          {isManaging ? 'Manage Profiles:' : "Who's watching?"}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => handleSelectProfile(profile)}
              className="group flex flex-col items-center gap-3 cursor-pointer relative"
            >
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-md overflow-hidden border-2 border-transparent group-hover:border-white transition-all group-hover:scale-105 shadow-2xl">
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                {profile.isKids && (
                  <span className="absolute bottom-2 right-2 bg-netflix-red text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                    KIDS
                  </span>
                )}
                {isManaging && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <button
                      onClick={(e) => handleDeleteProfile(profile.id, e)}
                      className="p-2 bg-red-600/80 hover:bg-red-600 rounded-full text-white transition-colors"
                      title="Delete profile"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
              <span className="text-gray-400 group-hover:text-white font-medium text-sm sm:text-base transition-colors">
                {profile.name}
              </span>
            </div>
          ))}

          {/* Add Profile Card */}
          {!isManaging && profiles.length < 5 && (
            <div
              onClick={() => setIsAddModalOpen(true)}
              className="group flex flex-col items-center gap-3 cursor-pointer"
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-md bg-white/5 group-hover:bg-white/15 border-2 border-dashed border-white/20 group-hover:border-white flex items-center justify-center transition-all group-hover:scale-105">
                <Plus className="w-12 h-12 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <span className="text-gray-400 group-hover:text-white font-medium text-sm sm:text-base transition-colors">
                Add Profile
              </span>
            </div>
          )}
        </div>

        <div className="pt-8">
          <button
            onClick={() => setIsManaging(!isManaging)}
            className={`border px-8 py-2.5 rounded font-semibold text-sm uppercase tracking-widest transition-all ${
              isManaging
                ? 'border-white bg-white text-black font-bold'
                : 'border-gray-500 text-gray-400 hover:border-white hover:text-white'
            }`}
          >
            {isManaging ? 'Done' : 'Manage Profiles'}
          </button>
        </div>
      </div>

      {/* Add Profile Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-netflix-darkGray border border-white/10 rounded-xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Add Profile</h2>

            <form onSubmit={handleCreateProfile} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">Choose Avatar</label>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {avatarOptions.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Avatar option"
                      onClick={() => setSelectedAvatar(url)}
                      className={`w-12 h-12 rounded-md cursor-pointer object-cover border-2 transition-all ${
                        selectedAvatar === url ? 'border-netflix-red scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Profile Name</label>
                <input
                  type="text"
                  required
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="e.g. Jordan"
                  className="w-full bg-gray-900 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-netflix-red"
                />
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="text-sm font-semibold text-white">Kids Experience?</p>
                  <p className="text-xs text-gray-400">Only TV-Y7 and lower content maturity rating</p>
                </div>
                <input
                  type="checkbox"
                  checked={newProfileIsKids}
                  onChange={(e) => setNewProfileIsKids(e.target.checked)}
                  className="w-5 h-5 accent-netflix-red rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-netflix-red hover:bg-red-700 text-white font-bold py-3 rounded-lg text-sm transition-all"
                >
                  Save Profile
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 border border-gray-600 text-gray-300 hover:text-white rounded-lg text-sm"
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

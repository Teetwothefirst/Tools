import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '@netflix/database';
import { CreateProfileDto, UpdateProfileDto } from '@netflix/shared-types';

@Injectable()
export class ProfilesService {
  async getProfilesForUser(userId: string) {
    return db.profile.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getProfileById(id: string) {
    const profile = await db.profile.findUnique({
      where: { id },
    });
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    return profile;
  }

  async createProfile(dto: CreateProfileDto) {
    const defaultAvatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    ];
    const avatarUrl = dto.avatarUrl || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    return db.profile.create({
      data: {
        userId: dto.userId,
        name: dto.name,
        avatarUrl,
        isKids: dto.isKids ?? false,
        maturityRating: dto.maturityRating ?? (dto.isKids ? ('TV_Y7' as any) : ('TV_MA' as any)),
        language: dto.language || 'en',
      },
    });
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    await this.getProfileById(id);
    return db.profile.update({
      where: { id },
      data: dto as any,
    });
  }

  async deleteProfile(id: string) {
    await this.getProfileById(id);
    return db.profile.delete({
      where: { id },
    });
  }
}

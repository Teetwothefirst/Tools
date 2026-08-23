import { Injectable } from '@nestjs/common';
import { db } from '@netflix/database';

@Injectable()
export class PlaybackService {
  async updateProgress(profileId: string, contentId: string, episodeId: string | undefined, progressSeconds: number, durationSeconds: number) {
    const completionPercentage = durationSeconds > 0 ? (progressSeconds / durationSeconds) * 100 : 0;

    const progress = await db.playbackProgress.upsert({
      where: {
        profileId_contentId_episodeId: {
          profileId,
          contentId,
          episodeId: episodeId || '',
        },
      },
      update: {
        progressSeconds,
        durationSeconds,
        completionPercentage,
        lastWatchedAt: new Date(),
      },
      create: {
        profileId,
        contentId,
        episodeId: episodeId || null,
        progressSeconds,
        durationSeconds,
        completionPercentage,
      },
    });

    // Also record watch history
    await db.watchHistory.create({
      data: {
        profileId,
        contentId,
      },
    }).catch(() => {});

    return progress;
  }

  async getContinueWatching(profileId: string) {
    const items = await db.playbackProgress.findMany({
      where: {
        profileId,
        completionPercentage: { lt: 90 },
      },
      orderBy: { lastWatchedAt: 'desc' },
      take: 10,
      include: {
        contentItem: { include: { genres: { include: { genre: true } }, movie: true, tvShow: true } },
        episode: true,
      },
    });
    return items;
  }

  async getWatchlist(profileId: string) {
    const list = await db.watchlist.findMany({
      where: { profileId },
      orderBy: { addedAt: 'desc' },
      include: {
        contentItem: { include: { genres: { include: { genre: true } }, movie: true, tvShow: true } },
      },
    });
    return list.map((w) => w.contentItem);
  }

  async toggleWatchlist(profileId: string, contentId: string) {
    const existing = await db.watchlist.findUnique({
      where: {
        profileId_contentId: { profileId, contentId },
      },
    });

    if (existing) {
      await db.watchlist.delete({
        where: { id: existing.id },
      });
      return { inWatchlist: false };
    } else {
      await db.watchlist.create({
        data: { profileId, contentId },
      });
      return { inWatchlist: true };
    }
  }

  async rateContent(profileId: string, contentId: string, isLike: boolean) {
    return db.contentRating.upsert({
      where: {
        profileId_contentId: { profileId, contentId },
      },
      update: { isLike },
      create: { profileId, contentId, isLike },
    });
  }

  async getRating(profileId: string, contentId: string) {
    return db.contentRating.findUnique({
      where: {
        profileId_contentId: { profileId, contentId },
      },
    });
  }
}

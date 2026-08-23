import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '@netflix/database';
import { CreateContentItemDto } from '@netflix/shared-types';

@Injectable()
export class AdminService {
  async getTranscodingJobs() {
    return db.processingJob.findMany({
      include: {
        mediaAsset: {
          include: {
            variants: true,
            movie: { include: { contentItem: true } },
            episode: { include: { season: { include: { tvShow: { include: { contentItem: true } } } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async retryTranscodingJob(jobId: string) {
    const job = await db.processingJob.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException(`Transcode job ${jobId} not found`);

    return db.processingJob.update({
      where: { id: jobId },
      data: {
        status: 'PROCESSING',
        attempts: job.attempts + 1,
        errorMessage: null,
      },
    });
  }

  async createContentItem(dto: CreateContentItemDto) {
    // Connect or create genres
    const genreConnect: any[] = [];
    for (const slug of dto.genreSlugs || []) {
      let genre = await db.genre.findUnique({ where: { slug } });
      if (!genre) {
        const name = slug.charAt(0).toUpperCase() + slug.slice(1);
        genre = await db.genre.create({ data: { name, slug } });
      }
      genreConnect.push({ genre: { connect: { id: genre.id } } });
    }

    const item = await db.contentItem.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        releaseYear: dto.releaseYear,
        maturityRating: dto.maturityRating as any,
        posterUrl: dto.posterUrl,
        backdropUrl: dto.backdropUrl,
        featured: dto.featured ?? false,
        genres: { create: genreConnect },
      },
    });

    if (dto.type === 'MOVIE') {
      let mediaAssetId: string | undefined;
      if (dto.masterManifestUrl) {
        const mediaAsset = await db.mediaAsset.create({
          data: {
            originalFilename: `${dto.title.toLowerCase().replace(/\s+/g, '-')}.mp4`,
            storagePath: `/media/uploads/${dto.title}`,
            status: 'COMPLETED',
            masterManifestUrl: dto.masterManifestUrl,
            variants: {
              create: [
                { quality: '1080p', playlistUrl: dto.masterManifestUrl, bitrate: 5000000 },
                { quality: '720p', playlistUrl: dto.masterManifestUrl, bitrate: 2800000 },
                { quality: '480p', playlistUrl: dto.masterManifestUrl, bitrate: 1400000 },
              ],
            },
          },
        });
        mediaAssetId = mediaAsset.id;
      }

      await db.movie.create({
        data: {
          contentId: item.id,
          runtimeMinutes: dto.runtimeMinutes || 110,
          director: dto.director || 'StreamFlix Original',
          mediaAssetId,
        },
      });
    } else {
      await db.tVShow.create({
        data: {
          contentId: item.id,
          totalSeasons: 1,
          totalEpisodes: 1,
        },
      });
    }

    return item;
  }

  async getPlatformAnalytics() {
    const totalUsers = await db.user.count();
    const totalProfiles = await db.profile.count();
    const totalContent = await db.contentItem.count();
    const totalTranscodeJobs = await db.processingJob.count();
    const completedJobs = await db.processingJob.count({ where: { status: 'COMPLETED' } });

    return {
      totalUsers,
      totalProfiles,
      totalContent,
      transcoding: {
        total: totalTranscodeJobs,
        completed: completedJobs,
        successRatePercentage: totalTranscodeJobs ? Math.round((completedJobs / totalTranscodeJobs) * 100) : 100,
      },
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '@netflix/database';

@Injectable()
export class CatalogService {
  async getHeroItem() {
    const hero = await db.contentItem.findFirst({
      where: { featured: true },
      include: {
        genres: { include: { genre: true } },
        movie: { include: { mediaAsset: true } },
        tvShow: true,
      },
    });
    return hero;
  }

  async getRows() {
    const featured = await db.contentItem.findMany({
      take: 10,
      include: { genres: { include: { genre: true } }, movie: true, tvShow: true },
    });

    const trending = await db.contentItem.findMany({
      orderBy: { trendingScore: 'desc' },
      take: 10,
      include: { genres: { include: { genre: true } }, movie: true, tvShow: true },
    });

    const scifi = await db.contentItem.findMany({
      where: { genres: { some: { genre: { slug: 'scifi' } } } },
      take: 10,
      include: { genres: { include: { genre: true } }, movie: true, tvShow: true },
    });

    const action = await db.contentItem.findMany({
      where: { genres: { some: { genre: { slug: 'action' } } } },
      take: 10,
      include: { genres: { include: { genre: true } }, movie: true, tvShow: true },
    });

    return [
      { id: 'trending', title: 'Trending Now', items: trending },
      { id: 'featured', title: 'Popular on StreamFlix', items: featured },
      { id: 'scifi', title: 'Sci-Fi & Fantasy Blockbusters', items: scifi },
      { id: 'action', title: 'High-Octane Action', items: action },
    ];
  }

  async getItemById(id: string) {
    const item = await db.contentItem.findUnique({
      where: { id },
      include: {
        genres: { include: { genre: true } },
        credits: { include: { person: true } },
        movie: { include: { mediaAsset: { include: { variants: true, subtitles: true, audioTracks: true } } } },
        tvShow: {
          include: {
            seasons: {
              include: {
                episodes: {
                  include: {
                    mediaAsset: { include: { variants: true, subtitles: true, audioTracks: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Content item with ID ${id} not found`);
    }

    return item;
  }

  async searchCatalog(query?: string, genreSlug?: string) {
    const whereClause: any = {};

    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (genreSlug) {
      whereClause.genres = {
        some: { genre: { slug: genreSlug } },
      };
    }

    return db.contentItem.findMany({
      where: whereClause,
      include: { genres: { include: { genre: true } }, movie: true, tvShow: true },
      take: 30,
    });
  }
}

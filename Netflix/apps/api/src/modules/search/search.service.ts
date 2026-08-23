import { Injectable } from '@nestjs/common';
import { db } from '@netflix/database';

@Injectable()
export class SearchService {
  async search(query?: string, genre?: string, type?: 'MOVIE' | 'TV_SHOW') {
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (query && query.trim() !== '') {
      const q = query.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { credits: { some: { person: { name: { contains: q, mode: 'insensitive' } } } } },
      ];
    }

    if (genre && genre !== 'all') {
      where.genres = {
        some: { genre: { slug: genre } },
      };
    }

    return db.contentItem.findMany({
      where,
      take: 40,
      include: {
        genres: { include: { genre: true } },
        credits: { include: { person: true } },
        movie: true,
        tvShow: true,
      },
      orderBy: { trendingScore: 'desc' },
    });
  }
}

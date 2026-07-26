import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search tracks, albums, and artists' })
  async search(@Query('q') query: string) {
    if (!query) {
      return { tracks: [], albums: [], artists: [] };
    }

    const [tracks, albums, artists] = await Promise.all([
      this.prisma.track.findMany({
        where: { title: { contains: query, mode: 'insensitive' } },
        include: { artist: true, album: true },
        take: 10,
      }),
      this.prisma.album.findMany({
        where: { title: { contains: query, mode: 'insensitive' } },
        include: { artist: true },
        take: 10,
      }),
      this.prisma.artist.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: 10,
      }),
    ]);

    return { tracks, albums, artists };
  }

  @Get('browse')
  @ApiOperation({ summary: 'Browse featured items and new releases' })
  async browse() {
    const [newReleases, popularTracks, artists] = await Promise.all([
      this.prisma.album.findMany({
        orderBy: { createdAt: 'desc' },
        include: { artist: true },
        take: 8,
      }),
      this.prisma.track.findMany({
        orderBy: { playCount: 'desc' },
        include: { artist: true, album: true },
        take: 10,
      }),
      this.prisma.artist.findMany({
        take: 8,
      }),
    ]);

    return { newReleases, popularTracks, artists };
  }

  @Get('track/:id')
  @ApiOperation({ summary: 'Get single track details' })
  async getTrack(@Param('id') id: string) {
    return this.prisma.track.findUnique({
      where: { id },
      include: { artist: true, album: true },
    });
  }

  // Admin upload features (Step 8 support)
  @Post('artist')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create artist metadata (Admin)' })
  async createArtist(@Body() body: { name: string; bio?: string; imageUrl?: string }) {
    return this.prisma.artist.create({ data: body });
  }

  @Post('album')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create album metadata (Admin)' })
  async createAlbum(@Body() body: { title: string; coverUrl?: string; artistId: string }) {
    return this.prisma.album.create({ data: body });
  }

  @Post('track')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create track metadata and link audio (Admin)' })
  async createTrack(@Body() body: { title: string; audioUrl: string; duration: number; artistId: string; albumId?: string }) {
    return this.prisma.track.create({ data: body });
  }
}

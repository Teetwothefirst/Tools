import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Library')
@Controller('library')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LibraryController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user liked/saved tracks' })
  async getLibrary(@CurrentUser('userId') userId: string) {
    const likes = await this.prisma.like.findMany({
      where: { userId },
      include: {
        track: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return likes.map((like) => like.track);
  }

  @Post('like/:trackId')
  @ApiOperation({ summary: 'Save/like a track in user library' })
  async likeTrack(
    @CurrentUser('userId') userId: string,
    @Param('trackId') trackId: string,
  ) {
    return this.prisma.like.upsert({
      where: { userId_trackId: { userId, trackId } },
      create: { userId, trackId },
      update: {},
    });
  }

  @Delete('like/:trackId')
  @ApiOperation({ summary: 'Remove a track from user library' })
  async unlikeTrack(
    @CurrentUser('userId') userId: string,
    @Param('trackId') trackId: string,
  ) {
    return this.prisma.like.delete({
      where: { userId_trackId: { userId, trackId } },
    });
  }

  // --- Favorite Albums ---
  @Get('albums')
  @ApiOperation({ summary: 'Get all user liked/saved albums' })
  async getFavoriteAlbums(@CurrentUser('userId') userId: string) {
    const favorites = await this.prisma.favoriteAlbum.findMany({
      where: { userId },
      include: {
        album: {
          include: { artist: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => f.album);
  }

  @Post('albums/:albumId')
  @ApiOperation({ summary: 'Like/save an album to library' })
  async favoriteAlbum(
    @CurrentUser('userId') userId: string,
    @Param('albumId') albumId: string,
  ) {
    return this.prisma.favoriteAlbum.upsert({
      where: { userId_albumId: { userId, albumId } },
      create: { userId, albumId },
      update: {},
    });
  }

  @Delete('albums/:albumId')
  @ApiOperation({ summary: 'Remove an album from library' })
  async unfavoriteAlbum(
    @CurrentUser('userId') userId: string,
    @Param('albumId') albumId: string,
  ) {
    return this.prisma.favoriteAlbum.delete({
      where: { userId_albumId: { userId, albumId } },
    });
  }

  // --- Favorite Artists ---
  @Get('artists')
  @ApiOperation({ summary: 'Get all user liked/saved artists' })
  async getFavoriteArtists(@CurrentUser('userId') userId: string) {
    const favorites = await this.prisma.favoriteArtist.findMany({
      where: { userId },
      include: { artist: true },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => f.artist);
  }

  @Post('artists/:artistId')
  @ApiOperation({ summary: 'Like/save an artist to library' })
  async favoriteArtist(
    @CurrentUser('userId') userId: string,
    @Param('artistId') artistId: string,
  ) {
    return this.prisma.favoriteArtist.upsert({
      where: { userId_artistId: { userId, artistId } },
      create: { userId, artistId },
      update: {},
    });
  }

  @Delete('artists/:artistId')
  @ApiOperation({ summary: 'Remove an artist from library' })
  async unfavoriteArtist(
    @CurrentUser('userId') userId: string,
    @Param('artistId') artistId: string,
  ) {
    return this.prisma.favoriteArtist.delete({
      where: { userId_artistId: { userId, artistId } },
    });
  }
}

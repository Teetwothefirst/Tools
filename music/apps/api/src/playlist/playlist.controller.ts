import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Playlists')
@Controller('playlists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlaylistController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Create a playlist' })
  async createPlaylist(
    @CurrentUser('userId') userId: string,
    @Body() body: { title: string; description?: string; coverUrl?: string },
  ) {
    return this.prisma.playlist.create({
      data: {
        ...body,
        userId,
      },
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all playlists belonging to current user' })
  async getPlaylists(@CurrentUser('userId') userId: string) {
    return this.prisma.playlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a playlist including ordered track details' })
  async getPlaylist(@Param('id') id: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        tracks: {
          orderBy: { order: 'asc' },
          include: {
            track: {
              include: {
                artist: true,
                album: true,
              },
            },
          },
        },
      },
    });
    return {
      ...playlist,
      tracks: playlist?.tracks.map((pt) => pt.track) || [],
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit playlist details' })
  async updatePlaylist(
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string; coverUrl?: string },
  ) {
    return this.prisma.playlist.update({
      where: { id },
      data: body,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a playlist' })
  async deletePlaylist(@Param('id') id: string) {
    return this.prisma.playlist.delete({
      where: { id },
    });
  }

  @Post(':id/tracks')
  @ApiOperation({ summary: 'Add a track to playlist' })
  async addTrackToPlaylist(
    @Param('id') id: string,
    @Body() body: { trackId: string },
  ) {
    const count = await this.prisma.playlistTrack.count({
      where: { playlistId: id },
    });
    return this.prisma.playlistTrack.create({
      data: {
        playlistId: id,
        trackId: body.trackId,
        order: count,
      },
    });
  }

  @Delete(':id/tracks/:trackId')
  @ApiOperation({ summary: 'Remove a track from playlist' })
  async removeTrackFromPlaylist(
    @Param('id') id: string,
    @Param('trackId') trackId: string,
  ) {
    return this.prisma.playlistTrack.delete({
      where: {
        playlistId_trackId: {
          playlistId: id,
          trackId,
        },
      },
    });
  }

  @Put(':id/tracks/order')
  @ApiOperation({ summary: 'Reorder playlist tracks' })
  async reorderPlaylistTracks(
    @Param('id') id: string,
    @Body() body: { trackIds: string[] },
  ) {
    await this.prisma.$transaction(
      body.trackIds.map((trackId, index) =>
        this.prisma.playlistTrack.update({
          where: { playlistId_trackId: { playlistId: id, trackId } },
          data: { order: index },
        }),
      ),
    );
    return { success: true };
  }
}

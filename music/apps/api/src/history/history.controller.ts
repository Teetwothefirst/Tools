import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Playback History')
@Controller('history')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HistoryController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('activity')
  @ApiOperation({ summary: 'Update user playback activity (Recently Played & Continue Listening)' })
  async updateActivity(
    @CurrentUser('userId') userId: string,
    @Body() body: { trackId: string; progress: number; isCompleted?: boolean },
  ) {
    const { trackId, progress, isCompleted = false } = body;
    return this.prisma.userActivity.upsert({
      where: { id: `${userId}_${trackId}` }, // Keep composite activity context
      create: {
        id: `${userId}_${trackId}`,
        userId,
        trackId,
        progress,
        isCompleted,
      },
      update: {
        progress,
        isCompleted,
        playedAt: new Date(),
      },
    });
  }

  @Get('recently-played')
  @ApiOperation({ summary: 'Get recently played tracks' })
  async getRecentlyPlayed(@CurrentUser('userId') userId: string) {
    const activities = await this.prisma.userActivity.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      include: {
        track: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
      take: 12,
    });
    return activities.map((act) => act.track);
  }

  @Get('continue-listening')
  @ApiOperation({ summary: 'Get incomplete tracks for continue listening' })
  async getContinueListening(@CurrentUser('userId') userId: string) {
    const activities = await this.prisma.userActivity.findMany({
      where: {
        userId,
        isCompleted: false,
        progress: { gt: 5 }, // Listened to at least 5 seconds
      },
      orderBy: { playedAt: 'desc' },
      include: {
        track: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
      take: 5,
    });
    return activities.map((act) => ({
      track: act.track,
      progress: act.progress,
    }));
  }
}

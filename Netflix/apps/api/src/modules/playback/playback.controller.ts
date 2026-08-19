import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { PlaybackService } from './playback.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('api/v1/playback')
export class PlaybackController {
  constructor(private readonly playbackService: PlaybackService) {}

  @Post('progress')
  async saveProgress(@Body() body: any) {
    return this.playbackService.updateProgress(
      body.profileId,
      body.contentId,
      body.episodeId,
      body.progressSeconds,
      body.durationSeconds,
    );
  }

  @Get('continue-watching')
  async continueWatching(@Query('profileId') profileId: string) {
    return this.playbackService.getContinueWatching(profileId);
  }

  @Get('watchlist')
  async getWatchlist(@Query('profileId') profileId: string) {
    return this.playbackService.getWatchlist(profileId);
  }

  @Post('watchlist/toggle')
  async toggleWatchlist(@Body() body: any) {
    return this.playbackService.toggleWatchlist(body.profileId, body.contentId);
  }
}

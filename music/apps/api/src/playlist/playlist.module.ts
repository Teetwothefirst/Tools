import { Module } from '@nestjs/common';
import { PlaylistController } from './playlist.controller';

@Module({
  controllers: [PlaylistController],
})
export class PlaylistModule {}

import { Module } from '@nestjs/common';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { CatalogController } from './modules/catalog/catalog.controller';
import { CatalogService } from './modules/catalog/catalog.service';
import { PlaybackController } from './modules/playback/playback.controller';
import { PlaybackService } from './modules/playback/playback.service';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [],
  controllers: [AuthController, CatalogController, PlaybackController, HealthController],
  providers: [AuthService, CatalogService, PlaybackService],
})
export class AppModule {}

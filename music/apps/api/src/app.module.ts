import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { LibraryModule } from './library/library.module';
import { PlaylistModule } from './playlist/playlist.module';
import { HistoryModule } from './history/history.module';
import { StorageModule } from './storage/storage.module';
import { ConverterModule } from './converter/converter.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    PrismaModule,
    AuthModule,
    CatalogModule,
    LibraryModule,
    PlaylistModule,
    HistoryModule,
    StorageModule,
    ConverterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
// Registered modules including ConverterModule
export class AppModule {}

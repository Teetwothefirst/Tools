import { Module } from '@nestjs/common';
import { ConverterService } from './converter.service';
import { ConverterController } from './converter.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [ConverterController],
  providers: [ConverterService],
  exports: [ConverterService],
})
export class ConverterModule {}

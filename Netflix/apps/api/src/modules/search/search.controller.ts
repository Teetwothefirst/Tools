import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('api/v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') query?: string,
    @Query('genre') genre?: string,
    @Query('type') type?: 'MOVIE' | 'TV_SHOW',
  ) {
    return this.searchService.search(query, genre, type);
  }
}

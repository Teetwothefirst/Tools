import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('api/v1/catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('hero')
  async getHero() {
    return this.catalogService.getHeroItem();
  }

  @Get('rows')
  async getRows() {
    return this.catalogService.getRows();
  }

  @Get('search')
  async search(@Query('q') q?: string, @Query('genre') genre?: string) {
    return this.catalogService.searchCatalog(q, genre);
  }

  @Get('items/:id')
  async getItem(@Param('id') id: string) {
    return this.catalogService.getItemById(id);
  }
}

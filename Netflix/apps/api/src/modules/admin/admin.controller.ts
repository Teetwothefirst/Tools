import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateContentItemDto, UserRole } from '@netflix/shared-types';

@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CONTENT_MANAGER)
@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('media/jobs')
  async getTranscodingJobs() {
    return this.adminService.getTranscodingJobs();
  }

  @Post('media/jobs/:id/retry')
  async retryJob(@Param('id') id: string) {
    return this.adminService.retryTranscodingJob(id);
  }

  @Post('content')
  async createContent(@Body() body: CreateContentItemDto) {
    return this.adminService.createContentItem(body);
  }

  @Get('analytics')
  async getAnalytics() {
    return this.adminService.getPlatformAnalytics();
  }
}

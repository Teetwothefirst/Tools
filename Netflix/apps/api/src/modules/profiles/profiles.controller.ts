import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CreateProfileDto, UpdateProfileDto } from '@netflix/shared-types';

@UseGuards(AuthGuard)
@Controller('api/v1/profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  async getProfiles(@Query('userId') userId: string) {
    return this.profilesService.getProfilesForUser(userId);
  }

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.profilesService.getProfileById(id);
  }

  @Post()
  async createProfile(@Body() body: CreateProfileDto) {
    return this.profilesService.createProfile(body);
  }

  @Patch(':id')
  async updateProfile(@Param('id') id: string, @Body() body: UpdateProfileDto) {
    return this.profilesService.updateProfile(id, body);
  }

  @Delete(':id')
  async deleteProfile(@Param('id') id: string) {
    return this.profilesService.deleteProfile(id);
  }
}

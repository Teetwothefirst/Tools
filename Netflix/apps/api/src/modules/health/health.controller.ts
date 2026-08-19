import { Controller, Get } from '@nestjs/common';
import { db } from '@netflix/database';

@Controller('health')
export class HealthController {
  @Get()
  async check() {
    let dbStatus = 'healthy';
    try {
      await db.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'degraded';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptimeSeconds: process.uptime(),
    };
  }
}

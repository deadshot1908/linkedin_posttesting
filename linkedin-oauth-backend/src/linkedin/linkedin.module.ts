import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LinkedInService } from './linkedin.service';
import { LinkedInController } from './linkedin.controller';

@Module({
  imports: [HttpModule],  // <-- This is required
  controllers: [LinkedInController],
  providers: [LinkedInService],
})
export class LinkedInModule {}

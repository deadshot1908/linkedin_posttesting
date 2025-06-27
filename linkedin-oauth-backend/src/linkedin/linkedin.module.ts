// linkedin/linkedin.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LinkedInController } from './linkedin.controller';
import { LinkedInService } from './linkedin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JobSchema } from './schemas/job.schema';
import { AgendaModule } from '../agenda/agenda.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: 'Job', schema: JobSchema }]),
    forwardRef(() => AgendaModule), // ⚠️ to resolve circular dependency
  ],
  controllers: [LinkedInController],
  providers: [LinkedInService],
  exports: [LinkedInService],
})
export class LinkedInModule {}

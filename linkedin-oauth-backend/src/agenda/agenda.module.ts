// agenda/agenda.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgendaService } from './agenda.service';
import { LinkedInModule } from '../linkedin/linkedin.module';
import { JobSchema } from '../linkedin/schemas/job.schema';

@Module({
  imports: [
    forwardRef(() => LinkedInModule), // ⚠️ to resolve circular dependency
    MongooseModule.forFeature([{ name: 'Job', schema: JobSchema }]),
  ],
  providers: [AgendaService],
  exports: [AgendaService],
})
export class AgendaModule {}

import { Injectable, OnModuleInit, Logger,Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as Agenda from 'agenda';
import { LinkedInService } from '../linkedin/linkedin.service';
import { Job } from '../linkedin/interfaces/job.interface';
import { Job as JobSchemaType } from '../linkedin/schemas/job.schema';

@Injectable()
export class AgendaService implements OnModuleInit {
  private readonly logger = new Logger(AgendaService.name);
  private agenda: Agenda.Agenda;

  constructor(
    @Inject(forwardRef(() => LinkedInService))private readonly linkedInService: LinkedInService,
    @InjectModel('Job') private readonly jobModel: Model<JobSchemaType>,
  ) {}

  async onModuleInit() {
    this.agenda = new Agenda.Agenda({
        db: {
            address: process.env.MONGODB_URI!,
            collection: 'scheduledJobs'
        }
      
    });

    this.agenda.define('linkedin-post', async (job) => {
      const { access_token, text, type, mediaPath } = job.attrs.data as Job;

      this.logger.log(`🎯 Running job: linkedin-post | Type: ${type}`);

      try {
        if (mediaPath) {
          const fs = await import('fs/promises');
          const buffer = await fs.readFile(mediaPath);
          const mimetype = mediaPath.endsWith('.mp4')
            ? 'video/mp4'
            : mediaPath.endsWith('.jpg') || mediaPath.endsWith('.jpeg')
            ? 'image/jpeg'
            : 'image/png';

          const file = {
            buffer,
            mimetype,
            originalname: mediaPath.split('/').pop() || 'uploaded',
          } as Express.Multer.File;

          if (type === 'IMAGE') {
            await this.linkedInService.shareImage(access_token, text, file);
          } else if (type === 'VIDEO') {
            await this.linkedInService.shareVideo(access_token, text, file);
          }
        } else {
          await this.linkedInService.postToLinkedIn(access_token, text);
        }

        this.logger.log('✅ Job executed successfully');
      } catch (err) {
        this.logger.error(`❌ Job failed: ${err.message}`);
      }
    });

    await this.agenda.start(); // 🟢 Start the agenda processor
    this.logger.log('📅 Agenda started and ready to process jobs');
  }
    async scheduleJob(jobName: string, runAt: Date, data: any) {
    this.logger.log(`📌 Scheduling job '${jobName}' at ${runAt}`);
    await this.agenda.schedule(runAt, jobName, data);
}
}
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobDocument = Job & Document;

@Schema()
export class Job {
  @Prop({ required: true })
  access_token: string;

  @Prop({ required: true })
  text: string;

  @Prop({ type: String, enum: ['IMAGE', 'VIDEO'], required: false })
  type?: 'IMAGE' | 'VIDEO';

  @Prop({ type: String, required: false })
  mediaPath?: string;  // Store the path to the media file
}

export const JobSchema = SchemaFactory.createForClass(Job);

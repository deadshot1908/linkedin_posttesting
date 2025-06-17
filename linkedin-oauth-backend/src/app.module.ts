import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LinkedInModule } from './linkedin/linkedin.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
      ConfigModule.forRoot({
      isGlobal: true,
    }),
      AuthModule,
      LinkedInModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

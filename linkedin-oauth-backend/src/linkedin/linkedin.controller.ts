// src/linkedin/linkedin.controller.ts
import { Controller, Get, Query, Res, Post, Body , UploadedFile, UseInterceptors} from '@nestjs/common';
import { Response } from 'express';
import { LinkedInService } from './linkedin.service';
import axios from 'axios';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class LinkedInController {
  constructor(private readonly linkedinService: LinkedInService) {}

  // Step 1: Handle LinkedIn OAuth redirect
  @Get('linkedin/callback')
async getAccessToken(@Query('code') code: string, @Res() res: Response) {
  if (!code) return res.status(400).send('Missing code');

  try {
    const token = await this.linkedinService.exchangeCodeForToken(code);
    console.log('🔐 Access token received:', token);

    // Redirect to frontend with token in query
    const redirectUrl = `http://localhost:3000/accounts?token=${encodeURIComponent(token.access_token)}`;
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Error exchanging code for token:', error);
    return res.status(500).send('Failed to authenticate with LinkedIn');
  }
}



  // Step 2: Receive post request from frontend
  @Post('linkedin/share')
  @UseInterceptors(FileInterceptor('media'))
  async postToLinkedIn(
    @UploadedFile() media: Express.Multer.File,
    @Body() body: { access_token: string; text: string }
  ) {
    const { access_token, text } = body;

    if (!access_token || !text) {
      console.warn('⚠️ Missing access_token or text in request body:', body);
      return {
        status: 400,
        message: 'Missing access_token or text in request body',
      };
    }

    try {
      // Call normal post (no media)
      const result = await this.linkedinService.postToLinkedIn(access_token, text);
      return {
        status: 200,
        message: 'Post successful',
        data: result,
      };
    } catch (err) {
      console.error('❌ LinkedIn post failed:', err.response?.data || err.message);
      throw new Error('LinkedIn post failed');
    }
  }


  @Post('linkedin/schedule')
async schedulePost(
  @Body() body: { access_token: string; text: string; scheduled_time: string },
) {
  return this.linkedinService.schedulePost(body.access_token, body.text, body.scheduled_time);
}


@Post('linkedin/userinfo')
async getUserInfo(@Body() body: { access_token: string }) {
  const { access_token } = body;
  console.log("access token for user profile",access_token)
  try {
    const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching LinkedIn user info:', error.response?.data || error.message);
    throw new Error('Failed to fetch LinkedIn user info');
  }
}

 @Post('linkedin/share-with-media')
  @UseInterceptors(FileInterceptor('media'))
  async shareWithMedia(
    @UploadedFile() media: Express.Multer.File,
    @Body()
    body: {
      access_token: string;
      text: string;
      type: 'IMAGE' | 'VIDEO';
    }
  ) {
    console.log("posting from backned");
    const { access_token, text, type } = body;

    if (!access_token || !text || !type) {
      return {
        status: 400,
        message: 'Missing required fields: access_token, text, or type',
      };
    }

    if (!media) {
      return {
        status: 400,
        message: 'Media file is missing',
      };
    }

    try {
      if (type === 'IMAGE') {
        console.log("calling shareimage");
        const result = await this.linkedinService.shareImage(
          access_token,
          text,
          media
        );
        console.log(result);
        return {
          status: 200,
          message: 'Image post successful',
          data: result,
        };
      } else if (type === 'VIDEO') {
        console.log("calling sharevideo");
        const result = await this.linkedinService.shareVideo(
          access_token,
          text,
          media
        );
        console.log(result);
        return {
          status: 200,
          message: 'Video post successful',
          data: result,
        };
      } else {
        return {
          status: 400,
          message: `Unsupported media type: ${type}`,
        };
      }
    } catch (err: any) {
      console.error(
        `❌ ${type} post failed:`,
        err.response?.data || err.message
      );
      throw new Error(`${type} post failed`);
    }
  }
}





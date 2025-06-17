// src/linkedin/linkedin.controller.ts
import { Controller, Get, Query, Res, Post, Body } from '@nestjs/common';
import { Response } from 'express';
import { LinkedInService } from './linkedin.service';

@Controller('auth')
export class LinkedInController {
  constructor(private readonly linkedinService: LinkedInService) {}

  // Step 1: Handle LinkedIn OAuth redirect
  @Get('linkedin/callback')
async getAccessToken(@Query('code') code: string, @Res() res: Response) {
  if (!code) return res.status(400).send('Missing code');

  try {
    const token = await this.linkedinService.exchangeCodeForToken(code);
    console.log('🔐 Access token received:', token.access_token);

    // Redirect to frontend with token in query
    const redirectUrl = `http://localhost:3000/post?token=${encodeURIComponent(token.access_token)}`;
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Error exchanging code for token:', error);
    return res.status(500).send('Failed to authenticate with LinkedIn');
  }
}



  // Step 2: Receive post request from frontend
  @Post('linkedin/share')
  async postToLinkedIn(@Body() body: { access_token: string; text: string }) {
    const { access_token, text } = body;

    if (!access_token || !text) {
      console.warn('⚠️ Missing access_token or text in request body:', body);
      return {
        status: 400,
        message: 'Missing access_token or text in request body',
      };
    }

    try {
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

}

import { Injectable, HttpException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import axios from 'axios';





@Injectable()
export class LinkedInService {
  constructor(private readonly httpService: HttpService) {}
  private readonly logger = new Logger(LinkedInService.name);

  async exchangeCodeForToken(code: string) {

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing LinkedIn environment variables');
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUri!);
    params.append('client_id', clientId!);
    params.append('client_secret', clientSecret!);


    const response = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return response.data;
  }


async postToLinkedIn(accessToken: string, text: string) {
  try {
    // ✅ Step 1: Get LinkedIn user's URN using OpenID Connect userinfo endpoint
    const profileRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const urn = profileRes.data.sub; // This is the correct ID from OpenID Connect

    console.log('User URN:', urn);

    // ✅ Step 2: Post a text share
    const postRes = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        author: `urn:li:person:${urn}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ LinkedIn post response:', postRes.data);
    return { success: true, response: postRes.data };
  } catch (error) {
    console.error('❌ Failed to post:', error.response?.data || error.message);
    throw new Error('LinkedIn post failed');
  }
}

async schedulePost(
    accessToken: string,
    text: string,
    media: Express.Multer.File,
    scheduledAt: string,
  ) {
    const delay = new Date(scheduledAt).getTime() - Date.now();

    if (delay <= 0) {
      throw new Error('Scheduled time must be in the future.');
    }

    this.logger.log(`⏰ Post scheduled in ${delay / 1000} seconds`);

    setTimeout(async () => {
      try {
        if (media) {
          const fileType = media.mimetype.startsWith('video') ? 'VIDEO' : 'IMAGE';
          this.logger.log(`🚀 Posting scheduled ${fileType}...`);
          if (fileType === 'IMAGE') {
            await this.shareImage(accessToken, text, media);
          } else {
            await this.shareVideo(accessToken, text, media);
          }
        } else {
          this.logger.log(`🚀 Posting scheduled text...`);
          await this.postToLinkedIn(accessToken, text);
        }

        this.logger.log('✅ Scheduled post completed.');
      } catch (err) {
        this.logger.error('❌ Scheduled post failed:', err.message || err);
      }
    }, delay);

    return { status: 'Scheduled', scheduledAt };
  }



async shareImage(
  accessToken: string,
  text: string,
  file: Express.Multer.File,
) {
  // Step 1: Get user profile to construct author URN
  const profileRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const authorUrn = `urn:li:person:${profileRes.data.sub}`;
  console.log("author :",authorUrn);

  // Step 2: Register upload
  const registerRes = await axios.post(
    'https://api.linkedin.com/v2/assets?action=registerUpload',
    {
      registerUploadRequest: {
        owner: authorUrn,
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        serviceRelationships: [
          {
            identifier: 'urn:li:userGeneratedContent',
            relationshipType: 'OWNER',
          },
        ],
        supportedUploadMechanism: ['SYNCHRONOUS_UPLOAD'],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    },
  );

  const uploadUrl =
    registerRes.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const assetUrn = registerRes.data.value.asset;
  console.log("asseturn :",assetUrn);
  console.log("uploadurl :",uploadUrl);

  // Step 3: Upload image file to the given URL
  await axios.put(uploadUrl, file.buffer, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': file.mimetype,
    },
  });
  console.log("image upload done");

  // Step 4: Create LinkedIn post with image
  const postRes = await axios.post(
    'https://api.linkedin.com/v2/ugcPosts',
    {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'IMAGE',
          media: [
            {
              status: 'READY',
              media: assetUrn,
            },
          ],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
    },
  );

  return {
    success: true,
    postUrn: postRes.data,
  };
}

async shareVideo(
  accessToken: string,
  text: string,
  file: Express.Multer.File,
) {
  // Step 1: Get LinkedIn profile to get author URN
  const profileRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const authorUrn = `urn:li:person:${profileRes.data.sub}`;

  // Step 2: Register upload for video
  const registerRes = await axios.post(
    'https://api.linkedin.com/v2/assets?action=registerUpload',
    {
      registerUploadRequest: {
        owner: authorUrn,
        recipes: ['urn:li:digitalmediaRecipe:feedshare-video'],
        serviceRelationships: [
          {
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent',
          },
        ],
        supportedUploadMechanism: ['SYNCHRONOUS_UPLOAD'],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
    },
  );

  const uploadUrl =
    registerRes.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const assetUrn = registerRes.data.value.asset;
  console.log("uploading video on linkedin server");

  // Step 3: Upload video to LinkedIn using the signed URL
  await axios.put(uploadUrl, file.buffer, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': file.mimetype,
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
console.log("upload completed");


  // Step 4: Create video post
  const postRes = await axios.post(
    'https://api.linkedin.com/v2/ugcPosts',
    {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'VIDEO',
          media: [
            {
              status: 'READY',
              media: assetUrn,
            },
          ],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
    },
  );

  return {
    success: true,
    postUrn: postRes.data,
  };
}


}
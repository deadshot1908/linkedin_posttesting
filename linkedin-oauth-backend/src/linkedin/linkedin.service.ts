import { Injectable } from '@nestjs/common';
import axios from 'axios';





@Injectable()
export class LinkedInService {
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


schedulePost(accessToken: string, text: string, scheduledTime: string) {
  const delay = new Date(scheduledTime).getTime() - Date.now();
  if (delay <= 0) throw new Error('Scheduled time must be in the future.');

  setTimeout(() => {
    this.postToLinkedIn(accessToken, text)
      .then(() => console.log('✅ Scheduled post done'))
      .catch((err) => console.error('❌ Failed to post scheduled message', err));
  }, delay);

  return { success: true, message: 'Post scheduled' };
}

}

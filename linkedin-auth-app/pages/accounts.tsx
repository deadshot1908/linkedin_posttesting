import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import axios from 'axios';

const Account: React.FC = () => {
  const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!;
  const redirectUri = process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI!;
  const scope = 'openid w_member_social email';
  const router = useRouter();

  const [accessToken, setAccessToken] = useState('');
  const [username, setUsername] = useState('');

  // Get token from URL or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('linkedin_token', token);
      setAccessToken(token);
    } else {
      const savedToken = localStorage.getItem('linkedin_token');
      if (savedToken) {
        setAccessToken(savedToken);
      }
    }
  }, []);

  // Fetch user info using OpenID `userinfo` endpoint
  useEffect(() => {

    const fetchUserInfo = async () => {
       if (!accessToken) return;
  try {
    const res = await axios.post('http://localhost:3001/auth/linkedin/userinfo', {
      access_token: accessToken,
    });
    console.log("👤 LinkedIn user info:", res.data);
    setUsername(res.data.email || 'Unknown User');
  } catch (err: any) {
    console.error("Failed to fetch user info:", err.response?.data || err.message);
    setUsername("Linkedin User")
  }
};


    fetchUserInfo();
  }, [accessToken]);

  // Trigger LinkedIn OAuth flow
  const loginWithLinkedIn = () => {
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  };

  // Disconnect account (clear token)
  const handleLogout = () => {
    localStorage.removeItem('linkedin_token');
    setAccessToken('');
    setUsername('');
    alert('✅ Disconnected from LinkedIn!');
    router.push('/accounts');
  };

return (
  <Layout>
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">🔗 LinkedIn Account</h1>

      {accessToken ? (
        <div className="bg-white shadow-md rounded-lg p-6 max-w-xl flex items-center justify-between">
          <div>
            <p className="text-gray-700 mb-1">✅ Connected as</p>
            <p className="text-lg font-medium text-gray-900">{username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 transition"
          >
            🔌 Disconnect
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 max-w-xl text-center">
          <p className="text-gray-700 mb-4">Please connect your LinkedIn account to get started.</p>
          <button
            onClick={loginWithLinkedIn}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
          >
            🔐 Connect LinkedIn
          </button>
        </div>
      )}
    </div>
  </Layout>
);

};

export default Account;

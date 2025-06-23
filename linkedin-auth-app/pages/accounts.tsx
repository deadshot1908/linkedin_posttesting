import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

const Accounts: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState('');

  const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!;
  const redirectUri = process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI!;
  const scope = 'openid w_member_social email';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get('token');
    if (token) {
      localStorage.setItem('linkedin_token', token);
    } else {
      token= localStorage.getItem('linkedin_token');
    }
    if (token) {
      setIsConnected(true);
      // You may fetch user info from backend using token here
      // For now, using dummy username
      setUsername('@LinkedInUser');
    }
  }, []);

  const loginWithLinkedIn = () => {
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  };

  return (
    <Layout>
      <div style={{ padding: 40 }}>
        {!isConnected ? (
          <div>
            <h2>🔌 Connect Your LinkedIn Account</h2>
            <p>You need to connect your LinkedIn account to continue.</p>
            <button onClick={loginWithLinkedIn}>Connect LinkedIn</button>
          </div>
        ) : (
          <div>
            <h2>✅ Connected Account</h2>
            <p style={{ fontSize: '18px', color: 'green' }}>{username} - Connected</p>
            <button style={{ color: 'red' }}>Logout</button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Accounts;

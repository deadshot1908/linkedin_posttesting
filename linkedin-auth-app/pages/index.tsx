
import React from 'react';

const Home: React.FC = () => {
  const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!;
  const redirectUri = process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI!;
  const scope = 'openid w_member_social email';

  const loginWithLinkedIn = () => {
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  };

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ color: 'blue' }}>Login with LinkedIn</h1>
      <button onClick={loginWithLinkedIn}>Login</button>
    </div>
  );
};

export default Home;

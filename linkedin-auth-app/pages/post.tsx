import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';

export default function PostPage() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('linkedin_token');
    if (saved) {
      setAccessToken(saved);
    } else {
      alert('⚠️ Please connect your LinkedIn account first.');
      router.push('/accounts');
    }
  }, []);

  const handleInstantPost = async () => {
    try {
      await axios.post('http://localhost:3001/auth/linkedin/share', {
        access_token: accessToken,
        text: message,
      });
      setStatus('✅ Post published successfully!');
    } catch (err) {
      console.error('Instant post error:', err.response?.data || err.message);
      setStatus('❌ Instant post failed.');
    }
  };

  const handleSchedulePost = async () => {
    try {
      await axios.post('http://localhost:3001/auth/linkedin/schedule', {
        access_token: accessToken,
        text: message,
        scheduledAt: scheduleDateTime, // ISO datetime string
      });
      setStatus('📅 Post scheduled successfully!');
    } catch (err) {
      console.error('Schedule post error:', err.response?.data || err.message);
      setStatus('❌ Failed to schedule post.');
    }
  };

  return (
    <Layout>
      <div style={{ padding: '40px' }}>
        <h2>Content Box</h2>

        <textarea
          rows={5}
          cols={50}
          placeholder="Write something to post on LinkedIn..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <br /><br />

        <button onClick={handleInstantPost}>🚀 Post Now</button>

        <div style={{ marginTop: '20px' }}>
          <label>Schedule Post: </label><br />
          <input
            type="datetime-local"
            value={scheduleDateTime}
            onChange={(e) => setScheduleDateTime(e.target.value)}
          />
          <br /><br />
          <button onClick={handleSchedulePost}>⏰ Schedule Post</button>
        </div>

        <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{status}</p>
      </div>
    </Layout>
  );
}

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
    } catch (err:any) {
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
    } catch (err:any) {
      console.error('Schedule post error:', err.response?.data || err.message);
      setStatus('❌ Failed to schedule post.');
    }
  };

return (
  <Layout>
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-600 mb-6">📝 Create LinkedIn Post</h2>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <textarea
          rows={5}
          placeholder="Write something to post on LinkedIn..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
        <button
          onClick={handleInstantPost}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          🚀 Post Now
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <label className="block text-gray-700 font-medium mb-2">📅 Schedule Post</label>
        <input
          type="datetime-local"
          value={scheduleDateTime}
          onChange={(e) => setScheduleDateTime(e.target.value)}
          className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSchedulePost}
          className="mt-4 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
        >
          ⏰ Schedule Post
        </button>
      </div>

      {status && (
        <p className="text-center text-lg font-semibold mt-4 text-gray-800">{status}</p>
      )}
    </div>
  </Layout>
);

}

import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';

export default function PostPage() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
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
        console.log("Post Started");
        const formData = new FormData();
        formData.append('access_token', accessToken);
        formData.append('text', message);

        if (mediaFile) {
        formData.append('media', mediaFile);
        const fileType = mediaFile.type.startsWith('video') ? 'VIDEO' : 'IMAGE';
        formData.append('type', fileType);
        }

        const endpoint = mediaFile
        ? 'http://localhost:3001/auth/linkedin/share-with-media'
        : 'http://localhost:3001/auth/linkedin/share';

        await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        });

      setStatus('✅ Post published successfully!');
    } catch (err: any) {
      console.error('Instant post error:', err.response?.data || err.message);
      setStatus('❌ Instant post failed.');
    }
  };

  const handleSchedulePost = async () => {
    try {
      const formData = new FormData();
      formData.append('access_token', accessToken);
      formData.append('text', message);
      formData.append('scheduledAt', scheduleDateTime);
      if (mediaFile) formData.append('media', mediaFile);

      await axios.post('http://localhost:3001/auth/linkedin/schedule', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStatus('📅 Post scheduled successfully!');
    } catch (err: any) {
      console.error('Schedule post error:', err.response?.data || err.message);
      setStatus('❌ Failed to schedule post.');
    }
  };

  return (
    <Layout>
      <div className="p-10">
        <h2 className="text-2xl font-semibold mb-4">Create LinkedIn Post</h2>

        <textarea
          rows={5}
          className="w-full border rounded p-2"
          placeholder="Write something to post on LinkedIn..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="mt-4">
          <label className="block font-medium mb-1">Upload Media File (Image or Video):</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mt-4 flex gap-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleInstantPost}
          >
            🚀 Post Now
          </button>

          <div>
            <input
              type="datetime-local"
              className="border p-2 rounded"
              value={scheduleDateTime}
              onChange={(e) => setScheduleDateTime(e.target.value)}
            />
            <button
              className="ml-2 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
              onClick={handleSchedulePost}
            >
              ⏰ Schedule Post
            </button>
          </div>
        </div>

        <p className="mt-4 font-semibold">{status}</p>
      </div>
    </Layout>
  );
}

import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Scheduler() {
  const [expired, setExpired] = useState(false);
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const load = () => {
    api
      .get('/api/posts/status/SCHEDULED')
      .then((res) => {
        const payload = res?.data?.data || {};
        const posts = payload.posts || payload.items || [];
        setScheduled(posts);
      })
      .catch((e) => {
        if (e?.response?.status === 401) {
          setExpired(true);
          setError('');
        } else {
          setError(e?.message || 'Failed to load scheduled posts');
        }
      });
  };

  useEffect(() => {
    load();
  }, []);

  // Create post UI removed; scheduling handled via content variations and channels

  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold">Scheduler</h1>
      {expired && (
        <div className="text-amber-300 bg-amber-900/30 border border-amber-700 rounded-lg p-3">
          Session expired. Please log in again.
        </div>
      )}
      {error && (
        <div className="text-red-400 bg-red-900/40 border border-red-800 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg space-y-2">
        <div className="text-sm text-gray-400">Scheduling is available via content variations and channels.</div>
        <div className="text-xs text-gray-500">Use Content Manager and channel settings to create and schedule posts.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scheduled.map((p, idx) => (
          <div key={idx} className="bg-gray-900 p-5 rounded-2xl shadow-lg space-y-2">
            <div className="font-semibold text-white">{p?.variation?.adaptedText || 'Scheduled Post'}</div>
            <div className="text-sm text-gray-400">{p?.scheduledTime || ''}</div>
            <div className="text-xs text-gray-500">channel: {p?.channel?.name || 'N/A'} • status: {p?.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    api
      .get('/api/dashboard/quick-stats')
      .then((res) => {
        const payload = res?.data?.data || {};
        setStats({
          totalPosts: payload?.monthPosts ?? 0,
          scheduledPosts: payload?.pendingScheduled ?? 0,
          engagementSummary: payload?.weekPosts ?? 0,
        });
      })
      .catch((e) => {
        if (e?.response?.status === 401) {
          setExpired(true);
          setError('');
        } else {
          setError(e?.message || 'Failed to load dashboard');
        }
      });
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-400">Overview of your content performance</div>
      </div>

      {expired && (
        <div className="text-amber-300 bg-amber-900/30 border border-amber-700 rounded-lg p-3">
          Session expired. Please log in again.
        </div>
      )}
      {error && <div className="text-red-500 bg-red-900/30 border border-red-800 rounded-lg p-3">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
          <div className="text-sm text-gray-400">Total Posts</div>
          <div className="text-3xl font-bold mt-2">{stats?.totalPosts ?? 0}</div>
        </div>
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
          <div className="text-sm text-gray-400">Scheduled</div>
          <div className="text-3xl font-bold mt-2">{stats?.scheduledPosts ?? 0}</div>
        </div>
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
          <div className="text-sm text-gray-400">Engagement</div>
          <div className="text-3xl font-bold mt-2">{stats?.engagementSummary ?? 0}</div>
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
        <div className="text-sm text-gray-400 mb-3">Recent Activity</div>
        <div className="h-40 rounded-xl bg-gray-800/60 flex items-center justify-center text-gray-400">
          Chart / Activity Feed Placeholder
        </div>
      </div>
    </div>
  );
}
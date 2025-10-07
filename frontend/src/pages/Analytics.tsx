import { useEffect, useState } from 'react';

import { getAccessToken } from '../utils/auth';

export default function Analytics() {
  const base = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    const token = getAccessToken();
    const url = token
      ? `${base}/api/events/subscribe?token=${encodeURIComponent(token)}`
      : `${base}/api/events/subscribe`;
    const es = new EventSource(url);
    es.onmessage = (ev) => setEvents((prev) => [...prev, ev.data]);
    es.onerror = () => {
      es.close();
    };
    return () => es.close();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
          <div className="text-sm text-gray-400">Impressions</div>
          <div className="text-3xl font-bold mt-2">24.3k</div>
        </div>
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
          <div className="text-sm text-gray-400">Engagement Rate</div>
          <div className="text-3xl font-bold mt-2">7.2%</div>
        </div>
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
          <div className="text-sm text-gray-400">Conversions</div>
          <div className="text-3xl font-bold mt-2">1,024</div>
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
        <div className="text-sm text-gray-400 mb-3">Chart Area</div>
        <div className="h-48 rounded-xl bg-gray-800/60 flex items-center justify-center text-gray-400">
          Analytics Chart Placeholder
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
        <div className="text-sm text-gray-400 mb-2">Real-time events</div>
        <div className="space-y-1">
          {events.length === 0 ? (
            <div className="text-sm text-gray-500">Waiting for events...</div>
          ) : (
            events.map((e, idx) => (
              <div key={idx} className="text-xs font-mono break-words text-gray-300">
                {e}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ContentManager() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    api
      .get('/api/content')
      .then((res) => {
        const payload = res?.data?.data || {};
        const items = payload.contentItems || payload.items || [];
        setItems(items);
      })
      .catch((e) => {
        if (e?.response?.status === 401) {
          setExpired(true);
          setError('');
        } else {
          setError(e?.message || 'Failed to load content');
        }
      });
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold">Content Manager</h1>
      {expired && (
        <div className="text-amber-300 bg-amber-900/30 border border-amber-700 rounded-lg p-3">
          Session expired. Please log in again.
        </div>
      )}
      {error && <div className="text-red-500 bg-red-900/30 border border-red-800 rounded-lg p-3">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <div key={idx} className="bg-gray-900 p-5 rounded-2xl shadow-lg space-y-2">
            <div className="font-semibold text-white">{item.title || 'Untitled'}</div>
            <div className="text-sm text-gray-400">{item.summary || 'No summary available.'}</div>
            <div className="flex gap-2 pt-2">
              <button className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition">Edit</button>
              <button className="px-3 py-1 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition">Preview</button>
              <button className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-500 transition">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
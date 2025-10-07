import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { clearTokens } from '../utils/auth';
import RequireAuth from './RequireAuth.jsx';

export default function ProtectedLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      clearTokens();
    } catch (_) {}
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 hidden md:flex flex-col">
        <h1 className="text-xl font-bold text-white mb-6">ContentOps AI</h1>
        <nav className="flex flex-col space-y-3">
          <Link to="/" className="hover:bg-gray-800 p-2 rounded-md transition">Dashboard</Link>
          <Link to="/content" className="hover:bg-gray-800 p-2 rounded-md transition">Content Manager</Link>
          <Link to="/scheduler" className="hover:bg-gray-800 p-2 rounded-md transition">Scheduler</Link>
          <Link to="/analytics" className="hover:bg-gray-800 p-2 rounded-md transition">Analytics</Link>
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-500 text-white rounded-md px-4 py-2 transition">Logout</button>
        </div>
      </aside>

      <div className="md:hidden w-full border-b border-gray-800 bg-gray-900 p-4 flex items-center justify-between">
        <div className="text-white font-semibold">ContentOps AI</div>
        <button
          className="text-gray-300 hover:text-white transition"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? 'Close' : 'Menu'}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden w-full bg-gray-900 border-b border-gray-800 px-4 pb-4 animate-[fadeIn_0.2s_ease-in]">
          <nav className="flex flex-col space-y-2">
            <Link to="/" onClick={() => setMobileOpen(false)} className="hover:bg-gray-800 p-2 rounded-md transition">Dashboard</Link>
            <Link to="/content" onClick={() => setMobileOpen(false)} className="hover:bg-gray-800 p-2 rounded-md transition">Content Manager</Link>
            <Link to="/scheduler" onClick={() => setMobileOpen(false)} className="hover:bg-gray-800 p-2 rounded-md transition">Scheduler</Link>
            <Link to="/analytics" onClick={() => setMobileOpen(false)} className="hover:bg-gray-800 p-2 rounded-md transition">Analytics</Link>
            <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="text-left hover:bg-gray-800 p-2 rounded-md transition">Logout</button>
          </nav>
        </div>
      )}

      <main className="flex-1 p-6 overflow-auto">
        <RequireAuth>
          <Outlet />
        </RequireAuth>
      </main>
    </div>
  );
}
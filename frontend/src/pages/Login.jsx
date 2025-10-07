import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { setTokens, clearTokens } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const expired = new URLSearchParams(location.search).get('expired') === '1';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { accessToken, refreshToken } = res?.data?.data || {};
      if (!accessToken || !refreshToken) {
        throw new Error('Invalid login response');
      }
      setTokens({ accessToken, refreshToken });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      clearTokens();
      setError(err?.response?.data?.message || err?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] to-[#111827] px-4 overflow-hidden">
      {/* Glowing background orb */}
      <div className="absolute w-96 h-96 bg-blue-600/30 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-slow-pulse" />

      <div className="relative z-10 w-full max-w-md p-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-lg shadow-blue-500/10 animate-fade-in">
        {/* Logo + Heading */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 flex items-center justify-center">
            <span className="text-white font-semibold">CO</span>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-1">Welcome to ContentOps AI</h1>
          <p className="text-gray-400 text-sm">Sign in to access your dashboard</p>
        </div>

        {/* Status Messages */}
        {expired && (
          <div className="mb-4 text-amber-300 bg-amber-900/30 border border-amber-700/50 rounded-lg p-3">
            Session expired. Please log in again.
          </div>
        )}
        {error && (
          <div className="mb-4 text-red-400 bg-red-900/40 border border-red-800/60 rounded-lg p-3">{error}</div>
        )}

        {/* Form */}
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-gray-400 mb-1 text-sm">Email</label>
            <input
              type="email"
              className="w-full p-3 bg-white/10 text-white rounded-md border border-white/10 shadow-inner placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 outline-none transition animate-slide-up"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1 text-sm">Password</label>
            <input
              type="password"
              className="w-full p-3 bg-white/10 text-white rounded-md border border-white/10 shadow-inner placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 outline-none transition animate-slide-up"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 animate-slide-up"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-5 text-gray-500 text-sm">
          <a href="#" className="hover:text-blue-400 transition">Forgot password?</a>
        </div>
        <div className="text-center mt-4 text-xs text-gray-600">© 2025 ContentOps AI. All rights reserved.</div>
      </div>
    </div>
  );
}
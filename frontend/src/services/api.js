import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/auth';

const baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Flag to avoid infinite refresh loops
let isRefreshing = false;
let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error || {};
    const originalRequest = config;
    if (response && response.status === 401) {
      // Attempt refresh once per request
      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          clearTokens();
          // No refresh token: redirect to login immediately
          try { window.location.replace('/login?expired=1'); } catch (_) {}
          return Promise.reject(error);
        }
        // Call refresh endpoint
        refreshPromise = api
          .post('/api/auth/refresh', { refreshToken })
          .then((res) => {
            const payload = res?.data?.data || {};
            const accessToken = payload.accessToken;
            const newRefresh = payload.refreshToken;
            if (accessToken) {
              setTokens({ accessToken, refreshToken: newRefresh || refreshToken });
            }
            return accessToken;
          })
          .catch((e) => {
            // Refresh failed: clear tokens and redirect with message
            clearTokens();
            try { window.location.replace('/login?expired=1'); } catch (_) {}
            throw e;
          })
          .finally(() => {
            isRefreshing = false;
          });
      }
      try {
        const newAccess = await refreshPromise;
        // Retry original request with new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
        return api.request(originalRequest);
      } catch (e) {
        // Redirect to login handled by caller; propagate error
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
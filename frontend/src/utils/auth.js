// Simple localStorage-based token utilities
export const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

export const setTokens = ({ accessToken, refreshToken }) => {
  try {
    if (accessToken) localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
  } catch (_) {
    // ignore storage errors
  }
};

export const clearTokens = () => {
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  } catch (_) {
    // ignore
  }
};
import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken } from '../utils/auth';

export default function RequireAuth({ children }) {
  const location = useLocation();
  const hasAccess = !!getAccessToken();
  if (!hasAccess) {
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return children;
}
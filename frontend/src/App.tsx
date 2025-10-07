import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ContentManager from './pages/ContentManager';
import Scheduler from './pages/Scheduler';
import Analytics from './pages/Analytics';
import Login from './pages/Login.jsx';
import ProtectedLayout from './components/ProtectedLayout.jsx';
import { getAccessToken } from './utils/auth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root should redirect to login if unauthenticated */}
        <Route path="/" element={getAccessToken() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

        {/* Public route: Login, no sidebar */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes with layout and sidebar */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/content" element={<ContentManager />} />
          <Route path="/scheduler" element={<Scheduler />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
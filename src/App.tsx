import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TrackerDashboard from './pages/TrackerDashboard';
import StagingCurationPage from './pages/StagingCurationPage';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--plane-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--plane-text-muted)' }}>Loading session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user } = useAuth();
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<ProtectedRoute><TrackerDashboard /></ProtectedRoute>} />
        <Route path="/staging" element={<ProtectedRoute><StagingCurationPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

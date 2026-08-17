import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TrackerDashboard from './pages/TrackerDashboard';
import StagingCurationPage from './pages/StagingCurationPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrackerDashboard />} />
        <Route path="/staging" element={<StagingCurationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

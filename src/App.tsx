import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './components/auth/AuthPage';
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { ResumePage } from './pages/ResumePage';
import { SkillsPage } from './pages/SkillsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { JobMatchPage } from './pages/JobMatchPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { CareerRoadmapPage } from './pages/CareerRoadmapPage';
import { BenchmarkingPage } from './pages/BenchmarkingPage';
import { ImprovementSimulatorPage } from './pages/ImprovementSimulatorPage';
import { AtsAnalyzerPage } from './pages/AtsAnalyzerPage';
import { CareerAnalyticsPage } from './pages/CareerAnalyticsPage';
import { ProgressTrackingPage } from './pages/ProgressTrackingPage';
import { getAuthToken, setAuthToken, removeAuthToken } from './utils/token';
import { apiClient } from './services/apiClient';
import { LoadingSpinner } from './components/common/LoadingSpinner';

export const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check existing session
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiClient.get('/auth/me');
        if (res.data) {
          setUser(res.data);
        } else {
          removeAuthToken();
        }
      } catch (err) {
        console.warn('Session verification failed:', err);
        removeAuthToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Unauthenticated Flow
  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Authenticated Application Shell with Sidebar Navigation
  return (
    <BrowserRouter>
      <AuthenticatedLayout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<HomePage user={user} />} />
          <Route path="/home" element={<HomePage user={user} />} />
          <Route path="/profile" element={<ProfilePage user={user} onUserUpdate={setUser} />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/resumes" element={<ResumePage />} />
          <Route path="/ats" element={<AtsAnalyzerPage />} />
          <Route path="/ats-analyzer" element={<AtsAnalyzerPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/job-match" element={<JobMatchPage />} />
          <Route path="/jobs" element={<JobMatchPage />} />
          <Route path="/match" element={<JobMatchPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/roadmap" element={<CareerRoadmapPage />} />
          <Route path="/benchmarking" element={<BenchmarkingPage />} />
          <Route path="/simulator" element={<ImprovementSimulatorPage />} />
          <Route path="/analytics" element={<CareerAnalyticsPage />} />
          <Route path="/charts" element={<CareerAnalyticsPage />} />
          <Route path="/skill-charts" element={<CareerAnalyticsPage />} />
          <Route path="/readiness" element={<CareerAnalyticsPage />} />
          <Route path="/readiness-visualization" element={<CareerAnalyticsPage />} />
          <Route path="/progress" element={<ProgressTrackingPage />} />
          <Route path="/progress-tracking" element={<ProgressTrackingPage />} />
          <Route path="/executive-dashboard" element={<CareerAnalyticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthenticatedLayout>
    </BrowserRouter>
  );
};

export default App;

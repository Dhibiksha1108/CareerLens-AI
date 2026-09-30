import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { ResumePage } from './pages/ResumePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { GithubPage } from './pages/GithubPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { JobsPage } from './pages/JobsPage';
import { SkillsPage } from './pages/SkillsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { BenchmarkingPage } from './pages/BenchmarkingPage';
import { SimulatorPage } from './pages/SimulatorPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/github" element={<GithubPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/benchmarking" element={<BenchmarkingPage />} />
              <Route path="/simulator" element={<SimulatorPage />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

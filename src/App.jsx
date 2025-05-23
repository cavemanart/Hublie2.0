import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';

import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import OnboardingPage from '@/pages/OnboardingPage';
import DashboardPage from '@/pages/DashboardPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';

import SharedGoalsPage from '@/pages/SharedGoalsPage';
import VentLogPage from '@/pages/VentLogPage';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { HouseholdProvider } from '@/contexts/HouseholdContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  console.log('ProtectedRoute user:', user, 'loading:', loading);

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shared-goals"
          element={
            <ProtectedRoute>
              <SharedGoalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vent-log"
          element={
            <ProtectedRoute>
              <VentLogPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <HouseholdProvider>
        <Router>
          <AppRoutes />
          <Toaster />
        </Router>
      </HouseholdProvider>
    </AuthProvider>
  );
}

export default App;

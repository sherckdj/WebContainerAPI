import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { WelcomePage } from './pages/WelcomePage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminCoursesPage } from './pages/AdminCoursesPage';
import { AdminAppsPage } from './pages/AdminAppsPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { CourseEnrollmentsPage } from './pages/CourseEnrollmentsPage';
import { CourseGradebookPage } from './pages/CourseGradebookPage';
import { ProfilePage } from './pages/ProfilePage';
import { UserProfilePage } from './pages/UserProfilePage';
import { supabase } from './lib/supabase';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show nothing while checking auth state
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {!isAuthenticated ? (
            <>
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/courses" replace />} />
                <Route path="welcome/:role" element={<WelcomePage />} />
                <Route path="admin/users" element={<AdminUsersPage />} />
                <Route path="admin/courses" element={<AdminCoursesPage />} />
                <Route path="admin/apps" element={<AdminAppsPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="courses/:id" element={<CourseDetailPage />} />
                <Route path="courses/:id/enrollments" element={<CourseEnrollmentsPage />} />
                <Route path="gradebook" element={<CourseGradebookPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="users/:id" element={<UserProfilePage />} />
              </Route>
            </>
          )}
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
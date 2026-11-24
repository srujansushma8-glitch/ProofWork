import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';

// Screens
import { LandingPage } from './screens/public/LandingPage';
import { AuthScreen } from './screens/worker/AuthScreen';
import { ProfileSetupScreen } from './screens/worker/ProfileSetupScreen';
import { HomeScreen } from './screens/worker/HomeScreen';
import { TaskPickerScreen } from './screens/worker/TaskPickerScreen';
import { RecordScreen } from './screens/worker/RecordScreen';
import { UploadProgressScreen } from './screens/worker/UploadProgressScreen';
import { AssessmentResultScreen } from './screens/worker/AssessmentResultScreen';
import { PassportScreen } from './screens/worker/PassportScreen';
import { JobsScreen } from './screens/worker/JobsScreen';
import { SettingsScreen } from './screens/worker/SettingsScreen';
import { VerifierScreen } from './screens/verifier/VerifierScreen';
import { PublicPassportScreen } from './screens/public/PublicPassportScreen';
import { ContractorDashboard } from './screens/contractor/ContractorDashboard';

// Layout container
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  // Route types
  const isLandingPage = location.pathname === '/';
  const isAuthRoute = location.pathname === '/auth';
  const isRecordRoute = location.pathname.startsWith('/record/');
  const isVerifierRoute = location.pathname.startsWith('/verify/');

  // If public landing page, render directly with its own Navbar and Footer
  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      {/* Top Application Navigation */}
      <Navbar />

      {/* Main Content Area - Full width with centered max-w-7xl responsive multi-column layouts */}
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>

      {/* Mobile Sticky Bottom Navigation (hidden on md and desktop) */}
      {!isAuthRoute && !isRecordRoute && !isVerifierRoute && <BottomNav />}
    </div>
  );
};

// Protected route component
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated && !user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

export function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppLayout>
            <Routes>
              {/* 1. Public Landing Page at "/" */}
              <Route path="/" element={<LandingPage />} />

              {/* 2. Public Authentication & Verifier Routes */}
              <Route path="/auth" element={<AuthScreen />} />
              <Route path="/verify/:token" element={<VerifierScreen />} />
              <Route path="/p/:passportId" element={<PublicPassportScreen />} />

              {/* 3. Contractor Portal */}
              <Route path="/contractor" element={<ContractorDashboard />} />

              {/* 4. Worker App Entry & Protected Routes */}
              <Route
                path="/app"
                element={
                  <RequireAuth>
                    <HomeScreen />
                  </RequireAuth>
                }
              />
              <Route
                path="/profile-setup"
                element={
                  <RequireAuth>
                    <ProfileSetupScreen />
                  </RequireAuth>
                }
              />
              <Route
                path="/tasks"
                element={
                  <RequireAuth>
                    <TaskPickerScreen />
                  </RequireAuth>
                }
              />
              <Route
                path="/record/:taskId"
                element={
                  <RequireAuth>
                    <RecordScreen />
                  </RequireAuth>
                }
              />
              <Route
                path="/upload"
                element={
                  <RequireAuth>
                    <UploadProgressScreen />
                  </RequireAuth>
                }
              />
              <Route
                path="/result/:assessmentId"
                element={
                  <RequireAuth>
                    <AssessmentResultScreen />
                  </RequireAuth>
                }
              />
              <Route
                path="/passport"
                element={
                  <RequireAuth>
                    <PassportScreen />
                  </RequireAuth>
                }
              />
              <Route
                path="/jobs"
                element={
                  <RequireAuth>
                    <JobsScreen />
                  </RequireAuth>
                }
              />
              <Route
                path="/settings"
                element={
                  <RequireAuth>
                    <SettingsScreen />
                  </RequireAuth>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;

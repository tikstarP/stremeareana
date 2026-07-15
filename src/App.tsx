import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, type ReactNode } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { LivePlayerProvider } from './contexts/LivePlayerContext';
import GlobalFloatingPlayer from './components/GlobalFloatingPlayer';
import ErrorBoundary from './components/ErrorBoundary';
const EntryPage = lazy(() => import('./pages/EntryPage'));
const StreamerLanding = lazy(() => import('./pages/StreamerLanding'));
const ViewerLanding = lazy(() => import('./pages/ViewerLanding'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const JoinRoomPage = lazy(() => import('./pages/JoinRoomPage'));
const FanGalleryPage = lazy(() => import('./pages/FanGalleryPage'));
const LiveRoomPage = lazy(() => import('./pages/LiveRoomPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const CreateRoomPage = lazy(() => import('./pages/CreateRoomPage'));
const AudioDock = lazy(() => import('./pages/AudioDock'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const StreamerStudio = lazy(() => import('./pages/StreamerStudio'));
const OverlayPage = lazy(() => import('./pages/OverlayPage'));

function PageFallback() {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-arcade-purple/30 border-t-arcade-purple rounded-full animate-spin" />
    </div>
  );
}

function LazyRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <LivePlayerProvider>
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/entry" replace />} />
            <Route path="/entry" element={<LazyRoute><EntryPage /></LazyRoute>} />
            <Route path="/streamer" element={<LazyRoute><StreamerLanding /></LazyRoute>} />
            <Route path="/viewer" element={<LazyRoute><ViewerLanding /></LazyRoute>} />
            <Route path="/privacy" element={<LazyRoute><PrivacyPage /></LazyRoute>} />
            <Route path="/terms" element={<LazyRoute><TermsPage /></LazyRoute>} />
            <Route path="/contact" element={<LazyRoute><ContactPage /></LazyRoute>} />
            <Route path="/about" element={<LazyRoute><AboutPage /></LazyRoute>} />
            <Route path="/leaderboard" element={<LazyRoute><LeaderboardPage /></LazyRoute>} />
            <Route path="/settings" element={<LazyRoute><SettingsPage /></LazyRoute>} />
            <Route path="/reset-password" element={<LazyRoute><ResetPasswordPage /></LazyRoute>} />
            <Route path="/verify-email" element={<LazyRoute><VerifyEmailPage /></LazyRoute>} />
            <Route path="/login" element={<LazyRoute><LoginPage /></LazyRoute>} />
            <Route path="/join" element={<LazyRoute><JoinRoomPage /></LazyRoute>} />
            <Route path="/room/:roomCode" element={<LazyRoute><LiveRoomPage /></LazyRoute>} />
            <Route path="/create-room" element={<LazyRoute><CreateRoomPage /></LazyRoute>} />
            <Route path="/studio/:roomCode" element={<LazyRoute><StreamerStudio /></LazyRoute>} />
            <Route path="/audio/:roomCode" element={<LazyRoute><AudioDock /></LazyRoute>} />
            <Route path="/overlay/:roomCode" element={<LazyRoute><OverlayPage /></LazyRoute>} />
            <Route path="/fan-gallery/:roomCode" element={<LazyRoute><FanGalleryPage /></LazyRoute>} />
            <Route path="*" element={<LazyRoute><EntryPage /></LazyRoute>} />
          </Routes>
          </ErrorBoundary>
          <ErrorBoundary>
          <GlobalFloatingPlayer />
          </ErrorBoundary>
        </LivePlayerProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
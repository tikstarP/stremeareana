import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, type ReactNode } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { LivePlayerProvider } from './contexts/LivePlayerContext';
import GlobalFloatingPlayer from './components/GlobalFloatingPlayer';
import ErrorBoundary from './components/ErrorBoundary';
import EntryPage from './pages/EntryPage';
import StreamerLanding from './pages/StreamerLanding';
import ViewerLanding from './pages/ViewerLanding';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import JoinRoomPage from './pages/JoinRoomPage';
import FanGalleryPage from './pages/FanGalleryPage';
import LiveRoomPage from './pages/LiveRoomPage';
import LoginPage from './pages/LoginPage';

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
            <Route path="/entry" element={<EntryPage />} />
            <Route path="/streamer" element={<StreamerLanding />} />
            <Route path="/viewer" element={<ViewerLanding />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/leaderboard" element={<LazyRoute><LeaderboardPage /></LazyRoute>} />
            <Route path="/settings" element={<LazyRoute><SettingsPage /></LazyRoute>} />
            <Route path="/reset-password" element={<LazyRoute><ResetPasswordPage /></LazyRoute>} />
            <Route path="/verify-email" element={<LazyRoute><VerifyEmailPage /></LazyRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/join" element={<JoinRoomPage />} />
            <Route path="/room/:roomCode" element={<LiveRoomPage />} />
            <Route path="/create-room" element={<LazyRoute><CreateRoomPage /></LazyRoute>} />
            <Route path="/studio/:roomCode" element={<LazyRoute><StreamerStudio /></LazyRoute>} />
            <Route path="/audio/:roomCode" element={<LazyRoute><AudioDock /></LazyRoute>} />
            <Route path="/overlay/:roomCode" element={<LazyRoute><OverlayPage /></LazyRoute>} />
            <Route path="/fan-gallery/:roomCode" element={<LazyRoute><FanGalleryPage /></LazyRoute>} />
          </Routes>
          </ErrorBoundary>
          <GlobalFloatingPlayer />
        </LivePlayerProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
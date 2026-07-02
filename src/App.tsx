import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './context/AppContext';
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
import LiveRoomPage from './pages/LiveRoomPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateRoomPage from './pages/CreateRoomPage';
import AudioDock from './pages/AudioDock';
import LeaderboardPage from './pages/LeaderboardPage';
import SettingsPage from './pages/SettingsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const StreamerStudio = lazy(() => import('./pages/StreamerStudio'));
const OverlayPage = lazy(() => import('./pages/OverlayPage'));

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
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/join" element={<JoinRoomPage />} />
            <Route path="/room/:roomCode" element={<LiveRoomPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/create-room" element={<CreateRoomPage />} />
            <Route path="/studio/:roomCode" element={<Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-8 h-8 border-2 border-arcade-yellow border-t-transparent rounded-full animate-spin" /></div>}><StreamerStudio /></Suspense>} />
            <Route path="/audio/:roomCode" element={<AudioDock />} />
            <Route path="/overlay/:roomCode" element={<Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-8 h-8 border-2 border-arcade-yellow border-t-transparent rounded-full animate-spin" /></div>}><OverlayPage /></Suspense>} />
          </Routes>
          </ErrorBoundary>
          <GlobalFloatingPlayer />
        </LivePlayerProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

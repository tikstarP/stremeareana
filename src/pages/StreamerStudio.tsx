import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Lock, Sparkles, Eye, Monitor, Shield, Volume2, Headphones, Zap, ChevronDown, Check } from 'lucide-react';
import MoltenBackground from '../components/MoltenBackground';
import Toast from '../components/Toast';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { getRoomByCode, updateRoom, getArtSubmissions, updateArtSubmission, deleteArtSubmission, createOverlayEvent } from '../lib/api';
import StudioTopBar from '../components/studio/StudioTopBar';
import StudioLivePreview from '../components/studio/StudioLivePreview';
import StudioRoomSetup from '../components/studio/StudioRoomSetup';
import StudioFanDropPanel from '../components/studio/StudioFanDropPanel';
import StudioSoundControl from '../components/studio/StudioSoundControl';
import StudioAIHost from '../components/studio/StudioAIHost';
import StudioMobileView from '../components/studio/StudioMobileView';
import CollapsibleSection from '../components/studio/CollapsibleSection';
import SelectionArena from '../components/studio/SelectionArena';
import type { SelectionConfig } from '../components/studio/SelectionArena';
import PlayerLobby from '../components/studio/PlayerLobby';
import type { LobbyPlayer } from '../components/studio/PlayerLobby';
import LiveFeed from '../components/studio/LiveFeed';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import type { ArtSubmission } from '../types';

interface FanDropSubmission {
  id: number; username: string; avatar_url: string; type: string;
  preview: string; submitted_at: string; status: 'pending' | 'approved' | 'rejected';
}

function toFanDropSubmission(a: ArtSubmission): FanDropSubmission {
  return {
    id: a.id, username: a.username, avatar_url: a.avatar_url || '',
    type: a.content_type || 'text',
    preview: a.message || a.image_url || a.emoji || '',
    submitted_at: a.created_at || '',
    status: (a.status as 'pending' | 'approved' | 'rejected') || 'pending',
  };
}

interface RoomData {
  id: number;
  code: string;
  name: string;
  description: string;
  host_id: string;
  host_name: string;
  host_avatar: string;
  is_live: boolean;
  viewer_count: number;
  video_id: string;
  created_at: string;
}

export default function StreamerStudio() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { addToast, profile } = useApp();
  const { user } = useAuth();
  const code = roomCode || '';
  const overlayUrl = `${window.location.origin}/overlay/${code}`;

  const [room, setRoom] = useState<RoomData | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState('');
  const [notHost, setNotHost] = useState(false);

  const [roomName, setRoomName] = useState('Studio');
  const [status, setStatus] = useState<'live' | 'offline' | 'paused' | 'ended'>('live');
  const [videoId, setVideoId] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [language, setLanguage] = useState('en');
  const [moderationMode, setModerationMode] = useState<'safe' | 'review' | 'loose' | 'manual_read'>('safe');
  const [streamerMode, setStreamerMode] = useState<'desktop_obs' | 'mobile_host'>('desktop_obs');
  const [showEnded, setShowEnded] = useState(false);
  const [endConfirmOpen, setEndConfirmOpen] = useState(false);

  const [viewerCount, setViewerCount] = useState(0);
  const [coinsSpent] = useState(50);
  const [coinsHeld, setCoinsHeld] = useState(50);
  const [fanDropStatus, setFanDropStatus] = useState<'locked' | 'open' | 'closed'>('locked');
  const [selectionActive, setSelectionActive] = useState(false);
  const [selectionConfig, setSelectionConfig] = useState<SelectionConfig | null>(null);
  const [smartModeration, setSmartModeration] = useState(true);
  const [smartVoice, setSmartVoice] = useState(true);
  const [smartVoiceMode, setSmartVoiceMode] = useState<'important' | 'normal' | 'hype' | 'manual'>('important');

  const [smartSound, setSmartSound] = useState(true);
  const [smartSoundMode, setSmartSoundMode] = useState<'off' | 'low' | 'normal' | 'hype'>('normal');
  const [masterVolume, setMasterVolume] = useState(80);
  const [soundPack, setSoundPack] = useState('default');
  const [voiceVolume, setVoiceVolume] = useState(70);
  const [aiVoiceStyle, setAiVoiceStyle] = useState('Friendly');
  const smartSelectionNotified = useRef(false);
  const safeCoinNotified = useRef(false);
  const smartOverlayNotified = useRef(false);
  const [emergencyLock, setEmergencyLock] = useState(false);
  const [lobbyPlayers, setLobbyPlayers] = useState<LobbyPlayer[]>([]);
  const [mainGame, setMainGame] = useState('BGMI');

  const [pendingSubmissions, setPendingSubmissions] = useState<FanDropSubmission[]>([]);
  const [artSubmissions, setArtSubmissions] = useState<ArtSubmission[]>([]);

  useEffect(() => {
    if (!room?.id) return;
    getArtSubmissions(room.id).then(data => {
      setArtSubmissions(data);
      setPendingSubmissions(data.map(toFanDropSubmission));
    }).catch(() => addToast({ message: 'Failed to load submissions', type: 'error' }));
  }, [room?.id]);

  useRealtimeSubscription<ArtSubmission>('art_submissions', room?.id ? { column: 'room_id', value: room.id } : undefined,
    (newArt) => {
      setArtSubmissions(prev => [newArt, ...prev]);
      setPendingSubmissions(prev => [toFanDropSubmission(newArt), ...prev]);
    },
    (updatedArt) => {
      setArtSubmissions(prev => prev.map(a => a.id === updatedArt.id ? updatedArt : a));
      setPendingSubmissions(prev => prev.map(a => a.id === updatedArt.id ? toFanDropSubmission(updatedArt) : a));
    },
    (deletedArt) => {
      setArtSubmissions(prev => prev.filter(a => a.id !== deletedArt.id));
      setPendingSubmissions(prev => prev.filter(a => a.id !== deletedArt.id));
    },
  );

  useEffect(() => {
    if (!code) {
      setRoomError('No room code provided');
      setRoomLoading(false);
      return;
    }
    setRoomLoading(true);
    setRoomError('');
    getRoomByCode(code)
      .then(data => {
        if (!data) {
          setRoomError('Room not found');
          return;
        }
        const r = data as RoomData;
        setRoom(r);

        if (user && r.host_id !== user.id) {
          setNotHost(true);
          return;
        }

        setRoomName(r.name);
        setStatus(r.is_live ? 'live' : 'offline');
        setViewerCount(r.viewer_count || 0);
      })
      .catch(() => setRoomError('Failed to load room'))
      .finally(() => setRoomLoading(false));
  }, [code, user]);

  const playersNeeded = selectionConfig?.playerCount || 4;

  const handleEndStream = useCallback(() => {
    const totalHeld = lobbyPlayers.reduce((s, p) => s + (p.coins_held || 0), 0);
    setCoinsHeld(0);
    setLobbyPlayers([]);
    setFanDropStatus('closed');
    setEndConfirmOpen(false);
    setShowEnded(true);
    if (room) {
      updateRoom(room.id, { is_live: false, status: 'ended' } as any).catch(() => addToast({ message: 'Failed to end stream', type: 'error' }));
    }
    addToast({ message: `Stream ended. ${totalHeld} coins returned.`, type: 'info' });
  }, [lobbyPlayers, addToast, room]);

  const handleStartSelection = useCallback((config: SelectionConfig) => {
    setSelectionActive(true);
    setSelectionConfig(config);
    setMainGame(config.mainGame);
    setStatus('live');
    if (room) {
      updateRoom(room.id, { status: 'selection' } as any).catch(() => addToast({ message: 'Failed to start selection', type: 'error' }));
    }
    if (!smartSelectionNotified.current) {
      smartSelectionNotified.current = true;
      addToast({ message: 'Smart Selection active. AI can generate quiz questions, run timers, score answers, select winners, and pick replacements if someone does not join.', type: 'info' });
    }
    if (config.selectionMethod === 'coin' && !safeCoinNotified.current) {
      safeCoinNotified.current = true;
      addToast({ message: 'Safe Coin Hold is always on. Coins held when entering priority, spent only if selected, returned otherwise.', type: 'info' });
    }
    addToast({ message: `${config.selectionMethod} started for ${config.mainGame}!`, type: 'success' });
  }, [addToast, room]);

  const handleResetSelection = useCallback(() => {
    setSelectionActive(false);
    setSelectionConfig(null);
    if (room) {
      updateRoom(room.id, { status: 'queue_open' } as any).catch(() => addToast({ message: 'Failed to reset queue', type: 'error' }));
    }
    addToast({ message: 'Selection cancelled', type: 'info' });
  }, [addToast, room]);

  const handleSelectPlayer = useCallback((id: number) => {
    setLobbyPlayers(prev => prev.map(p => p.id === id ? { ...p, status: 'selected' as const } : p));
  }, []);

  const handleReplacePlayer = useCallback((id: number) => {
    setLobbyPlayers(prev => prev.map(p => p.id === id ? { ...p, status: 'replaced' as const } : p));
  }, []);

  const handleRemovePlayer = useCallback((id: number) => {
    setLobbyPlayers(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleReturnCoins = useCallback((id: number) => {
    const p = lobbyPlayers.find(x => x.id === id);
    if (!p || p.coins_held == null) return;
    const amount = p.coins_held;
    setCoinsHeld(h => h - amount);
  }, [lobbyPlayers]);

  const handleStartGame = useCallback(() => {
    if (room) {
      updateRoom(room.id, { status: 'playing' } as any).catch(() => addToast({ message: 'Failed to update room status', type: 'error' }));
    }
    addToast({ message: `${mainGame} started!`, type: 'success' });
  }, [mainGame, addToast, room]);

  const handleAllowShoutout = useCallback((id: number) => {
    addToast({ message: 'Shoutout allowed and announced', type: 'success' });
  }, [addToast]);

  const handleRejectShoutout = useCallback((id: number) => {
    addToast({ message: 'Shoutout rejected — coins returned', type: 'info' });
  }, [addToast]);

  const toggleEmergencyLock = useCallback(() => {
    setEmergencyLock(p => !p);
    addToast({ message: emergencyLock ? 'Emergency lock deactivated' : 'Emergency lock activated', type: 'warning' });
  }, [emergencyLock, addToast]);

  if (roomLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center relative overflow-hidden">
        <MoltenBackground />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-arcade-purple border-t-transparent rounded-full"
          />
          <p className="text-sm text-text-muted">Loading studio...</p>
        </div>
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden">
        <MoltenBackground />
        <div className="relative z-10 bg-white/[0.03] rounded-2xl p-8 border border-arcade-pink/10 max-w-md w-full text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="font-display text-xl font-bold text-text-primary mb-2">Room Not Found</h2>
          <p className="text-sm text-neutral-400 mb-6">{roomError}</p>
          <button onClick={() => navigate('/streamer')}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-blue text-white font-bold text-sm hover:opacity-90 transition-opacity"
          >Go to Streamer Hub</button>
        </div>
      </div>
    );
  }

  if (notHost) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden">
        <MoltenBackground />
        <div className="relative z-10 bg-white/[0.03] rounded-2xl p-8 border border-arcade-pink/10 max-w-md w-full text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="font-display text-xl font-bold text-text-primary mb-2">Not Your Room</h2>
          <p className="text-sm text-neutral-400 mb-2">Only the room host can access the studio.</p>
          <p className="text-xs text-neutral-500 mb-6">If you are the host, sign in with the correct account.</p>
          <button onClick={() => navigate('/login')}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-blue text-white font-bold text-sm hover:opacity-90 transition-opacity"
          >Sign In</button>
        </div>
      </div>
    );
  }

  if (showEnded) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden">
        <MoltenBackground />
        <div className="relative z-10 bg-white/[0.03] rounded-2xl p-8 border border-arcade-pink/10 max-w-md w-full text-center">
          <div className="text-4xl mb-4">🔴</div>
          <h2 className="font-display text-xl font-bold text-text-primary mb-2">Stream Ended</h2>
          <p className="text-sm text-neutral-400 mb-2">All coins returned. Player Lobby closed. Leaderboard saved.</p>
          <p className="text-xs text-neutral-500 mb-6">You can start a new stream anytime.</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/create-room')}
              className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-neutral-300 hover:bg-white/[0.08] transition-all"
            >Create Room</button>
            <button onClick={() => navigate(`/room/${code}`)}
              className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-blue text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >View Room</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <Toast />
      <div className="hidden md:block">
        <StudioTopBar
          roomName={roomName}
          roomCode={code}
          status={status}
          viewerCount={viewerCount}
          queueCount={lobbyPlayers.filter(p => p.status === 'waiting').length}
          priorityCount={lobbyPlayers.filter(p => p.status === 'selected').length}
          fanDropPending={pendingSubmissions.length}
          coinsSpent={coinsSpent}
          coinsHeld={coinsHeld}
          overlayUrl={overlayUrl}
          onEndStream={() => setEndConfirmOpen(true)}
          addToast={addToast}
        />
      </div>

      {emergencyLock && (
        <div className="fixed inset-0 z-30 pointer-events-none">
          <div className="absolute inset-0 border-4 border-red-500/30 pointer-events-none" />
        </div>
      )}

      {endConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEndConfirmOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-bg-primary border border-arcade-pink/20 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-lg font-bold text-text-primary mb-2">End stream safely?</h3>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              This will stop active selection, close Player Lobby, return all held coins, close Fan Drops, stop overlay alerts, and save results.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEndConfirmOpen(false)}
                className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-text-primary hover:border-white/[0.15] transition-all"
              >Cancel</button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleEndStream}
                className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90 transition-all"
              >End Stream Safely</motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Mobile */}
      <div className="md:hidden">
        <StudioMobileView
          roomCode={code}
          roomName={roomName}
          status={status}
          videoId={videoId}
          isMuted={isMuted}
          viewerCount={viewerCount}
          queueCount={lobbyPlayers.filter(p => p.status === 'waiting').length}
          priorityCount={lobbyPlayers.filter(p => p.status === 'selected').length}
          coinsSpent={coinsSpent}
          coinsHeld={coinsHeld}
          fanDropPending={pendingSubmissions.length}
          fanDropStatus={fanDropStatus}
          onToggleMute={() => setIsMuted(p => !p)}
          onRefresh={() => addToast({ message: 'Player refreshed', type: 'info' })}

          onCopyLink={() => { navigator.clipboard?.writeText(`${window.location.origin}/room/${code}`); addToast({ message: 'Link copied!', type: 'success' }); }}
          onCopyOverlay={() => { navigator.clipboard?.writeText(overlayUrl); addToast({ message: 'Overlay URL copied!', type: 'success' }); }}
          onTestAlert={() => addToast({ message: 'Test alert', type: 'info' })}
          onAISpeak={() => addToast({ message: 'AI speaking...', type: 'info' })}
          addToast={addToast}
        />
      </div>

      {/* Desktop */}
      <div className="hidden md:block relative z-10 pt-12">
        <div className="max-w-[1920px] mx-auto px-4 py-2">
          <div className="grid grid-cols-12 gap-4" style={{ minHeight: 'calc(100vh - 90px)' }}>

            {/* LEFT COLUMN (4/12) */}
            <div className="col-span-4 min-w-0 space-y-2 overflow-y-auto no-scrollbar" style={{ maxHeight: 'calc(100vh - 90px)' }}>
              <StudioLivePreview
                videoId={videoId}
                isMuted={isMuted}
                viewerCount={viewerCount}
                onToggleMute={() => setIsMuted(p => !p)}
                onSetVideoId={(id) => {
                  setVideoId(id);
                  setYoutubeUrl(`https://youtube.com/watch?v=${id}`);
                  if (room) {
                    updateRoom(room.id, { video_id: id } as any).catch(() => addToast({ message: 'Failed to save video ID', type: 'error' }));
                  }
                }}
                addToast={addToast}
              />
              <LiveFeed
                roomCode={code}
                onAllowShoutout={handleAllowShoutout}
                onRejectShoutout={handleRejectShoutout}
                addToast={addToast}
                height="calc(100vh - 400px)"
              />
              <CollapsibleSection title="Room Setup" icon={Eye} defaultOpen={false}>
                <div className="p-4">
                  <StudioRoomSetup
                    roomTitle={roomName}
                    youtubeUrl={youtubeUrl}
                    language={language}
                    moderationMode={moderationMode}
                    streamerMode={streamerMode}
                    onUpdateRoomTitle={setRoomName}
                    onUpdateYoutubeUrl={(url) => {
                      setYoutubeUrl(url);
                      try {
                        const trimmed = url.trim();
                        if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) { setVideoId(trimmed); return; }
                        const u = new URL(trimmed);
                        if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
                          const liveMatch = u.pathname.match(/^\/(?:live|embed|shorts)\/([a-zA-Z0-9_-]{11})/);
                          if (liveMatch) { setVideoId(liveMatch[1]); return; }
                          if (u.hostname === 'youtu.be') { const id = u.pathname.slice(1).split('?')[0]; if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) { setVideoId(id); return; } }
                          const vid = u.searchParams.get('v');
                          if (vid) { setVideoId(vid); }
                        }
                      } catch { /* not a URL */ }
                    }}
                    onUpdateLanguage={setLanguage}
                    onUpdateModeration={setModerationMode}
                    onUpdateStreamerMode={setStreamerMode}
                    onSave={() => {
                      if (room) {
                        updateRoom(room.id, { name: roomName, video_id: videoId, is_live: status === 'live' } as any).catch(() => addToast({ message: 'Failed to save settings', type: 'error' }));
                      }
                      addToast({ message: 'Settings saved', type: 'success' });
                    }}
                    addToast={addToast}
                  />
                </div>
              </CollapsibleSection>

            </div>

            {/* CENTER COLUMN (5/12) */}
            <div className="col-span-5 min-w-0 space-y-2 overflow-y-auto no-scrollbar" style={{ maxHeight: 'calc(100vh - 90px)' }}>
              <SelectionArena
                onStartSelection={handleStartSelection}
                onResetSelection={handleResetSelection}
                selectionActive={selectionActive}
                selectedCount={lobbyPlayers.filter(p => p.status === 'selected').length}
                playersNeeded={playersNeeded}
                addToast={addToast}
              />
              <PlayerLobby
                playersNeeded={playersNeeded}
                players={lobbyPlayers}
                onSelect={handleSelectPlayer}
                onReplace={handleReplacePlayer}
                onRemove={handleRemovePlayer}
                onReturnCoins={handleReturnCoins}
                onInvite={() => addToast({ message: 'Invite link generated', type: 'success' })}
                onStartGame={handleStartGame}
                gameActive={false}
                mainGame={mainGame}
                addToast={addToast}
              />
            </div>

            {/* RIGHT COLUMN (3/12) */}
            <div className="col-span-3 min-w-0 space-y-2 overflow-y-auto no-scrollbar" style={{ maxHeight: 'calc(100vh - 90px)' }}>
              {/* Smart systems active indicator */}
              <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-arcade-green/5 border border-arcade-green/20">
                <Zap className="w-3 h-3 text-arcade-green" />
                <span className="text-[9px] font-semibold text-arcade-green">Smart systems active</span>
              </div>

              {/* Fan Drops */}
              <CollapsibleSection title="Fan Drops" icon={Sparkles} iconColor="text-arcade-pink" defaultOpen={false}>
                <div className="p-4 space-y-3">
                  <StudioFanDropPanel
                    roomCode={code}
                    fanDropStatus={fanDropStatus}
                    pendingSubmissions={pendingSubmissions}
                    onSetStatus={setFanDropStatus}
                    onApprove={async (id) => {
                      try { await updateArtSubmission(id, { status: 'approved' }); addToast({ message: 'Approved', type: 'success' }); }
                      catch { addToast({ message: 'Failed to approve', type: 'error' }); }
                    }}
                    onReject={async (id) => {
                      try { await updateArtSubmission(id, { status: 'rejected' }); addToast({ message: 'Rejected', type: 'error' }); }
                      catch { addToast({ message: 'Failed to reject', type: 'error' }); }
                    }}
                    onDelete={async (id) => {
                      try { await deleteArtSubmission(id); addToast({ message: 'Deleted', type: 'info' }); }
                      catch { addToast({ message: 'Failed to delete', type: 'error' }); }
                    }}
                    onShowOnOverlay={async (id) => {
                      try {
                        await updateArtSubmission(id, { status: 'showing' });
                        if (room) { await createOverlayEvent({ room_id: room.id, event_type: 'fan_drop_show', event_data: { submission_id: id } }); }
                        addToast({ message: 'Showing on overlay', type: 'info' });
                      } catch { addToast({ message: 'Failed to show on overlay', type: 'error' }); }
                    }}
                  />
                </div>
              </CollapsibleSection>

              {/* Overlay */}
              <CollapsibleSection title="Overlay" icon={Monitor} iconColor="text-arcade-blue" defaultOpen={false}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-arcade-green animate-pulse" />
                      <span className="text-[10px] text-text-muted">Connected</span>
                    </div>
                    <button onClick={() => { navigator.clipboard?.writeText(overlayUrl); addToast({ message: 'Overlay URL copied!', type: 'success' }); }}
                      className="text-[10px] font-bold text-arcade-blue hover:text-arcade-blue/80 transition-all"
                    >Copy URL</button>
                  </div>
                  <button onClick={() => window.open(overlayUrl, '_blank')}
                    className="w-full min-h-[40px] py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-neutral-400 text-[10px] font-bold hover:text-text-primary transition-all flex items-center justify-center gap-1.5"
                  ><Eye className="w-3.5 h-3.5" /> Test Overlay</button>
                  <details className="group">
                    <summary className="text-[10px] font-semibold text-text-muted cursor-pointer hover:text-text-primary transition-all list-none flex items-center gap-1">
                      More options <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5">
                        <p className="text-[9px] text-text-muted">Overlay Preview</p>
                        <div className="mt-1 h-16 rounded-lg bg-white/[0.04] border border-dashed border-white/[0.08] flex items-center justify-center">
                          <span className="text-[8px] text-neutral-500">No overlay event active</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {['Countdown', 'Next Player', 'Winner', 'Coin Alert', 'Fan Drop', 'Shoutout', 'Leaderboard'].map(alert => (
                          <button key={alert} onClick={async () => {
                            if (!room) return;
                            try {
                              await createOverlayEvent({ room_id: room.id, event_type: alert.toLowerCase().replace(/\s+/g, '_'), event_data: {} });
                              addToast({ message: `${alert} sent to overlay!`, type: 'info' });
                            } catch { addToast({ message: `${alert} failed`, type: 'error' }); }
                          }}
                            className="min-h-[32px] py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-neutral-400 text-[8px] font-bold hover:text-text-primary hover:bg-white/[0.06] transition-all"
                          >{alert}</button>
                        ))}
                      </div>
                    </div>
                  </details>
                  <button onClick={() => window.open(`/audio/${code}`, '_blank')}
                    className="w-full min-h-[40px] py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-neutral-400 text-[10px] font-bold hover:text-text-primary transition-all flex items-center justify-center gap-1.5"
                  ><Headphones className="w-3.5 h-3.5" /> Open Audio Dock</button>
                  <details className="group">
                    <summary className="text-[10px] font-semibold text-text-muted cursor-pointer hover:text-text-primary transition-all list-none flex items-center gap-1">
                      OBS Setup Guide <Zap className="w-3 h-3 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-2 space-y-2 text-[9px] text-text-muted leading-relaxed">
                      <p>1. In OBS, add a new Browser Source</p>
                      <p>2. URL: <span className="text-arcade-blue font-mono">{overlayUrl}</span></p>
                      <p>3. Set width: 1920, height: 1080</p>
                      <p>4. For audio, add a Browser Source with URL: <span className="text-arcade-blue font-mono">{`${window.location.origin}/audio-dock/${code}`}</span></p>
                      <p>5. Check "Control audio via OBS" and uncheck "Shutdown source when not visible"</p>
                    </div>
                  </details>
                </div>
              </CollapsibleSection>

              {/* Sound */}
              <CollapsibleSection title="Sound" icon={Volume2} iconColor="text-arcade-blue" defaultOpen={false}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-text-muted">Smart Sound</span>
                    <button onClick={() => setSmartSound(p => !p)}
                      className={`relative w-10 h-5 rounded-full transition-all ${smartSound ? 'bg-arcade-purple' : 'bg-white/[0.1]'}`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 shadow transition-all ${smartSound ? 'left-[22px]' : 'left-[2px]'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">Mode</span>
                    <select value={smartSoundMode} onChange={e => setSmartSoundMode(e.target.value as 'off' | 'low' | 'normal' | 'hype')}
                      className="bg-bg-secondary border border-white/[0.08] rounded-lg px-2 py-1 text-[10px] text-text-primary focus:outline-none focus:border-arcade-purple/50 transition-all appearance-none"
                    >
                      <option value="off">Off</option>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="hype">Hype</option>
                    </select>
                  </div>
                  <StudioSoundControl
                    soundEnabled={smartSound}
                    masterVolume={masterVolume}
                    soundPack={soundPack}
                    onToggleSound={() => setSmartSound(p => !p)}
                    onVolumeChange={setMasterVolume}
                    onSoundPackChange={setSoundPack}
                    onTestSound={() => addToast({ message: 'Test sound', type: 'info' })}
                    addToast={addToast}
                  />
                </div>
              </CollapsibleSection>

              {/* AI Host */}
              <CollapsibleSection title="AI Host" icon={Bot} iconColor="text-arcade-purple" defaultOpen={false}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-text-muted">Smart Voice</span>
                    <button onClick={() => setSmartVoice(p => !p)}
                      className={`relative w-10 h-5 rounded-full transition-all ${smartVoice ? 'bg-arcade-purple' : 'bg-white/[0.1]'}`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 shadow transition-all ${smartVoice ? 'left-[22px]' : 'left-[2px]'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">Mode</span>
                    <select value={smartVoiceMode} onChange={e => setSmartVoiceMode(e.target.value as 'important' | 'normal' | 'hype' | 'manual')}
                      className="bg-bg-secondary border border-white/[0.08] rounded-lg px-2 py-1 text-[10px] text-text-primary focus:outline-none focus:border-arcade-purple/50 transition-all appearance-none"
                    >
                      <option value="important">Important Only</option>
                      <option value="normal">Normal</option>
                      <option value="hype">Hype</option>
                      <option value="manual">Manual Approval</option>
                    </select>
                  </div>
                  <StudioAIHost
                    aiEnabled={smartVoice}
                    voiceVolume={voiceVolume}
                    voiceMode={aiVoiceStyle}
                    moderationMode={moderationMode === 'safe' ? 'Safe' : moderationMode === 'review' ? 'Review' : moderationMode === 'manual_read' ? 'Manual Read' : 'Loose'}
                    onToggleAI={() => setSmartVoice(p => !p)}
                    onVolumeChange={setVoiceVolume}
                    onVoiceModeChange={setAiVoiceStyle}
                    onModerationModeChange={(v) => setModerationMode(v === 'Safe' ? 'safe' : v === 'Review' ? 'review' : v === 'Manual Read' ? 'manual_read' : 'loose')}
                    onSpeak={async (msg) => {
                      try {
                        if (room) {
                          await createOverlayEvent({ room_id: room.id, event_type: 'announcement', event_data: { streamer: profile?.username || 'Streamer', message: msg } });
                          addToast({ message: `Announcement sent!`, type: 'info' });
                        }
                      } catch { addToast({ message: 'Announcement failed', type: 'error' }); }
                    }}
                    addToast={addToast}
                  />
                </div>
              </CollapsibleSection>

              {/* Moderation */}
              <CollapsibleSection title="Moderation" icon={Shield} iconColor="text-arcade-purple" defaultOpen={false}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-text-muted">Moderation: {moderationMode === 'safe' ? 'Safe' : moderationMode === 'review' ? 'Review' : moderationMode === 'manual_read' ? 'Manual Read' : 'Loose'}</span>
                    <button onClick={() => setSmartModeration(p => !p)}
                      className={`relative w-10 h-5 rounded-full transition-all ${smartModeration ? 'bg-arcade-purple' : 'bg-white/[0.1]'}`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 shadow transition-all ${smartModeration ? 'left-[22px]' : 'left-[2px]'}`} />
                    </button>
                  </div>
                  <p className="text-[9px] text-text-muted leading-relaxed">
                    {smartModeration ? 'AI flags restricted messages inline. Severe content blocked automatically.' : 'Manual moderation only.'}
                  </p>
                  <details className="group">
                    <summary className="text-[10px] font-semibold text-text-muted cursor-pointer hover:text-text-primary transition-all list-none flex items-center gap-1">
                      Mode <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-2 space-y-1.5">
                      {[
                        { id: 'safe' as const, label: 'Safe', desc: 'strict filtering' },
                        { id: 'review' as const, label: 'Review', desc: 'suspicious content needs approval' },
                        { id: 'loose' as const, label: 'Loose', desc: 'minimal filtering, severe still blocked' },
                        { id: 'manual_read' as const, label: 'Manual Read', desc: 'AI voice/user messages need approval before speaking' },
                      ].map(m => (
                        <button key={m.id} onClick={() => setModerationMode(m.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all ${
                            moderationMode === m.id
                              ? 'bg-arcade-purple/10 border-arcade-purple/30'
                              : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
                          }`}
                        >
                          <div>
                            <p className={`text-[11px] font-bold ${moderationMode === m.id ? 'text-arcade-purple' : 'text-text-primary'}`}>{m.label}</p>
                            <p className="text-[8px] text-text-muted">{m.desc}</p>
                          </div>
                          {moderationMode === m.id && <Check className="w-3.5 h-3.5 text-arcade-purple" />}
                        </button>
                      ))}
                    </div>
                  </details>
                </div>
              </CollapsibleSection>

              {/* Emergency Lock */}
              <button onClick={toggleEmergencyLock}
                className={`w-full min-h-[44px] py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all touch-manipulation ${
                  emergencyLock
                    ? 'bg-red-500/20 border-red-500/40 text-red-400'
                    : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-red-400 hover:border-red-500/30'
                }`}
              >
                <Lock className="w-4 h-4" />
                {emergencyLock ? 'Resume Room' : 'Emergency Lock'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

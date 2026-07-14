import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Volume2, VolumeX, Gamepad2, MessageSquare, Trophy, Coins, Hash, Share2, Heart, Play, Shield, ListOrdered, Sparkles, Clock, BadgeCheck, X, Copy, Sun, Moon, ArrowDown, Send, Star, Eye, Crown, Bot, Smartphone, UserPlus, Mic, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useLivePlayer } from '../contexts/LivePlayerContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { getRoomByCode, getChatMessages, sendChatMessage, createRoom, followUser, unfollowUser, checkFollowStatus, likeRoom, unlikeRoom, checkRoomLiked, joinQueue, leaveQueue } from '../lib/api';
import MoltenBackground from '../components/MoltenBackground';
import Navbar from '../components/Navbar';
import MobileHeader from '../components/MobileHeader';
import MobileNav from '../components/MobileNav';
import Toast from '../components/Toast';
import YouTubePlayer from '../components/YouTubePlayer';
import Leaderboard from '../components/Leaderboard';
import { Skeleton, CardSkeleton } from '../components/Skeleton';

import type { RoomData, ChatMessage, Profile } from '../types';
import type { User } from '@supabase/supabase-js';
import QueuePanel from '../components/QueuePanel';
import GameArena from '../components/GameArena';
import FanDropRoom from '../components/FanDropRoom';
import { speakSuperChat, ttsLanguages, voiceStyles } from '../lib/ttsProxy';

function hashId(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i), h |= 0;
  return Math.abs(h) + 1;
}

const roomStatuses = [
  { id: 'queue_open', label: 'Queue Open', icon: '📋', desc: 'Join the queue to play', color: 'text-arcade-blue', bg: 'bg-arcade-blue/10', border: 'border-arcade-blue/30' },
  { id: 'quiz_active', label: 'Quiz Active', icon: '🎮', desc: 'Answer the quiz question', color: 'text-arcade-purple', bg: 'bg-arcade-purple/10', border: 'border-arcade-purple/30' },
  { id: 'guess_active', label: 'Guess Number', icon: '🎯', desc: 'Guess the number 1-100', color: 'text-arcade-pink', bg: 'bg-arcade-pink/10', border: 'border-arcade-pink/30' },
  { id: 'fastest_active', label: 'Button Mash', icon: '⚡', desc: 'Type to win the round', color: 'text-arcade-purple', bg: 'bg-arcade-purple/10', border: 'border-arcade-purple/30' },
  { id: 'art_review', label: 'Art Review', icon: '🎨', desc: 'Streamer is reviewing art', color: 'text-arcade-blue', bg: 'bg-arcade-blue/10', border: 'border-arcade-blue/30' },
  { id: 'winner_reveal', label: 'Winner Reveal', icon: '🏆', desc: 'Winner being announced!', color: 'text-arcade-green', bg: 'bg-arcade-green/10', border: 'border-arcade-green/30' },
  { id: 'countdown', label: 'Countdown', icon: '⏰', desc: 'Next round starting soon', color: 'text-arcade-purple', bg: 'bg-arcade-purple/10', border: 'border-arcade-purple/30' },
  { id: 'paused', label: 'Paused', icon: '⏸️', desc: 'Stream is on break', color: 'text-neutral-400', bg: 'bg-neutral-500/10', border: 'border-neutral-500/30' },
  { id: 'ended', label: 'Ended', icon: '🔴', desc: 'Thanks for watching!', color: 'text-arcade-pink', bg: 'bg-arcade-pink/15', border: 'border-arcade-pink/40' },
];

const fanDropBadgeIcon = '📥';

const rightPanelTabs = [
  { id: 'games', label: 'Play', icon: Gamepad2 },
  { id: 'queue', label: 'Queue', icon: ListOrdered },
  { id: 'rank', label: 'Rank', icon: Trophy },
  { id: 'art', label: 'Fan Drop', icon: Sparkles },
];

export default function LiveRoomPage() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const { addToast, profile, refreshProfile } = useApp();
  const { startWatching } = useLivePlayer();
  const [room, setRoom] = useState<RoomData | null>(null);
  const videoId = room?.video_id || '';
  const [tab, setTab] = useState('games');
  const [mobileTab, setMobileTab] = useState('stream');
  const [countdown, setCountdown] = useState(45);
  const [likeCount, setLikeCount] = useState(0);
  const roomStatus = room?.status || 'queue_open';

  const [activities] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!roomCode) return;
    let cancelled = false;
    (async () => {
      try {
        const existing = await getRoomByCode(roomCode);
        if (existing?.id) { if (!cancelled) setRoom(existing); return; }
      } catch { /* not found */ }
      if (cancelled) return;
      if (user) {
        try {
          const created = await createRoom(`Room ${roomCode}`, '', user.id, roomCode);
          if (!cancelled) setRoom(created);
          return;
        } catch { /* create failed */ }
      }
      if (!cancelled) {
        setRoom({ id: -(hashId(roomCode)), code: roomCode, name: 'Live Room', host_id: '', host_name: 'Streamer', host_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=streamer', is_live: true, viewer_count: 0, video_id: '', status: 'queue_open' });
        addToast({ message: 'Room not found — showing demo', type: 'info' });
      }
    })();
    return () => { cancelled = true; };
  }, [roomCode, user]);

  useEffect(() => {
    const interval = setInterval(() => setCountdown(prev => prev <= 1 ? 60 : prev - 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll room data for status updates
  useEffect(() => {
    if (!roomCode) return;
    const i = setInterval(() => {
      getRoomByCode(roomCode).then(data => {
        if (data?.id) setRoom(data);
      }).catch(() => {});
    }, 10000);
    return () => clearInterval(i);
  }, [roomCode]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const roomId = room?.id ?? undefined;
  const currentStatus = roomStatuses.find(s => s.id === roomStatus);
  const displayName = profile?.username || user?.email?.split('@')[0];
  const avatarUrl = profile?.avatar_url || (user ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}` : null);
  const viewerCoins = profile?.coins ?? 50;
  const viewerPoints = profile?.points ?? 0;

  const streamerName = room?.host_name || 'Simp';
  const streamerAvatar = room?.host_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=streamer';
  const streamerVerified = true;
  const viewerCount = useMemo(() => room?.viewer_count ?? Math.floor(Math.random() * 500) + 100, [room?.viewer_count]);
  const subscriberCount = '12.4K';
  const streamStarted = '2h ago';
  const streamTitle = 'GRIND FOR BGMS | SIMP IS LIVE 🍑';
  const isHost = user?.id === room?.host_id;

  useEffect(() => {
    if (roomCode && videoId) startWatching(roomCode, videoId, streamerName);
  }, [roomCode, videoId, streamerName, startWatching]);

  if (!room) return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <div className="hidden md:block"><Navbar /></div>
      <div className="md:hidden"><MobileHeader /></div>
      <div className="hidden md:block relative z-10 pt-20 px-4 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7 xl:col-span-8 space-y-4">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <CardSkeleton />
          </div>
          <div className="col-span-5 xl:col-span-4">
            <CardSkeleton />
          </div>
        </div>
      </div>
      <div className="md:hidden relative z-10 pt-14 px-3 space-y-3">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <CardSkeleton />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <div className="hidden md:block"><Navbar /></div>
      <div className="md:hidden"><MobileHeader /></div>
      <Toast />
      <div className="hidden md:block relative z-10 pt-20 px-4 max-w-[1600px] mx-auto">
        <DesktopContent roomCode={roomCode} room={room} tab={tab} setTab={setTab} countdown={countdown} formatTime={formatTime} roomId={roomId} user={user} addToast={addToast} likeCount={likeCount} setLikeCount={setLikeCount} roomStatus={roomStatus} currentStatus={currentStatus} viewerCoins={viewerCoins} viewerPoints={viewerPoints} streamerName={streamerName} streamerAvatar={streamerAvatar} streamerVerified={streamerVerified} viewerCount={viewerCount} subscriberCount={subscriberCount} streamStarted={streamStarted} streamTitle={streamTitle} videoId={videoId} profile={profile} refreshProfile={refreshProfile} isHost={isHost} />
      </div>
      <div className="md:hidden relative z-10 pt-14 max-w-md mx-auto touch-manipulation" style={{ height: 'calc(100vh - 56px - 80px)', overflow: 'hidden' }}>
        <MobileContent roomCode={roomCode} room={room} mobileTab={mobileTab} setMobileTab={setMobileTab} roomId={roomId} user={user} addToast={addToast} likeCount={likeCount} setLikeCount={setLikeCount} roomStatus={roomStatus} currentStatus={currentStatus} viewerCoins={viewerCoins} viewerPoints={viewerPoints} streamerName={streamerName} streamerAvatar={streamerAvatar} streamerVerified={streamerVerified} viewerCount={viewerCount} subscriberCount={subscriberCount} streamStarted={streamStarted} streamTitle={streamTitle} videoId={videoId} profile={profile} refreshProfile={refreshProfile} isHost={isHost} />
      </div>
      <div className="md:hidden"><MobileNav activeTab={mobileTab} onTabChange={setMobileTab} /></div>
    </div>
  );
}

type BaseContentProps = {
  roomCode: string | undefined; room: RoomData | null;
  countdown?: number; formatTime?: (s: number) => string;
  roomId: number | undefined; user: User | null; addToast: (t: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
  likeCount: number; setLikeCount: (n: number) => void;
  roomStatus: string; currentStatus: { id: string; label: string; icon: string; desc: string; color: string; bg: string; border: string } | undefined;
  viewerCoins: number; viewerPoints: number;
  streamerName: string; streamerAvatar: string; streamerVerified: boolean;
  viewerCount: number; subscriberCount: string; streamStarted: string;
  streamTitle: string;

  videoId: string; profile: Profile | null; refreshProfile: () => Promise<void>; isHost: boolean;
};

type DesktopContentProps = BaseContentProps & { tab: string; setTab: (t: string) => void };
type MobileContentProps = BaseContentProps & { mobileTab: string; setMobileTab: (t: string) => void };


function DesktopContent({ roomCode, room, tab, setTab, countdown, formatTime, roomId, user, addToast, likeCount, setLikeCount, roomStatus, currentStatus, viewerCoins, viewerPoints, streamerName, streamerAvatar, streamerVerified, viewerCount, subscriberCount, streamStarted, streamTitle, videoId, profile, refreshProfile, isHost }: DesktopContentProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={scrollRef} className="h-[calc(100vh-72px)] overflow-y-auto no-scrollbar">
      <div className="grid grid-cols-12 gap-4 px-4 pt-4 pb-4">
        <div className="col-span-7 xl:col-span-8 space-y-3 pb-4 flex flex-col">
          <YouTubePlayer videoId={videoId} />
          <StreamerProfile user={user} hostId={room?.host_id} roomId={roomId} roomCode={roomCode} streamerName={streamerName} streamerAvatar={streamerAvatar} streamerVerified={streamerVerified} subscriberCount={subscriberCount} viewerCount={viewerCount} streamStarted={streamStarted} streamTitle={streamTitle} isHost={isHost} likes={(room as any)?.likes ?? 0} />
              <QueueBanner roomStatus={roomStatus} roomCode={roomCode} roomId={roomId} user={user} profile={profile} addToast={addToast} />
          <ViewerFeed roomId={roomId} user={user} addToast={addToast} profile={profile} refreshProfile={refreshProfile} />
        </div>
        <div className="col-span-5 xl:col-span-4">
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] flex flex-col h-full min-h-[350px]">
            <div className="flex items-center gap-1.5 p-2 border-b border-white/[0.06] overflow-x-auto no-scrollbar">
              {rightPanelTabs.map(t => (
                <TabButton key={t.id} id={t.id} label={t.id === 'art' ? `Fan Drop ${fanDropBadgeIcon}` : t.label} icon={t.icon} active={tab === t.id} onClick={() => setTab(t.id)} />
              ))}
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <AnimatePresence mode="wait">
                {tab === 'games' && (
                  <motion.div key="games" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="h-full">
                    <GameArena roomId={roomId} />
                  </motion.div>
                )}
                {tab === 'queue' && (
                  <motion.div key="queue" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="h-full">
                    <QueuePanel roomId={roomId} />
                  </motion.div>
                )}
                {tab === 'rank' && (
                  <motion.div key="rank" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                    <Leaderboard />
                  </motion.div>
                )}
                {tab === 'art' && (
                  <motion.div key="art" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="h-full">
                    <FanDropRoom roomId={roomId} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function StreamerProfile({ user, hostId, roomId, streamerName, streamerAvatar, streamerVerified, subscriberCount, viewerCount, streamStarted, streamTitle, roomCode, isHost, likes: initialLikes }: {
  user: User | null; hostId: string | undefined; roomId: number | undefined;
  streamerName: string; streamerAvatar: string; streamerVerified: boolean;
  subscriberCount: string; viewerCount: number; streamStarted: string;
  streamTitle: string; roomCode: string | undefined; isHost: boolean; likes: number;
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [qrOpen, setQrOpen] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useApp();
  const roomUrl = `${window.location.origin}/room/${roomCode}`;
  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(roomUrl)}`;

  useEffect(() => {
    if (user && hostId && user.id !== hostId) {
      checkFollowStatus(user.id, hostId).then(setIsFollowing).catch(() => {});
    }
  }, [user, hostId]);

  useEffect(() => {
    if (user && roomId && roomId > 0) {
      checkRoomLiked(roomId, user.id).then(setLiked).catch(() => {});
    }
  }, [user, roomId]);

  const handleFollow = async () => {
    if (!user || !hostId) { addToast({ message: 'Sign in to follow', type: 'error' }); return; }
    if (isFollowing) {
      await unfollowUser(user.id, hostId);
      setIsFollowing(false);
      addToast({ message: 'Unfollowed', type: 'success' });
    } else {
      await followUser(user.id, hostId);
      setIsFollowing(true);
      addToast({ message: `Following ${streamerName}`, type: 'success' });
    }
  };

  const handleLike = async () => {
    if (!user || !roomId || roomId < 0) { addToast({ message: 'Sign in to like', type: 'error' }); return; }
    if (liked) {
      const n = await unlikeRoom(roomId, user.id);
      setLikes(n);
      setLiked(false);
    } else {
      const n = await likeRoom(roomId, user.id);
      setLikes(n);
      setLiked(true);
    }
  };

  return (
    <>
      <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/[0.06]">
        <div className="flex items-center gap-3">
          <img src={streamerAvatar} alt={streamerName} className="w-10 h-10 rounded-full border-2 border-arcade-purple/30 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-text-primary truncate">{streamerName}</span>
              {streamerVerified && <BadgeCheck className="w-4 h-4 text-arcade-blue shrink-0" />}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-neutral-400 flex-wrap">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{subscriberCount}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-neutral-600" />
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{viewerCount}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-neutral-600" />
              <span><Clock className="w-3 h-3 inline" /> {streamStarted}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={handleLike}
              className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border transition-all ${liked ? 'bg-arcade-pink/20 border-arcade-pink/30 text-arcade-pink' : 'bg-white/[0.04] border-white/[0.08] text-neutral-400 hover:text-arcade-pink hover:border-arcade-pink/30'}`}
              title="Like this stream"
            ><Heart className={`w-3.5 h-3.5 ${liked ? 'fill-arcade-pink' : ''}`} /></button>
            {isHost && (
              <button onClick={() => navigate(`/studio/${roomCode}`)}
                className="min-h-[36px] px-3 py-1.5 rounded-lg font-bold text-[10px] bg-arcade-pink/20 text-arcade-pink border border-arcade-pink/30 hover:bg-arcade-pink/30 transition-all"
              >Studio</button>
            )}
            <button onClick={() => { setQrOpen(true); }}
              aria-label="Share room"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-arcade-blue hover:border-arcade-blue/30 transition-all"
            ><Share2 className="w-3.5 h-3.5" /></button>
            <button onClick={handleFollow}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg font-bold text-[10px] active:scale-[0.97] transition-all duration-100 touch-manipulation ${isFollowing ? 'bg-arcade-pink/20 text-arcade-pink border border-arcade-pink/30' : 'bg-gradient-to-r from-arcade-purple to-arcade-blue text-white hover:opacity-90'}`}
            >{isFollowing ? 'Following' : 'Follow'}</button>
          </div>
        </div>
      </div>

      {/* QR Share Modal */}
      <AnimatePresence>
        {qrOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setQrOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="relative bg-bg-primary border border-arcade-blue/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
              <button onClick={() => setQrOpen(false)}
                aria-label="Close QR code"
                className="absolute top-3 right-3 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-neutral-400 hover:text-text-primary hover:bg-white/[0.04] transition-all">
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-bold text-text-primary mb-1">Share this room</h3>
              <p className="text-xs text-neutral-400 mb-4">Scan or share link with friends</p>
              <div className="flex justify-center mb-3">
                <img src={qrImg} alt="QR" className="w-40 h-40 rounded-xl bg-white p-1.5"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div className="flex items-center justify-center gap-1.5 mb-4">
                <span className="text-[10px] text-neutral-500">Room code:</span>
                <span className="text-sm font-black text-arcade-purple tracking-widest">@{roomCode}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard?.writeText(roomUrl); addToast({ message: 'Link copied!', type: 'success' }); }}
                  className="flex-1 min-h-[44px] rounded-xl bg-white/[0.05] border border-white/[0.08] text-neutral-300 text-xs font-bold hover:text-text-primary transition-all flex items-center justify-center gap-1.5"
                ><Copy className="w-3.5 h-3.5" /> Copy Link</button>
                <button onClick={async () => { if (navigator.share) { try { await navigator.share({ title: streamTitle, text: `Join ${streamerName} live!`, url: roomUrl }); } catch { console.warn('Share cancelled'); } } else { navigator.clipboard?.writeText(roomUrl); addToast({ message: 'Link copied!', type: 'success' }); } }}
                  className="flex-1 min-h-[44px] rounded-xl bg-gradient-to-r from-arcade-purple/20 to-arcade-blue/20 border border-arcade-purple/30 text-arcade-purple text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                ><Share2 className="w-3.5 h-3.5" /> Share</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



function TabButton({ id, label, icon: Icon, active, onClick }: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      aria-label={`${label} tab`}
      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 min-h-[44px] ${
        active
          ? 'bg-gradient-to-r from-arcade-purple/20 to-arcade-blue/10 text-arcade-blue border border-arcade-blue/25'
          : 'text-neutral-400 hover:text-text-primary hover:bg-white/[0.03] border border-transparent'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
      {active && (
        <motion.div layoutId="tabGlow" className="absolute inset-0 rounded-xl bg-gradient-to-r from-arcade-blue/5 to-transparent -z-10" />
      )}
    </button>
  );
}

function MobileContent({ roomCode, room, mobileTab, roomId, user, addToast, likeCount, setLikeCount, roomStatus, currentStatus, viewerCoins, viewerPoints, streamerName, streamerAvatar, streamerVerified, viewerCount, subscriberCount, streamStarted, streamTitle, videoId, profile, refreshProfile, isHost }: MobileContentProps) {
  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="sticky top-0 z-10 bg-bg-primary">
        <YouTubePlayer videoId={videoId} />
      </div>
      <div className="px-3 pb-16">
        <AnimatePresence mode="wait">
          {mobileTab === 'stream' && (
            <motion.div key="stream" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 pb-4">
              <StreamerProfileMobile user={user} hostId={room?.host_id} roomId={roomId} roomCode={roomCode} streamerName={streamerName} streamerAvatar={streamerAvatar} streamerVerified={streamerVerified} subscriberCount={subscriberCount} viewerCount={viewerCount} streamStarted={streamStarted} streamTitle={streamTitle} isHost={isHost} likes={(room as any)?.likes ?? 0} />
          <QueueBanner roomStatus={roomStatus} roomCode={roomCode} roomId={roomId} user={user} profile={profile} addToast={addToast} />
              <ViewerFeed roomId={roomId} user={user} addToast={addToast} profile={profile} refreshProfile={refreshProfile} />
            </motion.div>
          )}
          {mobileTab === 'queue' && (
            <motion.div key="queue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                  <span className="text-lg">⏳</span>
                  <h3 className="font-semibold text-text-primary text-sm">Queue</h3>
                  <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg bg-arcade-blue/10 border border-arcade-blue/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-arcade-green animate-pulse" />
                    <span className="text-[10px] font-semibold text-arcade-blue">0 waiting</span>
                  </div>
                </div>
                <QueuePanel roomId={roomId} />
              </div>
            </motion.div>
          )}
          {mobileTab === 'games' && (
            <motion.div key="games" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GameArena roomId={roomId} />
            </motion.div>
          )}
          {mobileTab === 'art' && (
            <motion.div key="art" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FanDropRoom roomId={roomId} />
            </motion.div>
          )}
          {mobileTab === 'rank' && (
            <motion.div key="rank" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Leaderboard />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

function StreamerProfileMobile({ user, hostId, roomId, streamerName, streamerAvatar, streamerVerified, subscriberCount, viewerCount, streamStarted, streamTitle, roomCode, isHost, likes: initialLikes }: {
  user: User | null; hostId: string | undefined; roomId: number | undefined;
  streamerName: string; streamerAvatar: string; streamerVerified: boolean;
  subscriberCount: string; viewerCount: number; streamStarted: string;
  streamTitle: string; roomCode: string | undefined; isHost: boolean; likes: number;
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [qrOpen, setQrOpen] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useApp();
  const roomUrl = `${window.location.origin}/room/${roomCode}`;
  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(roomUrl)}`;

  useEffect(() => {
    if (user && hostId && user.id !== hostId) {
      checkFollowStatus(user.id, hostId).then(setIsFollowing).catch(() => {});
    }
  }, [user, hostId]);

  useEffect(() => {
    if (user && roomId && roomId > 0) {
      checkRoomLiked(roomId, user.id).then(setLiked).catch(() => {});
    }
  }, [user, roomId]);

  const handleFollow = async () => {
    if (!user || !hostId) { addToast({ message: 'Sign in to follow', type: 'error' }); return; }
    if (isFollowing) {
      await unfollowUser(user.id, hostId);
      setIsFollowing(false);
      addToast({ message: 'Unfollowed', type: 'success' });
    } else {
      await followUser(user.id, hostId);
      setIsFollowing(true);
      addToast({ message: `Following ${streamerName}`, type: 'success' });
    }
  };

  const handleLike = async () => {
    if (!user || !roomId || roomId < 0) { addToast({ message: 'Sign in to like', type: 'error' }); return; }
    if (liked) {
      const n = await unlikeRoom(roomId, user.id);
      setLikes(n);
      setLiked(false);
    } else {
      const n = await likeRoom(roomId, user.id);
      setLikes(n);
      setLiked(true);
    }
  };

  return (
    <>
      <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/[0.06]">
        <div className="flex items-center gap-3">
          <img src={streamerAvatar} alt={streamerName} className="w-10 h-10 rounded-full border-2 border-arcade-purple/30 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-text-primary truncate">{streamerName}</span>
              {streamerVerified && <BadgeCheck className="w-4 h-4 text-arcade-blue shrink-0" />}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-neutral-400 flex-wrap">
              <span>{subscriberCount} followers</span>
              <span className="w-0.5 h-0.5 rounded-full bg-neutral-600" />
              <span>{viewerCount} watching</span>
              <span className="w-0.5 h-0.5 rounded-full bg-neutral-600" />
              <span>{streamStarted}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleLike}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition-all ${liked ? 'bg-arcade-pink/20 border-arcade-pink/30 text-arcade-pink' : 'bg-white/[0.04] border-white/[0.08] text-neutral-400 hover:text-arcade-pink hover:border-arcade-pink/30'}`}
            ><Heart className={`w-4 h-4 ${liked ? 'fill-arcade-pink' : ''}`} /></button>
            {isHost && (
              <button onClick={() => navigate(`/studio/${roomCode}`)}
                className="min-h-[44px] px-3 py-2 rounded-xl font-bold text-xs bg-arcade-pink/20 text-arcade-pink border border-arcade-pink/30 hover:bg-arcade-pink/30 transition-all"
              >Studio</button>
            )}
            <button onClick={() => setQrOpen(true)}
              aria-label="Share room"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-arcade-blue hover:border-arcade-blue/30 transition-all"
            ><Share2 className="w-4 h-4" /></button>
            <button onClick={handleFollow}
              className={`min-h-[44px] px-4 py-2 rounded-xl font-bold text-xs active:scale-[0.97] touch-manipulation ${isFollowing ? 'bg-arcade-pink/20 text-arcade-pink border border-arcade-pink/30' : 'bg-gradient-to-r from-arcade-purple to-arcade-blue text-white'}`}
            >{isFollowing ? 'Following' : 'Follow'}</button>
          </div>
        </div>
        <p className="text-xs font-semibold text-text-primary mt-2 line-clamp-2">{streamTitle}</p>
      </div>

      {/* Mobile QR Share Modal */}
      <AnimatePresence>
        {qrOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setQrOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              onClick={e => e.stopPropagation()}
              className="relative bg-bg-primary border border-arcade-blue/20 rounded-t-2xl sm:rounded-2xl p-6 pb-8 max-w-sm w-full shadow-2xl text-center">
              <button onClick={() => setQrOpen(false)}
                aria-label="Close QR code"
                className="absolute top-3 right-3 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-neutral-400 hover:text-text-primary transition-all">
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-bold text-text-primary mb-1">Share Room</h3>
              <div className="flex justify-center my-3">
                <img src={qrImg} alt="QR" className="w-32 h-32 rounded-xl bg-white p-1"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div className="text-center mb-4">
                <span className="text-[10px] text-neutral-500 block mb-1">Room code</span>
                <span className="text-xl font-black text-arcade-purple tracking-[0.3em]">@{roomCode}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard?.writeText(roomUrl); addToast({ message: 'Link copied!', type: 'success' }); }}
                  className="flex-1 min-h-[48px] rounded-xl bg-white/[0.05] border border-white/[0.08] text-neutral-300 text-xs font-bold hover:text-text-primary transition-all flex items-center justify-center gap-1.5"
                ><Copy className="w-3.5 h-3.5" /> Copy</button>
                <button onClick={async () => { if (navigator.share) { try { await navigator.share({ title: streamTitle, text: `Join ${streamerName} live!`, url: roomUrl }); } catch { console.warn('Share cancelled'); } } else { navigator.clipboard?.writeText(roomUrl); addToast({ message: 'Link copied!', type: 'success' }); } }}
                  className="flex-1 min-h-[48px] rounded-xl bg-gradient-to-r from-arcade-purple/20 to-arcade-blue/20 border border-arcade-purple/30 text-arcade-purple text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                ><Share2 className="w-3.5 h-3.5" /> Share</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



function QueueBanner({ roomStatus, roomCode, roomId, user, profile, addToast }: { roomStatus: string; roomCode: string | undefined; roomId: number | undefined; user: User | null; profile: Profile | null; addToast: (t: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void }) {
  const [inQueue, setInQueue] = useState(false);
  const [queueEntryId, setQueueEntryId] = useState<number | null>(null);
  const queueOpen = roomStatus === 'queue_open';

  const handleQueueToggle = async () => {
    if (!user) { addToast?.({ message: 'Sign in to join queue', type: 'warning' }); return; }
    if (!roomId || roomId < 0) { addToast?.({ message: 'Room not available', type: 'error' }); return; }
    if (inQueue && queueEntryId) {
      try {
        await leaveQueue(queueEntryId);
        setInQueue(false);
        setQueueEntryId(null);
        addToast?.({ message: 'Left queue', type: 'success' });
      } catch { addToast?.({ message: 'Failed to leave queue', type: 'error' }); }
    } else {
      try {
        const entry = await joinQueue({
          room_id: roomId, user_id: user.id,
          username: profile?.username || user.email?.split('@')[0] || 'Anonymous',
          avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
          type: 'free',
        });
        setInQueue(true);
        setQueueEntryId(entry.id);
        addToast?.({ message: 'Joined queue!', type: 'success' });
      } catch { addToast?.({ message: 'Failed to join queue', type: 'error' }); }
    }
  };

  return (
    <AnimatePresence>
      {queueOpen && (
        <motion.div initial={{ opacity: 0, y: -12, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -12, height: 0 }} transition={{ duration: 0.2 }}>
          <div className="bg-gradient-to-r from-arcade-blue/10 to-arcade-purple/10 rounded-xl border border-arcade-blue/20 px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-arcade-green animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-text-primary truncate">Queue is open!</span>
              <span className="hidden sm:inline text-[10px] text-neutral-400">@{roomCode}</span>
            </div>
            <button onClick={handleQueueToggle}
              className={`shrink-0 min-h-[32px] px-3 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-[0.97] touch-manipulation ${inQueue ? 'bg-arcade-green/20 text-arcade-green border border-arcade-green/30' : 'bg-gradient-to-r from-arcade-purple to-arcade-blue text-white'}`}
            >{inQueue ? '✓ In Queue' : 'Join Queue'}</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const demoMessages = [
  { id: -1, username: 'StreamArena', message: 'Welcome to the stream! Type a message to chat with everyone 🎉', color: '#818cf8', is_super: false, created_at: new Date(Date.now() - 90000).toISOString() },
  { id: -2, username: 'StreamArena', message: '💡 Tip: Use the Super Chat button (star icon) to get noticed!', color: '#818cf8', is_super: false, created_at: new Date(Date.now() - 80000).toISOString() },
  { id: -3, type: 'ai', username: 'AI Host', message: '🏆 Round 1 finished — Aman is leading with 850 points!', color: '#a78bfa', is_super: false, created_at: new Date(Date.now() - 65000).toISOString() },
  { id: -4, username: 'Rahul', message: 'yo streamer W 🔥', color: '#FFF2DD', is_super: false, created_at: new Date(Date.now() - 55000).toISOString() },
  { id: -5, username: 'Priya', message: 'first time here, this is sick!', color: '#FFF2DD', is_super: false, created_at: new Date(Date.now() - 45000).toISOString() },
  { id: -6, username: 'RajGamer', message: 'gg guys 🔥🔥', color: '#FFB000', is_super: true, created_at: new Date(Date.now() - 35000).toISOString(), amount: 10 },
  { id: -7, username: 'Neha', message: 'lets gooo 🚀', color: '#FFF2DD', is_super: false, created_at: new Date(Date.now() - 30000).toISOString() },
  { id: -8, type: 'ai', username: 'AI Host', message: '⏰ Next round starting in 30 seconds — get ready!', color: '#a78bfa', is_super: false, created_at: new Date(Date.now() - 20000).toISOString() },
  { id: -9, username: 'Vikram', message: 'next round pls', color: '#FFF2DD', is_super: false, created_at: new Date(Date.now() - 15000).toISOString() },
  { id: -10, username: 'Anon', message: 'what game we playing?', color: '#FFF2DD', is_super: false, created_at: new Date(Date.now() - 10000).toISOString() },
  { id: -11, username: 'Sofia', message: 'just joined, hi everyone!', color: '#FFF2DD', is_super: false, created_at: new Date(Date.now() - 5000).toISOString() },
];



function VoiceLangSelector({ darkFeed, voiceLang, onSelectLang }: { darkFeed: boolean; voiceLang: string; onSelectLang: (c: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const current = ttsLanguages.find(l => l.code === voiceLang) || ttsLanguages[0];
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${darkFeed ? 'bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-text-primary' : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'}`}
      ><span className="text-sm">{current.flag}</span> {current.label} <ChevronDown className="w-3 h-3 ml-auto opacity-50" /></button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className={`absolute bottom-full mb-1 left-0 right-0 rounded-xl overflow-hidden z-50 ${darkFeed ? 'glass-strong' : 'bg-white border border-gray-200 shadow-lg'}`}
          >
            {ttsLanguages.map(l => (
              <button key={l.code} onClick={() => { onSelectLang(l.code); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold transition-all hover:bg-white/5 ${voiceLang === l.code ? 'text-arcade-blue' : 'text-neutral-400'}`}
              ><span className="text-sm">{l.flag}</span> {l.label}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ViewerFeed({ roomId, user, addToast, profile, refreshProfile }: { roomId: number | undefined; user: User | null; addToast: (t: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void; profile: Profile | null; refreshProfile: () => Promise<void> }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [darkFeed, setDarkFeed] = useState(true);
  const [filter, setFilter] = useState<'all' | 'chat' | 'arena' | 'alerts'>('all');
  const [pinned, setPinned] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef(true);
  const [fetchedOnce, setFetchedOnce] = useState(false);
  const [showSuperVoice, setShowSuperVoice] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en');
  const [voiceStyle, setVoiceStyle] = useState('normal');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const localRef = useRef(localMessages);
  localRef.current = localMessages;

  const isDemo = roomId !== undefined && roomId < 0;

  const fetchMessages = useCallback(async () => {
    if (isDemo) {
      setMessages([...localRef.current]);
      setFetchedOnce(true);
      setLoading(false);
      return;
    }
    if (!roomId) {
      setLoading(false);
      return;
    }
    try {
      const data = await getChatMessages(roomId);
      setMessages(data);
      setFetchedOnce(true);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [roomId, isDemo]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  useEffect(() => {
    if (!loading && pinned) scrollToBottom();
  }, [loading]);

  const voiceLangRef = useRef(voiceLang);
  voiceLangRef.current = voiceLang;
  const voiceStyleRef = useRef(voiceStyle);
  voiceStyleRef.current = voiceStyle;

  useRealtimeSubscription('chat_messages', !isDemo && roomId ? { column: 'room_id', value: roomId } : undefined,
    (newMsg: ChatMessage) => {
      setMessages(prev => [...prev, newMsg]);
      if (newMsg.is_super && newMsg.user_id !== user?.id) {
        speakSuperChat(newMsg.username, newMsg.message, voiceLangRef.current, voiceStyleRef.current, addToast);
      }
    },
  );

  const sendMessage = async (isSuper = false) => {
    if (!message.trim()) return;
    if (!user) { addToast?.({ message: 'Sign in to chat', type: 'warning' }); return; }
    if (isSuper && (profile?.coins ?? 0) < 10) { addToast?.({ message: 'Need 10 coins for Super Chat', type: 'error' }); return; }
    if (!roomId) return;

    const msg: ChatMessage = {
      id: -(Date.now()), room_id: roomId, user_id: user.id,
      username: profile?.username || user.email?.split('@')[0] || 'Anonymous',
      message, amount: isSuper ? 10 : 0,
      color: isSuper ? '#FFB000' : '#FFF2DD', is_super: isSuper,
      created_at: new Date().toISOString(),
    };

    if (isDemo) {
      setLocalMessages(m => {
        const next = [...m, msg];
        localRef.current = next;
        return next;
      });
      setMessage('');
      if (isSuper) { const un = profile?.username || user?.email?.split('@')[0] || 'Anonymous'; speakSuperChat(un, message, voiceLang, voiceStyle, addToast); await refreshProfile?.(); addToast?.({ message: 'Super Chat sent!', type: 'success' }); }
      fetchMessages();
      return;
    }

    try {
      await sendChatMessage({
        room_id: roomId, user_id: user.id,
        username: profile?.username || user.email?.split('@')[0] || 'Anonymous',
        message, amount: isSuper ? 10 : 0,
        color: isSuper ? '#FFB000' : '#FFF2DD', is_super: isSuper,
      });
      setMessage('');
      if (isSuper) { const un = profile?.username || user?.email?.split('@')[0] || 'Anonymous'; speakSuperChat(un, message, voiceLang, voiceStyle, addToast); await refreshProfile?.(); addToast?.({ message: 'Super Chat sent!', type: 'success' }); }
    } catch { addToast?.({ message: 'Send failed', type: 'error' }); }
  };

  const sendEmoji = async (emoji: string) => {
    if (!user || !roomId) return;

    const msg: ChatMessage = {
      id: -(Date.now()), room_id: roomId, user_id: user.id,
      username: profile?.username || user.email?.split('@')[0] || 'Anonymous',
      message: emoji, amount: 0, color: '#FF5A1F', is_super: false,
      created_at: new Date().toISOString(),
    };

    if (isDemo) {
      setLocalMessages(m => {
        const next = [...m, msg];
        localRef.current = next;
        return next;
      });
      fetchMessages();
      return;
    }

    try {
      await sendChatMessage({
        room_id: roomId, user_id: user.id,
        username: profile?.username || user.email?.split('@')[0] || 'Anonymous',
        message: emoji, amount: 0, color: '#FF5A1F', is_super: false,
      });
    } catch { addToast?.({ message: 'Emoji send failed', type: 'error' }); }
  };

  const displayMessages = !fetchedOnce && messages.length === 0 ? demoMessages : messages;

  const entries = displayMessages.map((msg: ChatMessage, i: number) => ({
    id: msg.id || i,
    type: msg.is_super ? 'youtube_superchat' as const : 'youtube_chat' as const,
    username: msg.username || 'Anonymous',
    text: msg.message,
    time: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now',
    amount: msg.amount || undefined,
  }));

  const filterMap: Record<string, string> = { chat: 'youtube_chat', alerts: 'youtube_superchat' };
  const filteredEntries = filter === 'all' ? entries : entries.filter(e => e.type === filterMap[filter]);

  const scrollToBottom = useCallback((smooth = false) => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (atBottom !== pinRef.current) {
      pinRef.current = atBottom;
      setPinned(atBottom);
      if (atBottom) setNewCount(0);
    }
  }, []);

  useEffect(() => {
    if (pinRef.current) scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight);
    else setNewCount(c => c + 1);
  }, [filteredEntries.length]);

  const quickEmojis = [{ emoji: '🔥' }, { emoji: '❤️' }, { emoji: '👍' }, { emoji: '⭐' }, { emoji: '⚡' }, { emoji: '👑' }];

  return (
    <div className={`rounded-2xl border overflow-hidden flex flex-col ${darkFeed ? 'bg-white/[0.03] border-arcade-pink/10' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 ${darkFeed ? 'border-b border-arcade-pink/10' : 'border-b border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <MessageSquare className={`w-4 h-4 ${darkFeed ? 'text-arcade-blue' : 'text-gray-700'}`} />
          <h3 className={`font-semibold text-sm ${darkFeed ? 'text-text-primary' : 'text-gray-900'}`}>Live Feed</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] tabular-nums ${darkFeed ? 'text-text-muted' : 'text-gray-400'}`}>{filteredEntries.length} msgs</span>
          <button onClick={() => setDarkFeed(p => !p)}
            aria-label={darkFeed ? 'Switch to light feed' : 'Switch to dark feed'}
            className={`p-1.5 rounded-lg transition-all touch-manipulation ${darkFeed ? 'text-arcade-blue hover:bg-white/[0.04]' : 'text-gray-400 hover:bg-gray-100'}`}
          >{darkFeed ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}</button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={`flex border-b ${darkFeed ? 'border-arcade-pink/10' : 'border-gray-200'}`}>
        {([{ id: 'all', label: 'All' }, { id: 'chat', label: 'Chat' }, { id: 'alerts', label: 'Alerts' }] as const).map(tab => (
          <button key={tab.id} onClick={() => setFilter(tab.id)}
            className={`flex-1 min-h-[36px] text-[10px] font-semibold transition-all ${filter === tab.id ? 'text-arcade-pink bg-arcade-pink/5' : darkFeed ? 'text-text-muted hover:text-text-primary' : 'text-gray-400 hover:text-gray-700'}`}
          >{tab.label}</button>
        ))}
      </div>

      {/* Feed */}
      <div ref={scrollRef} onScroll={handleScroll} className="overflow-y-auto no-scrollbar flex-1 relative" style={{ minHeight: 200 }}>
        {!pinned && newCount > 0 && (
          <button onClick={() => { scrollToBottom(true); pinRef.current = true; setPinned(true); setNewCount(0); }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg bg-arcade-purple text-white hover:bg-arcade-purple/90 transition-all touch-manipulation"
          ><ArrowDown className="w-3 h-3" /> {newCount} new</button>
        )}
        <div className="p-1.5 space-y-0.5">
          <AnimatePresence initial={false}>
            {loading ? (
              <div className="py-8 text-center"><div className="w-5 h-5 border-2 border-arcade-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
            ) : filteredEntries.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare className={`w-6 h-6 mx-auto mb-1 opacity-40 ${darkFeed ? 'text-text-muted' : 'text-gray-400'}`} />
                <p className={`text-xs ${darkFeed ? 'text-text-muted' : 'text-gray-400'}`}>No messages yet</p>
              </div>
            ) : filteredEntries.map((entry, idx) => {
              const isSuper = entry.type === 'youtube_superchat';
              return (
                <motion.div key={entry.id || idx} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`group flex items-start gap-2.5 p-2.5 rounded-xl transition-colors ${
                    isSuper ? (darkFeed ? 'bg-arcade-blue/5 border border-arcade-blue/20' : 'bg-yellow-50 border border-yellow-200')
                    : (darkFeed ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50')
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                        isSuper ? 'text-arcade-blue' : 'text-red-400'
                  } ${darkFeed ? 'bg-white/[0.04] border-white/[0.06]' : 'bg-gray-100 border-gray-200'}`}>
                    {isSuper ? <Star className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    isSuper ? 'text-arcade-blue' : 'text-red-400'
                      } ${darkFeed ? 'bg-white/[0.04]' : 'bg-gray-100'}`}>
                        [{isSuper ? 'Super' : 'Chat'}]
                      </span>
                      <span className={`text-xs font-semibold truncate ${darkFeed ? 'text-text-primary' : 'text-gray-900'}`}>{entry.username}</span>
                      <span className={`text-[10px] shrink-0 ${darkFeed ? 'text-text-muted' : 'text-gray-400'}`}>{entry.time}</span>
                      {entry.amount && (
                        <span className={`flex items-center gap-0.5 text-[10px] font-bold text-arcade-blue px-1.5 py-0.5 rounded shrink-0 bg-arcade-blue/10`}>
                          <Coins className="w-2.5 h-2.5" />{entry.amount}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed mt-1 ${darkFeed ? 'text-text-primary' : 'text-gray-800'}`}>{entry.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className={`px-3 py-1.5 flex items-center gap-2 text-[8px] justify-center flex-wrap ${darkFeed ? 'border-t border-arcade-pink/10 text-text-muted' : 'border-t border-gray-200 text-gray-400'}`}>
        <span className="flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5 text-red-400" />Chat</span>
        <span className="flex items-center gap-1"><Star className="w-2.5 h-2.5 text-arcade-blue" />Super</span>
      </div>

      {/* Chat input */}
      <div className={`p-2 border-t ${darkFeed ? 'border-arcade-pink/10' : 'border-gray-200'} space-y-1.5`}>
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
          {quickEmojis.map((e, i) => (
            <button key={i} onClick={() => sendEmoji(e.emoji)} aria-label={`Send ${e.emoji}`} className="min-w-[36px] min-h-[36px] w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/10 flex items-center justify-center text-sm transition-colors shrink-0">{e.emoji}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type..."
            className={`flex-1 rounded-xl px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none ${darkFeed ? 'bg-white/[0.04] border border-white/[0.08] text-text-primary focus:border-arcade-pink/40' : 'bg-gray-100 border border-gray-200 text-gray-900 focus:border-arcade-pink'}`} />
          <button onClick={() => sendMessage()} aria-label="Send message" className="min-h-[36px] min-w-[36px] p-2 rounded-lg bg-arcade-blue/20 text-arcade-blue hover:bg-arcade-blue/30"><Send className="w-4 h-4" /></button>
          <button onClick={() => sendMessage(true)} className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-arcade-blue to-arcade-pink text-white text-[10px] font-bold hover:opacity-90">Super</button>
          <button onClick={() => setShowSuperVoice(p => !p)}
            className={`min-h-[36px] px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${showSuperVoice ? 'bg-arcade-purple text-white' : darkFeed ? 'bg-white/[0.05] border border-white/[0.1] text-neutral-400 hover:text-text-primary' : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'}`}
          ><Mic className="w-3 h-3 inline mr-1" />Voice</button>
        </div>

        <AnimatePresence>
          {showSuperVoice && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className={`p-2 rounded-xl ${darkFeed ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-gray-50 border border-gray-200'}`}>
                {/* Language selector */}
                <VoiceLangSelector darkFeed={darkFeed} voiceLang={voiceLang} onSelectLang={setVoiceLang} />
                {/* Voice style options */}
                <div className="flex gap-1 flex-wrap mt-2">
                  {voiceStyles.map(s => (
                    <button key={s.id} onClick={() => setVoiceStyle(s.id)}
                      className={`min-h-[28px] px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all ${voiceStyle === s.id ? 'bg-arcade-blue text-white' : darkFeed ? 'bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-text-primary' : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'}`}
                    >{s.icon} {s.label}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

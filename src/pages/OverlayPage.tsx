import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Crown, Clock, Sparkles, Coins, Star, Smartphone, Zap, Volume2 } from 'lucide-react';
import { getRoomByCode, getOverlayEvents } from '../lib/api';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';

interface ApiOverlayEvent {
  id: number;
  event_type: string;
  event_data?: { title?: string; subtitle?: string; [key: string]: unknown };
  created_at?: string;
}

type OverlayEvent = {
  id: number;
  type: string;
  title: string;
  subtitle: string;
  icon: typeof Trophy;
  color: string;
};

const eventIcons: Record<string, typeof Trophy> = {
  selection: Trophy, winner: Crown, countdown: Clock, shoutout: Star,
  coin: Coins, player_join: Users, fan_drop: Sparkles, fan_drop_show: Sparkles,
  announcement: Zap,
};

const eventColors: Record<string, string> = {
  selection: '#10b981', winner: '#f59e0b', countdown: '#3b82f6',
  shoutout: '#a855f7', coin: '#eab308', player_join: '#06b6d4',
  fan_drop: '#ec4899', fan_drop_show: '#ec4899', announcement: '#f59e0b',
};

function OverlayEventDisplay({ event }: { event: OverlayEvent }) {
  const Icon = event.icon;
  const isAnnouncement = event.type === 'announcement';

  if (isAnnouncement) {
    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, scale: 0.3, y: -40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.2, y: -60 }}
        transition={{ type: 'spring', damping: 12, stiffness: 120 }}
        className="flex flex-col items-center justify-center text-center px-8"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-6 relative"
        >
          <div className="absolute inset-0 blur-3xl opacity-40" style={{ backgroundColor: event.color }} />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/30 to-orange-500/20 border-2 border-yellow-400/40 flex items-center justify-center">
            <Volume2 className="w-12 h-12 text-yellow-400" />
          </div>
        </motion.div>
        <motion.h1
          animate={{ textShadow: ['0 0 20px rgba(245,158,11,0.3)', '0 0 40px rgba(245,158,11,0.6)', '0 0 20px rgba(245,158,11,0.3)'] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-6xl font-black text-white mb-3 tracking-tight drop-shadow-lg"
        >
          {event.title}
        </motion.h1>
        <motion.p
          animate={{ y: [0, -4, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-3xl text-yellow-300/80 font-bold drop-shadow-lg"
        >
          {event.subtitle}
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center text-center px-8"
    >
      <div className="mb-4 relative">
        <div className="absolute inset-0 blur-2xl opacity-30" style={{ backgroundColor: event.color }} />
        <div className="relative w-20 h-20 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center">
          <Icon className="w-10 h-10" style={{ color: event.color }} />
        </div>
      </div>
      <h1 className="text-5xl font-black text-white mb-2 tracking-tight drop-shadow-lg">{event.title}</h1>
      <p className="text-xl text-white/60 font-medium">{event.subtitle}</p>
    </motion.div>
  );
}

export default function OverlayPage() {
  const { roomCode } = useParams();
  const code = useMemo(() => roomCode || Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join(''), [roomCode]);
  const roomUrl = `${window.location.origin}/room/${code}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(roomUrl)}`;

  const [roomId, setRoomId] = useState<number | null>(null);
  const [events, setEvents] = useState<OverlayEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [connected, setConnected] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [fetching, setFetching] = useState(true);
  const qrTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayEvents = events;

  // Fetch room by code
  useEffect(() => {
    if (!roomCode) return;
    setFetching(true);
    getRoomByCode(roomCode).then(data => {
      if (data?.id) setRoomId(data.id);
    }).catch(() => { setConnected(false); console.error('Overlay: room fetch failed'); })
      .finally(() => setFetching(false));
  }, [roomCode]);

  // Fetch existing overlay events
  useEffect(() => {
    if (!roomId) return;
    getOverlayEvents(roomId).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setEvents(data.map((e: ApiOverlayEvent) => ({
          id: e.id,
          type: e.event_type,
          title: e.event_type === 'announcement' ? `${e.event_data?.streamer || 'Streamer'} says:` : (e.event_data?.title || e.event_type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())),
          subtitle: e.event_type === 'announcement' ? (e.event_data?.message as string || '') : (e.event_data?.subtitle || ''),
          icon: eventIcons[e.event_type] || Sparkles,
          color: eventColors[e.event_type] || '#a78bfa',
        })));
      }
    }).catch(() => console.error('Overlay: events fetch failed'));
  }, [roomId]);

  // Realtime subscription for new events
  useRealtimeSubscription(
    'overlay_events',
    roomId ? { column: 'room_id', value: roomId } : undefined,
    (newEvent: ApiOverlayEvent) => {
      setEvents(prev => [...prev, {
        id: newEvent.id,
        type: newEvent.event_type,
        title: newEvent.event_type === 'announcement' ? `${newEvent.event_data?.streamer || 'Streamer'} says:` : (newEvent.event_data?.title || newEvent.event_type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())),
        subtitle: newEvent.event_type === 'announcement' ? (newEvent.event_data?.message as string || '') : (newEvent.event_data?.subtitle || ''),
        icon: eventIcons[newEvent.event_type] || Sparkles,
        color: eventColors[newEvent.event_type] || '#a78bfa',
      }]);
    },
  );

  // Auto-advance through events
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(i => (i + 1) % Math.max(displayEvents.length, 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [displayEvents.length]);

  // BroadcastChannel for QR show
  useEffect(() => {
    try {
      const ch = new BroadcastChannel(`streamarena-${code}`);
      ch.onmessage = (e) => {
        if (e.data?.type === 'show_qr') {
          setShowQR(true);
          if (qrTimeoutRef.current) clearTimeout(qrTimeoutRef.current);
          qrTimeoutRef.current = setTimeout(() => setShowQR(false), 120000);
        }
      };
      return () => { ch.close(); if (qrTimeoutRef.current) clearTimeout(qrTimeoutRef.current); };
    } catch { console.warn('BroadcastChannel not supported'); }
  }, [code]);

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-between p-8 pb-8">
      <div className="self-end flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/5">
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
        <span className="text-[10px] text-white/40 font-mono">@{code}</span>
      </div>

      <div className="relative w-full max-w-3xl flex items-center justify-center" style={{ minHeight: '240px' }}>
        <AnimatePresence mode="wait">
          {fetching ? (
            <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-white/20 border-t-arcade-green rounded-full animate-spin" />
              <span className="text-white/40 text-xs">Connecting...</span>
            </motion.div>
          ) : !connected ? (
            <motion.div key="disconnected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
              <span className="text-red-400/60 text-xs">Disconnected</span>
            </motion.div>
          ) : displayEvents.length > 0 && displayEvents[currentIndex] ? (
            <OverlayEventDisplay key={displayEvents[currentIndex].id} event={displayEvents[currentIndex]} />
          ) : (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
              <div className="w-2 h-2 bg-arcade-green/40 rounded-full animate-pulse" />
              <span className="text-white/30 text-xs">Waiting for events...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
        {displayEvents.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-white w-5' : 'bg-white/20'}`} />
        ))}
      </div>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-12 px-6" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          >
            <div className="max-w-2xl mx-auto flex items-center gap-6 flex-wrap justify-center">
              <div className="shrink-0">
                <img src={qrUrl} alt="QR" className="w-24 h-24 rounded-xl bg-white p-1.5 shadow-lg shadow-black/40"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className="w-4 h-4 text-arcade-green" />
                  <span className="text-sm font-bold text-white drop-shadow-lg">Join the game</span>
                </div>
                <p className="text-xs text-white/60 mb-2">Scan QR or visit:</p>
                <div className="flex items-center gap-2">
                  <div className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 flex-1 min-w-0">
                    <span className="text-sm font-mono text-arcade-yellow truncate block">{roomUrl}</span>
                  </div>
                  <div className="bg-arcade-green/20 border border-arcade-green/40 px-2.5 py-1.5 rounded-lg">
                    <span className="text-lg font-black text-arcade-green tracking-widest">@{code}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Crown, Clock, Sparkles, Coins, Star, Smartphone } from 'lucide-react';
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

const mockEvents: OverlayEvent[] = [
  { id: 1, type: 'selection', title: 'Next Round Starting', subtitle: 'BGMI · Round 3 of 5', icon: Trophy, color: '#10b981' },
  { id: 2, type: 'winner', title: 'Winner: Priya', subtitle: 'AI Quiz · 95% accuracy', icon: Crown, color: '#f59e0b' },
  { id: 3, type: 'countdown', title: 'Round 4', subtitle: 'Starts in 10...', icon: Clock, color: '#3b82f6' },
  { id: 4, type: 'shoutout', title: 'Shoutout: RajGamer', subtitle: '50 coins donated', icon: Star, color: '#a855f7' },
  { id: 5, type: 'coin', title: 'Vikram held 50 coins', subtitle: 'Coin Priority active', icon: Coins, color: '#eab308' },
  { id: 6, type: 'player_join', title: 'Sofia joined the lobby', subtitle: 'Waiting for selection', icon: Users, color: '#06b6d4' },
  { id: 7, type: 'fan_drop', title: 'Fan Drop: sketch.png', subtitle: 'New submission from Neha', icon: Sparkles, color: '#ec4899' },
];

const eventIcons: Record<string, typeof Trophy> = {
  selection: Trophy, winner: Crown, countdown: Clock, shoutout: Star,
  coin: Coins, player_join: Users, fan_drop: Sparkles, fan_drop_show: Sparkles,
};

const eventColors: Record<string, string> = {
  selection: '#10b981', winner: '#f59e0b', countdown: '#3b82f6',
  shoutout: '#a855f7', coin: '#eab308', player_join: '#06b6d4',
  fan_drop: '#ec4899', fan_drop_show: '#ec4899',
};

function OverlayEventDisplay({ event }: { event: OverlayEvent }) {
  const Icon = event.icon;
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
  const [connected] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const qrTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayEvents = events.length > 0 ? events : mockEvents;

  // Fetch room by code
  useEffect(() => {
    if (!roomCode) return;
    fetch(`/api/rooms?code=${roomCode}`).then(r => r.json()).then(data => {
      if (data?.id) setRoomId(data.id);
    }).catch(() => {});
  }, [roomCode]);

  // Fetch existing overlay events
  useEffect(() => {
    if (!roomId) return;
    fetch(`/api/overlay-events?roomId=${roomId}`).then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setEvents(data.map((e: ApiOverlayEvent) => ({
          id: e.id,
          type: e.event_type,
          title: e.event_data?.title || e.event_type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          subtitle: e.event_data?.subtitle || '',
          icon: eventIcons[e.event_type] || Sparkles,
          color: eventColors[e.event_type] || '#a78bfa',
        })));
      }
    }).catch(() => {});
  }, [roomId]);

  // Realtime subscription for new events
  useRealtimeSubscription(
    'overlay_events',
    roomId ? { column: 'room_id', value: roomId } : undefined,
    (newEvent: ApiOverlayEvent) => {
      setEvents(prev => [...prev, {
        id: newEvent.id,
        type: newEvent.event_type,
        title: newEvent.event_data?.title || newEvent.event_type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        subtitle: newEvent.event_data?.subtitle || '',
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
    } catch { return; }
  }, [code]);

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-between p-8 pb-8">
      <div className="self-end flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/5">
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
        <span className="text-[10px] text-white/40 font-mono">@{code}</span>
      </div>

      <div className="relative w-full max-w-3xl flex items-center justify-center" style={{ minHeight: '240px' }}>
        <AnimatePresence mode="wait">
          {displayEvents.length > 0 && (
            <OverlayEventDisplay key={displayEvents[currentIndex]?.id || 0} event={displayEvents[currentIndex] || mockEvents[0]} />
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
            <div className="max-w-2xl mx-auto flex items-center gap-6">
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

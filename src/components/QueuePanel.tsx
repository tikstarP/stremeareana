import { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { getQueueEntries, joinQueue } from '../lib/api';
import type { QueueEntry } from '../types';

export default function QueuePanel({ roomId }: { roomId?: number }) {
  const { user, session } = useAuth();
  const { profile, refreshProfile, addToast } = useApp();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [tab, setTab] = useState('free');
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    if (!roomId) return;
    try {
      const data = await getQueueEntries(roomId);
      setQueue(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [roomId]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  useRealtimeSubscription<QueueEntry>('queue_entries', roomId ? { column: 'room_id', value: roomId } : undefined,
    (newEntry) => { setQueue(prev => [...prev, newEntry]); },
  );

  const freeQueue = queue.filter(q => q.type === 'free');
  const priorityQueue = queue.filter(q => q.type === 'priority');
  const displayQueue = tab === 'free' ? freeQueue : priorityQueue;

  const handleJoin = async () => {
    if (!user || !session) { addToast({ message: 'Sign in to join queue', type: 'warning' }); return; }
    if (tab === 'priority' && (profile?.coins ?? 0) < 10) { addToast({ message: 'Need 10 coins for priority', type: 'error' }); return; }
    if (!roomId) { addToast({ message: 'Room not ready', type: 'error' }); return; }
    setJoining(true);
    try {
      await joinQueue({
        room_id: roomId, user_id: user.id,
        username: profile?.username || user.email?.split('@')[0],
        avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        type: tab,
      });
      await refreshProfile();
      addToast({ message: `Joined ${tab} queue!`, type: 'success' });
      fetchQueue();
    } catch (err: unknown) {
      addToast({ message: err instanceof Error ? err.message : 'Failed to join', type: 'error' });
    }
    finally { setJoining(false); }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden border border-arcade-pink/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-arcade-pink/10">
        <div className="flex items-center gap-2"><span className="text-lg">⏳</span><h3 className="font-semibold text-text-primary text-sm">Queue</h3></div>
        <span className="text-[11px] text-text-muted">{queue.length} waiting</span>
      </div>
      <div className="flex border-b border-arcade-pink/10">
        <button onClick={() => setTab('free')} className={`flex-1 min-h-[44px] sm:min-h-auto py-2.5 text-xs font-semibold transition-colors relative ${tab === 'free' ? 'text-arcade-blue' : 'text-text-muted'}`}>
          <span className="flex items-center justify-center gap-1">⭐ Free</span>
          {tab === 'free' && <motion.div layoutId="qtab3" className="absolute bottom-0 left-0 right-0 h-0.5 bg-arcade-blue" />}
        </button>
        <button onClick={() => setTab('priority')} className={`flex-1 min-h-[44px] sm:min-h-auto py-2.5 text-xs font-semibold transition-colors relative ${tab === 'priority' ? 'text-arcade-yellow' : 'text-text-muted'}`}>
          <span className="flex items-center justify-center gap-1">🎲 Priority</span>
          {tab === 'priority' && <motion.div layoutId="qtab3" className="absolute bottom-0 left-0 right-0 h-0.5 bg-arcade-yellow" />}
        </button>
      </div>
      <div className="max-h-[220px] overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="py-6 text-center"><div className="w-5 h-5 border-2 border-arcade-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayQueue.length === 0 ? (
              <div className="py-6 text-center text-text-muted text-xs"><span className="text-2xl block mb-1">💬</span>Empty queue</div>
            ) : displayQueue.map((item, i) => (
              <motion.div key={item.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 px-4 py-2 hover:bg-white/[0.02] transition-colors border-b border-arcade-pink/5 last:border-0"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-gradient-to-br from-arcade-yellow to-arcade-orange text-black' : 'bg-bg-secondary text-text-muted'}`}>
                  {i === 0 ? '🔥' : i + 1}
                </span>
                <img src={item.avatar_url} alt={item.username} className="w-7 h-7 rounded-full border border-arcade-pink/20" />
                <span className="text-xs text-text-primary flex-1 truncate">{item.username}</span>
                {item.type === 'priority' && <span className="text-xs">🎲</span>}
                <span className="text-[10px] text-text-muted flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />{item.created_at ? Math.floor((Date.now() - new Date(item.created_at).getTime()) / 60000) + 'm' : '--'}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      <div className="p-3 border-t border-arcade-pink/10">
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleJoin} disabled={joining}
          className={`w-full min-h-[44px] sm:min-h-auto py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            tab === 'priority' ? 'bg-gradient-to-r from-arcade-yellow/20 to-arcade-orange/10 border border-arcade-yellow/40 text-arcade-yellow' : 'bg-gradient-to-r from-arcade-blue/20 to-arcade-blue/5 border border-arcade-blue/40 text-arcade-blue'
          }`}
        >
          {joining ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          : <><span className="text-sm">{tab === 'priority' ? '🚀' : '⭐'}</span>Join {tab === 'priority' ? 'Priority (10🎲)' : 'Free'} Queue</>}
        </motion.button>
      </div>
    </div>
  );
}

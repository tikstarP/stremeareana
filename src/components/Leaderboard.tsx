import { useState, useEffect } from 'react';
import { TrendingUp, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../context/AppContext';
import { Skeleton } from './Skeleton';
import type { LeaderboardEntry } from '../types';

export default function Leaderboard() {
  const { user } = useAuth();
  const { profile } = useApp();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?period=${period}`);
        if (res.ok) setEntries(await res.json());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchLeaderboard();
    const i = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(i);
  }, [period]);

  const rankIcon = (r: number) => {
    if (r === 1) return <span className="text-lg">🥇</span>;
    if (r === 2) return <span className="text-lg">🥈</span>;
    if (r === 3) return <span className="text-lg">🥉</span>;
    return <span className="text-[10px] text-text-muted font-mono w-5 text-center">#{r}</span>;
  };

  const rankBg = (r: number) => {
    if (r === 1) return 'bg-gradient-to-r from-arcade-yellow/15 to-transparent border-l-2 border-arcade-yellow';
    if (r === 2) return 'bg-gradient-to-r from-arcade-blue/10 to-transparent border-l-2 border-arcade-blue';
    if (r === 3) return 'bg-gradient-to-r from-arcade-pink/15 to-transparent border-l-2 border-arcade-pink';
    return '';
  };

  return (
    <div className="glass rounded-2xl overflow-hidden border border-arcade-pink/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-arcade-pink/10">
        <div className="flex items-center gap-2"><span className="text-lg">🏆</span><h3 className="font-semibold text-text-primary text-sm">Leaderboard</h3></div>
        <div className="flex rounded-lg bg-bg-secondary p-0.5">
          {['session', 'week', 'all'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`min-h-[44px] sm:min-h-auto px-2 py-1 rounded-md text-[10px] font-bold transition-colors capitalize ${period === p ? 'bg-arcade-yellow/20 text-arcade-yellow' : 'text-text-muted'}`}>{p}</button>
          ))}
        </div>
      </div>
      <div className="max-h-[280px] overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="py-2 space-y-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-2.5 px-4 py-2">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="w-7 h-7 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="py-6 text-center text-text-muted text-sm">No rankings yet</div>
        ) : entries.map((entry, i) => (
          <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className={`flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.02] transition-colors border-b border-arcade-pink/5 last:border-0 ${rankBg(entry.rank)}`}
          >
            <div className="w-6 flex justify-center">{rankIcon(entry.rank)}</div>
            <img src={entry.avatar_url} alt={entry.username} className="w-7 h-7 rounded-full border border-arcade-pink/10" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-text-primary truncate">{entry.username}</span>
                {entry.streak >= 5 && <span className="flex items-center gap-0.5 text-[9px]"><Flame className="w-2.5 h-2.5 text-arcade-orange" /> {entry.streak}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-arcade-green" /><span className="text-xs font-bold text-text-primary">{entry.total_points.toLocaleString()}</span></div>
          </motion.div>
        ))}
      </div>
      {user && profile && (
        <div className="px-4 py-2.5 border-t border-arcade-pink/10 bg-arcade-purple/5">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] text-text-muted">You</span>
            <img src={profile.avatar_url} alt={profile.username} className="w-6 h-6 rounded-full border border-arcade-purple/40" />
            <span className="text-xs font-medium text-text-primary flex-1">{profile.username}</span>
            <span className="text-xs font-bold text-arcade-purple">{profile.points} pts</span>
          </div>
        </div>
      )}
    </div>
  );
}

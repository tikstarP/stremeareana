import { useState, useEffect } from 'react';
import { TrendingUp, Flame, Trophy, ArrowLeft, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import MoltenBackground from '../components/MoltenBackground';
import Navbar from '../components/Navbar';
import { Skeleton } from '../components/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../context/AppContext';
import type { LeaderboardEntry } from '../types';

const rankIcon = (r: number) => {
  if (r === 1) return <span className="text-lg">🥇</span>;
  if (r === 2) return <span className="text-lg">🥈</span>;
  if (r === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-xs text-text-muted font-mono w-5 text-center">#{r}</span>;
};

const rankBg = (r: number) => {
  if (r === 1) return 'bg-gradient-to-r from-arcade-yellow/15 to-transparent border-l-2 border-arcade-yellow';
  if (r === 2) return 'bg-gradient-to-r from-arcade-blue/10 to-transparent border-l-2 border-arcade-blue';
  if (r === 3) return 'bg-gradient-to-r from-arcade-pink/15 to-transparent border-l-2 border-arcade-pink';
  return '';
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { profile } = useApp();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}`).then(r => r.json()).then(data => setEntries(data)).catch(() => setEntries([])).finally(() => setLoading(false));
  }, [period]);

  const totalPlayers = entries.length;
  const topScore = entries[0]?.total_points || 0;

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <Navbar />
      <div className="relative z-10 pt-20 pb-12 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-arcade-yellow to-arcade-orange flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold break-words"><span className="gradient-text">Leaderboard</span></h1>
              <p className="text-xs text-neutral-400">Top players across all rooms</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
              <Users className="w-4 h-4 text-arcade-blue mb-1.5" />
              <p className="text-xl font-bold text-text-primary">{totalPlayers}</p>
              <p className="text-[10px] text-text-muted">Players</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
              <Trophy className="w-4 h-4 text-arcade-yellow mb-1.5" />
              <p className="text-xl font-bold text-text-primary">{topScore.toLocaleString()}</p>
              <p className="text-[10px] text-text-muted">Top Score</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] col-span-1 sm:col-span-1">
              <div className="flex rounded-lg bg-bg-secondary p-0.5 mt-1">
                {['session', 'week', 'all'].map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`flex-1 min-h-[36px] px-2 py-1 rounded-md text-[10px] font-bold transition-colors capitalize ${period === p ? 'bg-arcade-yellow/20 text-arcade-yellow' : 'text-text-muted hover:text-text-primary'}`}
                  >{p}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Ranking list */}
          <div className="bg-white/[0.03] rounded-2xl border border-arcade-pink/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-arcade-pink/10">
              <h3 className="text-sm font-semibold text-text-primary">Rankings</h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto no-scrollbar">
              {loading ? (
                <div className="py-2 space-y-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex items-center gap-2.5 px-4 py-2">
                      <Skeleton className="w-5 h-5" />
                      <Skeleton className="w-7 h-7 rounded-full" />
                      <div className="flex-1"><Skeleton className="h-3 w-20" /></div>
                      <Skeleton className="h-3 w-14" />
                    </div>
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <div className="py-10 text-center">
                  <Trophy className="w-10 h-10 mx-auto text-neutral-500 mb-2" />
                  <p className="text-sm text-neutral-400">No rankings yet</p>
                  <p className="text-xs text-neutral-500 mt-1">Play games to earn points and appear here</p>
                </div>
              ) : entries.map((entry, i) => (
                <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[0.02] transition-colors border-b border-arcade-pink/5 last:border-0 ${rankBg(entry.rank)}`}
                >
                  <div className="w-6 flex justify-center">{rankIcon(entry.rank)}</div>
                  <img src={entry.avatar_url} alt={entry.username} className="w-8 h-8 rounded-full border border-arcade-pink/10" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-text-primary truncate">{entry.username}</span>
                      {entry.streak >= 5 && (
                        <span className="flex items-center gap-0.5 text-[9px] text-arcade-orange">
                          <Flame className="w-2.5 h-2.5" /> {entry.streak}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-arcade-green" />
                    <span className="text-sm font-bold text-text-primary">{entry.total_points.toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            {user && profile && (
              <div className="px-4 py-3 border-t border-arcade-pink/10 bg-arcade-purple/5">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] text-text-muted">You</span>
                  <img src={profile.avatar_url} alt={profile.username} className="w-6 h-6 rounded-full border border-arcade-purple/40" />
                  <span className="text-xs font-medium text-text-primary flex-1">{profile.username}</span>
                  <span className="text-xs font-bold text-arcade-purple">{profile.points} pts</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

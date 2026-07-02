import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Trophy, Coins, Flame, LogOut, Settings, ChevronRight, Clock, Gamepad2, Palette, MessageSquare, ArrowRight } from 'lucide-react';
import MoltenBackground from '../components/MoltenBackground';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { Skeleton } from '../components/Skeleton';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchData = async () => {
      try {
        const [profileRes, scoresRes] = await Promise.all([
          fetch(`/api/profiles?userId=${user.id}`),
          fetch(`/api/games?userId=${user.id}`),
        ]);
        if (profileRes.ok) setProfile(await profileRes.json());
        if (scoresRes.ok) setScores(await scoresRes.json());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const stats = [
    { label: 'Coins', value: profile?.coins ?? 0, icon: Coins, color: 'text-arcade-yellow', bg: 'bg-arcade-yellow/10' },
    { label: 'Points', value: profile?.points ?? 0, icon: Trophy, color: 'text-arcade-purple', bg: 'bg-arcade-purple/10' },
    { label: 'Streak', value: profile?.streak ?? 0, icon: Flame, color: 'text-arcade-orange', bg: 'bg-arcade-orange/10' },
    { label: 'Games', value: scores.length, icon: Gamepad2, color: 'text-arcade-blue', bg: 'bg-arcade-blue/10' },
  ];

  const recentGames = scores.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent relative overflow-hidden">
        <MoltenBackground />
        <Navbar />
        <div className="relative z-10 pt-20 pb-12 px-4 max-w-4xl mx-auto">
          <div className="bg-white/[0.03] rounded-3xl p-6 mb-6 border border-arcade-pink/10">
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="w-16 h-16 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] space-y-2">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/[0.03] rounded-2xl overflow-hidden border border-arcade-pink/10">
              <div className="px-4 py-3 border-b border-arcade-pink/10">
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/[0.03] rounded-2xl overflow-hidden border border-arcade-pink/10">
              <div className="px-4 py-3 border-b border-arcade-pink/10">
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="w-4 h-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <Navbar />
      <Toast />
      <div className="relative z-10 pt-20 pb-12 px-4 max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] rounded-3xl p-6 mb-6 border border-arcade-pink/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-arcade-pink to-arcade-blue flex items-center justify-center glow-pink">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-xl font-bold text-text-primary">{profile?.username || user?.email?.split('@')[0]}</h1>
              <p className="text-sm text-neutral-400">{user?.email}</p>
            </div>
            <button onClick={handleSignOut} className="p-2 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-arcade-pink transition-colors min-h-[44px] sm:min-h-auto min-w-[44px] sm:min-w-auto flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`${s.bg} rounded-xl p-4 border border-white/[0.06]`}
              >
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <p className="text-2xl font-bold text-text-primary">{s.value.toLocaleString()}</p>
                <p className="text-xs text-text-muted">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Games */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/[0.03] rounded-2xl overflow-hidden border border-arcade-pink/10">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-arcade-pink/10">
              <Gamepad2 className="w-4 h-4 text-arcade-blue" />
              <h3 className="font-semibold text-text-primary text-sm">Recent Games</h3>
            </div>
            <div className="max-h-[280px] overflow-y-auto no-scrollbar">
              {recentGames.length === 0 ? (
                <div className="p-6 text-center text-text-muted text-sm">No games played yet. Join a room to start!</div>
              ) : recentGames.map((g, i) => (
                <div key={g.id} className="flex items-center gap-3 px-4 py-3 border-b border-arcade-pink/5 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-arcade-blue/10 flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4 text-arcade-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary capitalize">{g.game_type}</p>
                    <p className="text-xs text-text-muted flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(g.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-bold text-arcade-yellow">{g.score} pts</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/[0.03] rounded-2xl overflow-hidden border border-arcade-pink/10">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-arcade-pink/10">
              <Settings className="w-4 h-4 text-arcade-purple" />
              <h3 className="font-semibold text-text-primary text-sm">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              <Link to="/join" className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-arcade-pink/10 to-arcade-blue/5 border border-arcade-pink/20 hover:border-arcade-pink/40 transition-all group min-h-[44px] sm:min-h-auto">
                <div className="w-10 h-10 rounded-xl bg-arcade-pink/20 flex items-center justify-center shrink-0"><MessageSquare className="w-5 h-5 text-arcade-pink" /></div>
                <div className="flex-1"><p className="text-sm font-medium text-text-primary">Join a Room</p><p className="text-xs text-text-muted">Enter a room code to play</p></div>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-arcade-pink transition-colors" />
              </Link>
              <Link to="/join" className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-arcade-yellow/10 to-arcade-orange/5 border border-arcade-yellow/20 hover:border-arcade-yellow/40 transition-all group min-h-[44px] sm:min-h-auto">
                <div className="w-10 h-10 rounded-xl bg-arcade-yellow/20 flex items-center justify-center shrink-0"><Palette className="w-5 h-5 text-arcade-yellow" /></div>
                <div className="flex-1"><p className="text-sm font-medium text-text-primary">Submit Art</p><p className="text-xs text-text-muted">Upload and get rated</p></div>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-arcade-yellow transition-colors" />
              </Link>
              <Link to="/leaderboard" className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-arcade-blue/10 to-arcade-purple/5 border border-arcade-blue/20 hover:border-arcade-blue/40 transition-all group min-h-[44px] sm:min-h-auto">
                <div className="w-10 h-10 rounded-xl bg-arcade-blue/20 flex items-center justify-center shrink-0"><Trophy className="w-5 h-5 text-arcade-blue" /></div>
                <div className="flex-1"><p className="text-sm font-medium text-text-primary">Leaderboard</p><p className="text-xs text-text-muted">See rankings</p></div>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-arcade-blue transition-colors" />
              </Link>
              <Link to="/settings" className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-arcade-purple/10 to-arcade-pink/5 border border-arcade-purple/20 hover:border-arcade-purple/40 transition-all group min-h-[44px] sm:min-h-auto">
                <div className="w-10 h-10 rounded-xl bg-arcade-purple/20 flex items-center justify-center shrink-0"><User className="w-5 h-5 text-arcade-purple" /></div>
                <div className="flex-1"><p className="text-sm font-medium text-text-primary">Settings</p><p className="text-xs text-text-muted">Edit profile</p></div>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-arcade-purple transition-colors" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

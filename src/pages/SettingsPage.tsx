import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Save, LogOut, KeyRound, Coins, Trophy, Calendar } from 'lucide-react';
import MoltenBackground from '../components/MoltenBackground';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../context/AppContext';
import { updateProfile } from '../lib/api';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { profile, refreshProfile, addToast } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState(profile?.username || '');
  const [saving, setSaving] = useState(false);
  const [showResetEmail, setShowResetEmail] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleSave = async () => {
    if (!user || !username.trim()) return;
    setSaving(true);
    try {
      await updateProfile(user.id, { username: username.trim() });
      await refreshProfile();
      addToast({ message: 'Profile updated!', type: 'success' });
    } catch {
      addToast({ message: 'Failed to update', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) { addToast({ message: 'Enter your email', type: 'error' }); return; }
    try {
      const { error } = await (await import('../lib/supabase')).default.auth.resetPasswordForEmail(resetEmail, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) throw error;
      addToast({ message: 'Password reset email sent!', type: 'success' });
      setShowResetEmail(false);
    } catch (err: unknown) {
      addToast({ message: err instanceof Error ? err.message : 'Failed to send reset email', type: 'error' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <Navbar />
      <Toast />
      <div className="relative z-10 pt-20 pb-12 px-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate(-1)}
            className="min-h-[44px] inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-text-primary transition-colors mb-6"
          ><ArrowLeft className="w-4 h-4" /> Back</button>

          {!user ? (
            <div className="bg-white/[0.03] rounded-2xl p-8 border border-arcade-pink/10 text-center">
              <p className="text-neutral-400 text-sm mb-4">Sign in to access your profile</p>
              <button onClick={() => navigate('/login')}
                className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-blue text-white font-semibold text-sm"
              >Sign In</button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="bg-white/[0.03] rounded-2xl p-6 border border-arcade-pink/10">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-arcade-purple to-arcade-blue flex items-center justify-center text-2xl font-bold text-white shrink-0">
                    {(profile?.username || user.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg font-bold text-text-primary truncate">{profile?.username || 'User'}</h1>
                    <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Joined {memberSince}</p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/[0.04] rounded-xl p-3 text-center">
                    <Coins className="w-4 h-4 text-arcade-yellow mx-auto mb-1" />
                    <p className="text-sm font-bold text-text-primary">{profile?.coins ?? 0}</p>
                    <p className="text-[9px] text-neutral-500">Coins</p>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-3 text-center">
                    <Trophy className="w-4 h-4 text-arcade-blue mx-auto mb-1" />
                    <p className="text-sm font-bold text-text-primary">{profile?.points ?? 0}</p>
                    <p className="text-[9px] text-neutral-500">Points</p>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-3 text-center">
                    <Calendar className="w-4 h-4 text-arcade-purple mx-auto mb-1" />
                    <p className="text-sm font-bold text-text-primary">{profile?.streak ?? 0}</p>
                    <p className="text-[9px] text-neutral-500">Day Streak</p>
                  </div>
                </div>
              </div>

              {/* Edit Username */}
              <div className="bg-white/[0.03] rounded-2xl p-6 border border-arcade-pink/10 space-y-4">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2"><User className="w-4 h-4 text-arcade-purple" /> Edit Profile</h3>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Username</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                    className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-purple/50 transition-all"
                  />
                </div>
                <button onClick={handleSave} disabled={saving || !username.trim()}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-blue text-white text-xs font-bold hover:opacity-90 disabled:opacity-30 transition-all flex items-center gap-2"
                >
                  {saving ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>

              {/* Password */}
              <div className="bg-white/[0.03] rounded-2xl p-6 border border-arcade-pink/10 space-y-4">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2"><KeyRound className="w-4 h-4 text-arcade-yellow" /> Password</h3>
                {showResetEmail ? (
                  <div className="space-y-3">
                    <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="Enter your email"
                      className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-yellow/50 transition-all"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setShowResetEmail(false)} className="min-h-[44px] px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-400 text-xs font-semibold">Cancel</button>
                      <button onClick={handleResetPassword} className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-arcade-yellow to-arcade-orange text-black text-xs font-bold">Send Reset Email</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowResetEmail(true)}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-arcade-yellow text-xs font-semibold transition-all"
                  >Reset Password</button>
                )}
              </div>

              {/* Sign out */}
              <button onClick={handleSignOut}
                className="w-full min-h-[44px] py-2.5 rounded-xl bg-white/[0.03] border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
              ><LogOut className="w-4 h-4" /> Sign Out</button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Save, LogOut, KeyRound } from 'lucide-react';
import MoltenBackground from '../components/MoltenBackground';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../context/AppContext';

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
      const res = await fetch('/api/profiles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });
      if (res.ok) {
        await refreshProfile();
        addToast({ message: 'Profile updated!', type: 'success' });
      } else {
        addToast({ message: 'Failed to update', type: 'error' });
      }
    } catch {
      addToast({ message: 'Network error', type: 'error' });
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
    } catch (err: any) {
      addToast({ message: err?.message || 'Failed to send reset email', type: 'error' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <Navbar />
      <Toast />
      <div className="relative z-10 pt-20 pb-12 px-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-arcade-purple to-arcade-blue flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold break-words"><span className="gradient-text">Settings</span></h1>
              <p className="text-xs text-neutral-400">Manage your profile and account</p>
            </div>
          </div>

          {!user ? (
            <div className="bg-white/[0.03] rounded-2xl p-8 border border-arcade-pink/10 text-center">
              <p className="text-neutral-400 text-sm mb-4">Sign in to access settings</p>
              <button onClick={() => navigate('/login')}
                className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-r from-arcade-orange to-arcade-yellow text-white font-semibold text-sm"
              >Sign In</button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Profile section */}
              <div className="bg-white/[0.03] rounded-2xl p-6 border border-arcade-pink/10 space-y-4">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2"><User className="w-4 h-4 text-arcade-purple" /> Profile</h3>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Username</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                    className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-purple/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Email</label>
                  <p className="text-sm text-text-primary bg-bg-secondary rounded-xl px-4 py-2.5 border border-arcade-pink/10">{user.email}</p>
                </div>
                <button onClick={handleSave} disabled={saving || !username.trim()}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-blue text-white text-xs font-bold hover:opacity-90 disabled:opacity-30 transition-all flex items-center gap-2"
                >
                  {saving ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>

              {/* Password section */}
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

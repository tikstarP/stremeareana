import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import MoltenBackground from '../components/MoltenBackground';
import Toast from '../components/Toast';
import { useApp } from '../context/AppContext';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setReady(true);
    } else {
      addToast({ message: 'Invalid or expired reset link', type: 'error' });
      setTimeout(() => navigate('/login'), 2000);
    }
  }, []);

  const handleReset = async () => {
    if (password.length < 6) { addToast({ message: 'Password must be at least 6 characters', type: 'error' }); return; }
    if (password !== confirm) { addToast({ message: 'Passwords do not match', type: 'error' }); return; }
    setLoading(true);
    try {
      const supabase = (await import('../lib/supabase')).default;
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      addToast({ message: 'Password updated! Redirecting...', type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      addToast({ message: err instanceof Error ? err.message : 'Failed to reset password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center relative overflow-hidden">
        <MoltenBackground />
        <div className="relative z-10 w-6 h-6 border-2 border-arcade-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <Toast />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="bg-white/[0.03] rounded-3xl p-8 border border-arcade-pink/10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-arcade-yellow to-arcade-orange flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold text-text-primary mb-2">Reset Password</h1>
              <p className="text-sm text-neutral-400">Enter your new password</p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="New password"
                  className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-3 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-yellow/50 transition-all"
                />
                <button onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto flex items-center justify-center text-neutral-400 hover:text-text-primary"
                >{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password"
                className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-yellow/50 transition-all"
              />
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleReset} disabled={loading || !password || !confirm}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-arcade-yellow to-arcade-orange text-black font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]"
              >
                {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full mx-auto" />
                : 'Reset Password'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

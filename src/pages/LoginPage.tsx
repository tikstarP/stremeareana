import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Zap, Eye, EyeOff, Bug } from 'lucide-react';
import supabase from '../lib/supabase';
import { enableDemoLogin } from '../contexts/AuthContext';
import MoltenBackground from '../components/MoltenBackground';
import Toast from '../components/Toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Fill in all fields'); return; }
    if (password.length < 6) { setError('Password must be 6+ characters'); return; }
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await fetch('/api/auth-callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: data.user.id, email }),
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate('/streamer');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <Toast />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-text-primary transition-colors mb-8 text-sm min-h-[44px] sm:min-h-auto">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="bg-white/[0.03] rounded-3xl p-8 border border-arcade-pink/10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-arcade-pink to-arcade-blue flex items-center justify-center mx-auto mb-4 glow-pink">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold text-text-primary mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-neutral-400 text-sm">
                {isSignUp ? 'Join the arena' : 'Sign in to continue'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-arcade-pink/10 border border-arcade-pink/30 text-arcade-pink text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address"
                  className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-pink/50 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (6+ chars)"
                  className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl pl-10 pr-10 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-pink/50 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary min-h-[44px] sm:min-h-auto min-w-[44px] sm:min-w-auto flex items-center justify-center">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-arcade-pink to-arcade-blue text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px] sm:min-h-auto"
              >
                {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                : isSignUp ? 'Create Account' : 'Sign In'}
              </motion.button>
            </form>

            <button onClick={() => { const u = enableDemoLogin(); if (u) navigate('/streamer'); }}
              className="w-full py-2.5 rounded-xl bg-arcade-yellow/5 border border-arcade-yellow/20 text-arcade-yellow text-xs font-bold hover:bg-arcade-yellow/10 transition-colors flex items-center justify-center gap-2 min-h-[44px] sm:min-h-auto mt-3"
            >
              <Bug className="w-3.5 h-3.5" /> Demo Login (offline)
            </button>

            <p className="text-center text-sm text-text-muted mt-6">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-arcade-pink font-medium hover:underline min-h-[44px] sm:min-h-auto">
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-text-muted mt-4">
            Demo: demo@streamarena.com / demo123456
          </p>
        </motion.div>
      </div>
    </div>
  );
}

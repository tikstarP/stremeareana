import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import supabase from '../lib/supabase';
import MoltenBackground from '../components/MoltenBackground';
import Toast from '../components/Toast';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (!tokenHash || type !== 'signup') {
      setStatus('error');
      setMessage('Invalid or missing verification link.');
      setLoading(false);
      return;
    }

    supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'signup' })
      .then(({ error }) => {
        if (error) {
          setStatus('error');
          setMessage(error.message || 'Verification failed. The link may have expired.');
        } else {
          setStatus('success');
          setMessage('Email verified! Redirecting...');
          setTimeout(() => navigate('/login?verified=1'), 2000);
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('An unexpected error occurred.');
      })
      .finally(() => setLoading(false));
  }, [searchParams, navigate]);

  if (loading && status === 'verifying') {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
        <MoltenBackground />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-arcade-purple animate-spin" />
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary mb-2">Verifying Email</h1>
          <p className="text-neutral-400">Please wait while we confirm your email address.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
      <MoltenBackground />
      <Toast />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8">
          <div className="text-center mb-8">
            {status === 'success' ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-arcade-green/15 border border-arcade-green/30 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-arcade-green" />
                </div>
                <h1 className="font-display text-2xl font-bold text-text-primary mb-2">Email Verified!</h1>
                <p className="text-neutral-400">{message}</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-arcade-pink/15 border border-arcade-pink/30 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-arcade-pink" />
                </div>
                <h1 className="font-display text-2xl font-bold text-text-primary mb-2">Verification Failed</h1>
                <p className="text-neutral-400">{message}</p>
              </>
            )}
          </div>

          <div className="space-y-3">
            {status === 'success' ? (
              <Link
                to="/login"
                className="block w-full min-h-[52px] px-6 py-3 rounded-xl bg-gradient-to-r from-arcade-orange to-arcade-yellow text-white font-bold text-center active:scale-[0.97] transition-transform touch-manipulation"
              >
                Go to Login
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block w-full min-h-[52px] px-6 py-3 rounded-xl bg-gradient-to-r from-arcade-orange to-arcade-yellow text-white font-bold text-center active:scale-[0.97] transition-transform touch-manipulation"
                >
                  Try Logging In
                </Link>
                <Link
                  to="/login?signup=1"
                  className="block w-full min-h-[52px] px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-text-primary font-bold text-center active:scale-[0.97] transition-all touch-manipulation"
                >
                  Resend Verification Email
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Gamepad2, Zap, ArrowRight, Sparkles } from 'lucide-react';
import MoltenBackground from '../components/MoltenBackground';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';

export default function EntryPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      const savedRole = localStorage.getItem('streamarena_role');
      navigate(savedRole === 'viewer' ? '/viewer' : '/streamer', { replace: true });
    }
  }, [user, loading, navigate]);

  const selectRole = (role: 'streamer' | 'viewer') => {
    localStorage.setItem('streamarena_role', role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <Toast />

      {/* ===== MOBILE HEADER (<768px) ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-bg-primary/90 backdrop-blur-[10px] border-b border-white/[0.06]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2 active:scale-[0.97] transition-transform duration-100">
            <Zap className="w-5 h-5 text-arcade-pink" />
            <span className="font-display font-bold text-sm tracking-wider">
              <span className="gradient-text">final</span><span className="text-text-primary">STREAm</span>
            </span>
          </Link>
          <Link to="/login" className="min-h-[44px] inline-flex items-center px-4 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-neutral-300 active:scale-[0.97] active:opacity-90 transition-all duration-100 touch-manipulation ">
            Sign In
          </Link>
        </div>
      </div>

      {/* ===== DESKTOP HEADER (≥768px) ===== */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-7 h-7 text-arcade-pink" />
            <span className="font-display font-bold text-xl tracking-wider">
              <span className="gradient-text">final</span><span className="text-text-primary">STREAm</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-4 py-1.5 rounded-lg bg-white/[0.03] border border-arcade-pink/20 text-sm text-text-primary hover:border-arcade-pink/50 transition-all">Sign In</Link>
          </div>
        </div>
      </div>

      {/* ===== MOBILE HERO + ROLE CARDS (<768px) — viewer-first ===== */}
      <section className="md:hidden relative flex flex-col justify-center min-h-[85dvh] pt-16 pb-4 px-4"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-lg mx-auto w-full flex flex-col justify-center flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-arcade-pink/30 mb-5 w-fit mx-auto">
            <Sparkles className="w-3 h-3 text-arcade-blue" />
            <span className="text-xs text-neutral-400">Welcome to finalSTREAm</span>
          </div>

          <h1 className="font-display text-[32px] leading-tight font-black text-center mb-3">
            <span className="text-text-primary">Where Live Streaming</span><br />
            <span className="gradient-text">Meets Interactive Play</span>
          </h1>

          <p className="text-base text-neutral-400 text-center mb-8 leading-relaxed">
            Streamers host, viewers play — all in real time.
          </p>

          {/* Viewer — Primary CTA */}
          <button onClick={() => selectRole('viewer')}
            className="w-full min-h-[52px] inline-flex items-center justify-center gap-3 rounded-xl text-base font-bold active:scale-[0.97] active:opacity-90 transition-all duration-100 touch-manipulation mb-3"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#000' }}
          >
            <Gamepad2 className="w-5 h-5" /> I'm a Viewer <ArrowRight className="w-5 h-5" />
          </button>

          {/* Streamer — Secondary */}
          <button onClick={() => selectRole('streamer')}
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] text-neutral-300 text-sm font-semibold active:scale-[0.97] active:opacity-90 transition-all duration-100 touch-manipulation "
          >
            <Crown className="w-4 h-4" /> I'm a Streamer
          </button>

          <p className="text-center text-xs text-neutral-500 mt-2">
            💡 Streamer tools work best on desktop
          </p>

          <p className="text-center text-sm text-neutral-500 mt-6">~12,000+ creators hosting interactive streams daily</p>
        </div>
      </section>

      {/* ===== MOBILE FOOTER (<768px) ===== */}
      <footer className="md:hidden border-t border-white/[0.06] px-4 py-8">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <p className="text-xs text-neutral-500">Free to use. No downloads. No setup. You can always switch roles later.</p>
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-arcade-pink" />
            <span className="font-display font-bold text-sm"><span className="gradient-text">final</span>STREAm</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link to="/terms" className="text-neutral-500 active:text-neutral-300 transition-colors duration-100 min-h-[44px] inline-flex items-center">Terms</Link>
            <Link to="/privacy" className="text-neutral-500 active:text-neutral-300 transition-colors duration-100 min-h-[44px] inline-flex items-center">Privacy</Link>
            <Link to="/contact" className="text-neutral-500 active:text-neutral-300 transition-colors duration-100 min-h-[44px] inline-flex items-center">Contact</Link>
          </div>
          <p className="text-xs text-neutral-600">© 2026 finalSTREAm. All rights reserved.</p>
        </div>
      </footer>      {/* ===== DESKTOP HERO (≥768px) ===== */}
      <section className="hidden md:block relative min-h-screen flex items-center justify-center pt-24 sm:pt-32 pb-16">
        <div className="relative z-10 text-center px-4 sm:px-6 w-full max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-arcade-pink/30 mb-8"
          >
            <Sparkles className="w-4 h-4 text-arcade-blue" />
            <span className="text-sm text-neutral-400">Welcome to finalSTREAm</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-8"
          >
            <span className="text-text-primary">Where Live Streaming</span><br />
            <span className="gradient-text text-glow-pink">Meets Interactive Play</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg text-neutral-300 max-w-3xl mx-auto mb-6 leading-relaxed"
          >
            finalSTREAm is an interactive live streaming platform where viewers don't just watch — they play, create, compete, and become part of the show.
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }}
            className="text-sm sm:text-base text-neutral-400 max-w-3xl mx-auto mb-6 leading-relaxed"
          >
            Streamers get powerful tools to host, moderate, and engage their community like never before.— all from their browser, no downloads needed.
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xs text-neutral-500 max-w-3xl mx-auto"
          >
            ~12,000+ creators hosting interactive streams daily
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35 }} className="mt-10">
            <a href="#choose-path" className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-arcade-pink via-arcade-blue to-arcade-blue text-white font-semibold text-sm sm:text-base hover:scale-105 transition-all shadow-lg shadow-arcade-pink/20 w-full sm:w-auto">
              Choose Your Path <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }} className="mt-8 sm:mt-12">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="flex justify-center">
              <div className="w-6 h-10 rounded-full border border-text-muted flex items-start justify-center p-1.5">
                <div className="w-1 h-2.5 rounded-full bg-arcade-blue" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== DESKTOP "More Than Just a Stream" (≥768px) ===== */}
      <section className="hidden md:block relative z-10 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6 sm:mb-10">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="text-text-primary">More Than </span><span className="gradient-text">Just a Stream</span>
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              finalSTREAm was built for a new kind of live experience — one where the audience participates and the creator has full control.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {[
              { icon: Crown, title: 'For Streamers', desc: 'Full control to host, moderate, and customize your room.', border: 'border-arcade-purple/20', from: 'from-arcade-purple/10' },
              { icon: Gamepad2, title: 'For Viewers', desc: 'Play, create, chat, and climb the leaderboards live.', border: 'border-arcade-blue/15', from: 'from-arcade-blue/8' },
              { icon: Zap, title: 'Live & Interactive', desc: 'Real-time quizzes, art ratings, and queue battles.', border: 'border-arcade-pink/15', from: 'from-arcade-pink/8' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`bg-gradient-to-b ${item.from} ${item.border} border rounded-2xl p-6 sm:p-8 text-center space-y-5 max-w-sm mx-auto md:max-w-none`}
              >
                <item.icon className="w-10 h-10 mx-auto text-arcade-blue drop-shadow-[0_0_6px_rgba(99,102,241,0.3)_0_0_14px_rgba(139,92,246,0.4)]" />
                <h3 className="font-display text-lg font-bold text-text-primary">{item.title}</h3>
                <p className="text-base text-gray-300 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DESKTOP "Choose Your Path" (≥768px) ===== */}
      <section id="choose-path" className="hidden md:block relative z-10 pt-4 pb-16 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6 sm:mb-10">
            <h2 className="font-display text-2xl sm:text-4xl font-bold mb-3">
              <span className="text-text-primary">How Will You Use </span><span className="gradient-text">finalSTREAm</span><span className="text-text-primary">?</span>
            </h2>
            <p className="text-neutral-400 max-w-lg mx-auto">Pick your path and we'll show you everything built for you.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="group relative bg-gradient-to-b from-arcade-purple/15 to-transparent border border-arcade-purple/20 rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-arcade-purple/20 hover:border-arcade-purple/60 hover:from-arcade-purple/30 space-y-6">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-arcade-purple/30 to-arcade-blue/20 flex items-center justify-center shrink-0">
                    <Crown className="w-7 h-7 text-arcade-blue drop-shadow-[0_0_4px_rgba(99,102,241,0.3)_0_0_10px_rgba(139,92,246,0.4)]" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-text-primary mb-1">I'm a Streamer</h3>
                    <p className="text-sm text-zinc-300">Turn your audience into active participants.</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {[
                    'Host live interactive games',
                    'Custom OBS overlays & alerts',
                    'AI voice & sound triggers',
                  ].map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-arcade-purple mt-1.5 shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => selectRole('streamer')}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-blue text-white font-semibold text-sm hover:opacity-90 transition-opacity min-h-[44px]"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="group relative bg-gradient-to-b from-arcade-blue/10 to-transparent border border-arcade-blue/15 rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-arcade-blue/20 hover:border-arcade-blue/50 hover:from-arcade-blue/25 space-y-6">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-arcade-blue/20 to-arcade-purple/20 flex items-center justify-center shrink-0">
                    <Gamepad2 className="w-7 h-7 text-arcade-blue drop-shadow-[0_0_4px_rgba(99,102,241,0.3)_0_0_10px_rgba(139,92,246,0.4)]" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-text-primary mb-1">I'm a Viewer</h3>
                    <p className="text-sm text-zinc-300">Don't just watch the stream—be part of it.</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {[
                    'Play live mini-games',
                    'Submit art for live review',
                    'Trigger sounds & earn coins',
                  ].map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-arcade-blue mt-1.5 shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => selectRole('viewer')}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-arcade-blue to-arcade-purple text-white font-semibold text-sm hover:opacity-90 transition-opacity min-h-[44px]"
                >
                  Jump In <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-6 text-xs text-neutral-400">
            Free to use. No downloads. No setup. You can always switch roles later.
          </motion.p>
        </div>
      </section>

      {/* ===== DESKTOP FOOTER (≥768px) ===== */}
      <footer className="hidden md:block relative z-10 border-t border-arcade-pink/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-arcade-pink" />
            <span className="font-display font-bold text-sm"><span className="gradient-text">final</span>STREAm</span>
          </div>
          <p className="text-xs text-neutral-400">© 2026 finalSTREAm. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-neutral-400 hover:text-arcade-blue transition-colors">Privacy</Link>
            <Link to="/terms" className="text-xs text-neutral-400 hover:text-arcade-blue transition-colors">Terms</Link>
            <Link to="/contact" className="text-xs text-neutral-400 hover:text-arcade-blue transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}



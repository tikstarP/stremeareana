import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Users, Globe, Shield, ArrowRight, Zap, Radio, Gamepad2, Palette, Trophy, Volume2, Monitor, Crown, Play, Star, ChevronDown, DoorOpen, QrCode } from 'lucide-react';
import type { RoomData } from '../types';
import MoltenBackground from '../components/MoltenBackground';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import FloatingAssistant from '../components/FloatingAssistant';
import MobileLandingPage from '../mobile/MobileLandingPage';

const streamerFeatures = [
  { icon: Crown, title: 'Live Control Panel', desc: 'Start rounds, manage the queue, pick next players, and control games in real time from your dashboard.' },
  { icon: Monitor, title: 'OBS Overlay', desc: 'Built-in overlay with countdown timer, queue list, winner alerts, art display, and leaderboard for your broadcast.' },
  { icon: Volume2, title: 'Sound & AI Voice', desc: 'Trigger sound effects, control volume, and let the AI host announce players and winners automatically.' },
  { icon: Shield, title: 'Safe & Moderated', desc: 'Built-in moderation modes — Safe, Review, or Loose. Keep your stream family friendly or free flowing.' },
  { icon: Star, title: 'Coin Economy', desc: 'Priority queue pricing, coin rewards for participation, and a full queue economy controlled by the streamer.' },
  { icon: Trophy, title: 'Leaderboards', desc: 'Earn points for participation, wins, and art. Track your streak and dominate the rankings.' },
];

const viewerFeatures = [
  { icon: Gamepad2, title: 'Mini Games', desc: 'Quiz, guess the number, fastest finger. Compete live and climb the leaderboard. More games coming soon.' },
  { icon: Palette, title: 'Art Arena', desc: 'Upload your art, get rated by the streamer, see your creation on the OBS overlay in real time.' },
  { icon: Trophy, title: 'Leaderboards', desc: 'Earn points for participation, wins, and art. Track your streak and dominate the rankings.' },
  { icon: Radio, title: 'Live Rooms', desc: 'Browse and join active rooms. Watch the stream, interact, and play along in real time.' },
  { icon: Zap, title: 'Quick Queue', desc: 'Get in line to play games or submit art. Priority queue with coins for faster access.' },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div layout className="group rounded-xl border border-arcade-blue/10 bg-white/[0.02] overflow-hidden transition-all duration-300 hover:border-arcade-blue/20">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left min-h-[44px] sm:min-h-auto">
        <span className="text-sm font-semibold text-zinc-200">{question}</span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-4 text-xs text-neutral-400 leading-relaxed">{answer}</p>
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage({ role }: { role: 'streamer' | 'viewer' }) {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [totalViewers, setTotalViewers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('/api/rooms').then(r => {
      if (!r.ok) throw new Error('Failed to fetch');
      return r.json();
    }).then(data => {
      setRooms(data);
      setTotalViewers(data.reduce((sum: number, r: RoomData) => sum + (r.viewer_count || 0), 0));
      setApiError(false);
    }).catch(() => {
      setRooms([]);
      setTotalViewers(null);
      setApiError(true);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <Toast />

      <div className="md:hidden">
        <MobileLandingPage totalViewers={totalViewers} loading={loading} apiError={apiError} rooms={rooms} role={role} />
      </div>

      {/* ===== DESKTOP LAYOUT (≥768px) ===== */}
      <div className="hidden md:block">
        <Navbar />

        <section ref={heroRef} className="relative min-h-[55vh] md:min-h-screen flex items-center justify-center pt-16 md:pt-16 md:pb-24">
          <motion.div style={{ y, opacity }} className="relative z-20 text-center px-4 max-w-5xl mx-auto pointer-events-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-arcade-pink/30 mb-4 md:mb-8"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-arcade-green animate-pulse" />
                  <span className="w-32 h-4 rounded bg-white/10 animate-pulse" />
                </span>
              ) : apiError ? (
                <span className="flex items-center gap-2 text-arcade-blue">
                  <span className="w-2 h-2 rounded-full bg-arcade-blue" />
                  <span className="text-sm">Server unreachable — try again later</span>
                </span>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-arcade-green animate-pulse" />
                  <span className="text-sm text-neutral-400">Live platform — {totalViewers?.toLocaleString() ?? 0} viewers online</span>
                </>
              )}
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-[32px] sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight mb-3 sm:mb-6"
            >
              {role === 'viewer' ? (
                <>
                  <span className="text-text-primary">PLAY ALONG WITH</span><br />
                  <span className="gradient-text text-glow-pink">THE LIVE STREAM</span>
                </>
              ) : (
                <>
                  <span className="text-text-primary">THE FUTURE OF</span><br />
                  <span className="gradient-text text-glow-pink">LIVE STREAMING</span>
                </>
              )}
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="text-sm sm:text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mb-5 md:mb-10 leading-relaxed px-2 sm:px-0"
            >
              {role === 'viewer'
                ? 'Jump into any live room and play mini-games, submit art, trigger sounds, and compete on leaderboards — no downloads, no account needed.'
                : 'Host interactive games, manage queues, moderate art, and engage your audience — all from your browser, no downloads needed.'}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {role === 'streamer' ? (
                <>
                  <Link to="/create-room" className="group relative px-6 py-3 sm:px-8 sm:py-4 rounded-xl bg-gradient-to-r from-arcade-pink via-arcade-blue to-arcade-blue text-white font-semibold text-sm sm:text-lg overflow-hidden transition-all hover:scale-105 min-h-[44px] sm:min-h-auto inline-flex items-center">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative flex items-center gap-2">Create Your Room <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                  </Link>
                  <a href="#how-it-works" className="px-6 py-3 sm:px-8 sm:py-4 rounded-xl bg-white/[0.03] border border-arcade-pink/10 text-text-primary font-semibold text-sm sm:text-lg hover:border-arcade-pink/40 transition-colors min-h-[44px] sm:min-h-auto inline-flex items-center">How It Works</a>
                </>
              ) : (
                <>
                  <Link to="/join" className="group relative px-6 py-3 sm:px-8 sm:py-4 rounded-xl bg-gradient-to-r from-arcade-pink via-arcade-blue to-arcade-blue text-white font-semibold text-sm sm:text-lg overflow-hidden transition-all hover:scale-105 min-h-[44px] sm:min-h-auto inline-flex items-center">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative flex items-center gap-2">Join a Room <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                  </Link>
                  <a href="#features" className="px-6 py-3 sm:px-8 sm:py-4 rounded-xl bg-white/[0.03] border border-arcade-pink/10 text-text-primary font-semibold text-sm sm:text-lg hover:border-arcade-pink/40 transition-colors min-h-[44px] sm:min-h-auto inline-flex items-center">Explore Features</a>
                </>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }} className="mt-6 md:mt-16 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-neutral-400">
              {loading ? (
                <div className="flex items-center gap-2"><Users className="w-4 h-4 sm:w-5 sm:h-5" /><span className="w-16 h-4 rounded bg-white/10 animate-pulse" /></div>
              ) : (
                <div className="flex items-center gap-2"><Users className="w-4 h-4 sm:w-5 sm:h-5" /><span className="text-xs sm:text-sm">{totalViewers?.toLocaleString() ?? '—'}+ Viewers</span></div>
              )}
              <div className="hidden sm:block w-1 h-1 rounded-full bg-neutral-600" />
              {loading ? (
                <div className="flex items-center gap-2"><Globe className="w-4 h-4 sm:w-5 sm:h-5" /><span className="w-16 h-4 rounded bg-white/10 animate-pulse" /></div>
              ) : (
                <div className="flex items-center gap-2"><Globe className="w-4 h-4 sm:w-5 sm:h-5" /><span className="text-xs sm:text-sm">{apiError ? '—' : rooms.length} Live Rooms</span></div>
              )}
              <div className="hidden sm:block w-1 h-1 rounded-full bg-neutral-600" />
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 sm:w-5 sm:h-5" /><span className="text-xs sm:text-sm">Safe & Secure</span></div>
            </motion.div>

          </motion.div>
        </section>

        {role === 'viewer' ? (
        <section className="relative z-10 py-8 md:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6 md:mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-text-primary">Live </span><span className="gradient-text">Rooms</span>
              </h2>
              <p className="text-neutral-400">Jump into an active room right now</p>
            </motion.div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gradient-to-b from-arcade-purple/10 to-transparent rounded-2xl p-5 border border-arcade-purple/15 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 rounded bg-white/10" />
                        <div className="h-3 w-16 rounded bg-white/5" />
                      </div>
                      <div className="w-10 h-5 rounded-full bg-white/5" />
                    </div>
                    <div className="h-8 w-full rounded bg-white/5 mb-3" />
                    <div className="h-3 w-20 rounded bg-white/5" />
                  </div>
                ))}
              </div>
            ) : apiError ? (
              <div className="text-center py-12">
                <Radio className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
                <p className="text-neutral-400 text-sm">Unable to load live rooms right now</p>
              </div>
            ) : rooms.filter(r => r.is_live).length === 0 ? (
              <div className="text-center py-12">
                <Radio className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
                <p className="text-neutral-400 text-sm">No live rooms at the moment</p>
                <p className="text-neutral-400 text-xs mt-1">Create one or check back later</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.filter(r => r.is_live).map((room, i) => (
                  <motion.div key={room.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Link to={`/room/${room.code}`} className="block bg-gradient-to-b from-arcade-purple/10 to-transparent rounded-2xl p-5 border border-arcade-purple/15 hover:border-arcade-purple/30 transition-all group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arcade-purple/20 to-arcade-blue/20 flex items-center justify-center">
                          <Radio className="w-5 h-5 text-arcade-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-text-primary text-sm truncate">{room.name}</h3>
                          <span className="text-xs font-mono text-arcade-pink">{room.code}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-arcade-green/10 border border-arcade-green/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-arcade-green animate-pulse" />
                          <span className="text-[10px] text-arcade-green font-bold">{room.viewer_count}</span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-400 line-clamp-2 mb-3">{room.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-neutral-400">Tap to join →</span>
                        <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-arcade-blue transition-colors" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
        ) : (
        <section className="relative z-10 py-8 md:py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-gradient-to-b from-arcade-purple/10 via-arcade-blue/5 to-transparent border border-arcade-purple/20 rounded-3xl p-8 md:p-12 text-center"
            >
              <Crown className="w-12 h-12 mx-auto text-arcade-blue mb-4 drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
                <span className="text-text-primary">Ready to </span><span className="gradient-text">Go Live?</span>
              </h2>
              <p className="text-neutral-400 max-w-lg mx-auto mb-6">
                Create your room in seconds. Share your code, start rounds, and let your viewers play along — no setup, no downloads.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/create-room" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-blue text-white font-semibold text-base hover:opacity-90 transition-opacity min-h-[44px] sm:min-h-auto inline-flex items-center gap-2">
                  <Play className="w-4 h-4" /> Create Your Room
                </Link>
                <Link to="/create-room" className="px-8 py-3.5 rounded-xl bg-white/[0.03] border border-arcade-pink/10 text-text-primary font-semibold text-base hover:border-arcade-pink/40 transition-colors min-h-[44px] sm:min-h-auto inline-flex items-center gap-2">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
        )}

        <section id="features" className="relative z-10 py-8 md:py-24 px-4 scroll-mt-24">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 md:mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-arcade-purple/10 border border-arcade-purple/20 text-[11px] text-arcade-blue font-semibold mb-4">
                {role === 'streamer' ? <Crown className="w-3 h-3" /> : <Gamepad2 className="w-3 h-3" />}
                For {role === 'streamer' ? 'Streamers' : 'Viewers'}
              </div>
              <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="text-text-primary">{role === 'streamer' ? 'Everything You Need to ' : 'Everything You Need to '}</span>
                <span className="gradient-text">{role === 'streamer' ? 'Go Live' : 'Play Along'}</span>
              </h2>
              <p className="text-neutral-400 max-w-xl mx-auto">
                {role === 'streamer' ? 'Tools built for streamers. No setup, no downloads, just a link to share.' : 'Jump into the action. No account needed to start playing.'}
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(role === 'streamer' ? streamerFeatures : viewerFeatures).map((f, i) => (
                <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="group relative bg-gradient-to-b from-arcade-purple/10 to-transparent border border-arcade-purple/15 rounded-2xl p-6 md:p-5 transition-all duration-300 hover:border-arcade-purple/30 hover:from-arcade-purple/15"
                >
                  <div className="relative w-fit mb-3">
                    <f.icon className="w-5 h-5 text-arcade-blue drop-shadow-[0_0_4px_rgba(99,102,241,0.3)_0_0_10px_rgba(139,92,246,0.4)]" />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-arcade-purple shadow-[0_0_6px_var(--color-arcade-purple)] animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-text-primary mb-1.5">{f.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{f.desc}</p>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-arcade-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
            {role === 'streamer' && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="mt-8 md:mt-12 bg-gradient-to-r from-arcade-purple/8 via-arcade-blue/8 to-transparent border border-arcade-blue/15 rounded-2xl p-5 max-w-2xl mx-auto"
              >
                <h3 className="text-sm font-bold text-arcade-blue mb-3 flex items-center gap-2"><Zap className="w-4 h-4" /> Quick Start</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { num: '1', title: 'Create Room', desc: 'Set name, game, moderation' },
                    { num: '2', title: 'Share Code', desc: 'Give viewers your @CODE' },
                    { num: '3', title: 'Go Live', desc: 'Manage queue & start rounds' },
                  ].map(s => (
                    <div key={s.num} className="flex items-center gap-2.5 bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-arcade-purple to-arcade-blue text-white text-[11px] font-bold flex items-center justify-center shrink-0">{s.num}</div>
                      <div>
                        <p className="text-xs font-semibold text-text-primary">{s.title}</p>
                        <p className="text-[10px] text-neutral-500">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-6 md:mt-10 flex flex-col items-center gap-3">
              {role === 'streamer' ? (
                <Link to="/create-room" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-blue text-white font-semibold text-base hover:opacity-90 transition-opacity min-h-[44px] sm:min-h-auto">
                  <Play className="w-4 h-4" /> Start Your Room
                </Link>
              ) : (
                <Link to="/join" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-blue text-white font-semibold text-base hover:opacity-90 transition-opacity min-h-[44px] sm:min-h-auto">
                  <ArrowRight className="w-4 h-4" /> Join a Room
                </Link>
              )}
              <button onClick={() => { localStorage.setItem('streamarena_role', role === 'streamer' ? 'viewer' : 'streamer'); navigate(`/${role === 'streamer' ? 'viewer' : 'streamer'}`); }} className="text-[11px] text-neutral-400 hover:text-arcade-blue transition-colors underline underline-offset-2 min-h-[44px] sm:min-h-auto">
                {role === 'streamer' ? 'Not a streamer? Switch to Viewer →' : 'Not a viewer? Switch to Streamer →'}
              </button>
            </motion.div>
            {role === 'viewer' && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="mt-8 md:mt-12 text-center"
              >
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.03] border border-arcade-green/30 bg-arcade-green/5">
                  <Zap className="w-4 h-4 text-arcade-green" />
                  <span className="text-xs sm:text-sm text-arcade-green font-medium break-words">No account needed. Just enter a room code and play.</span>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        <section id="how-it-works" className="relative z-10 py-8 md:py-24 px-4 scroll-mt-24">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6 md:mb-14">
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-text-primary">How It </span><span className="gradient-text">Works</span>
              </h2>
              <p className="text-neutral-400 max-w-lg mx-auto">{role === 'viewer' ? 'No account needed. Just enter a code and start playing.' : 'Get started in minutes. No downloads, no setup.'}</p>
            </motion.div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${role === 'viewer' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
              {(role === 'viewer' ? [
                { step: '01', icon: Radio, title: 'Enter a Code', desc: 'Type in a 6-character room code shared by the streamer. No sign-up required.' },
                { step: '02', icon: Gamepad2, title: 'Play & Compete', desc: 'Join mini-game rounds, submit art, and interact with the stream in real time.' },
                { step: '03', icon: Trophy, title: 'Earn Points', desc: 'Win games and get rated on your art to earn points and climb the leaderboard.' },
              ] : [
                { step: '01', icon: DoorOpen, title: 'Create Room', desc: 'Set up your room with a name, game mode, and moderation settings in seconds. Choose Safe, Review, or Loose moderation.' },
                { step: '02', icon: QrCode, title: 'Share Code', desc: 'Share your 6-character room code or QR with viewers on stream or Discord. They jump in instantly — no account needed.' },
                { step: '03', icon: Play, title: 'Go Live', desc: 'Start rounds, manage the queue, and let viewers play games, submit art, and trigger sounds from your dashboard.' },
                { step: '04', icon: Trophy, title: 'Engage & Grow', desc: 'Rate art, give AI shoutouts to top players, and build a community that keeps coming back to your room.' },
              ]).map((item, i) => (
                <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="relative bg-gradient-to-t from-arcade-blue/8 to-transparent border border-arcade-blue/15 rounded-2xl p-6 text-center transition-all duration-300 hover:border-arcade-blue/30 hover:from-arcade-blue/12"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-arcade-purple to-arcade-blue text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    Step {item.step}
                  </div>
                  <div className="relative w-fit mx-auto mb-4 mt-2">
                    <item.icon className="w-6 h-6 text-arcade-blue" />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-arcade-purple shadow-[0_0_8px_var(--color-arcade-purple)] animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-text-primary mb-2">{item.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="art" className="relative z-10 py-8 md:py-20 px-4 scroll-mt-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-6 md:gap-10 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                  <span className="text-text-primary">Fan Art </span><span className="gradient-text">Creativity</span>
                </h2>
                <p className="text-neutral-400 mb-5 leading-relaxed text-sm">{role === 'viewer' ? 'Submit artwork during a live stream. The streamer rates it on air — and you earn points.' : 'Review and rate viewer artwork live on stream. Submissions appear on your OBS overlay in real time.'}</p>
                <ul className="space-y-2 mb-6">
                  {['Upload in seconds', 'Live streamer review & rating', 'Featured on OBS overlay', 'Earn points & badges'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-neutral-300 text-sm">
                      <div className="w-4 h-4 rounded-full bg-arcade-green/20 flex items-center justify-center"><Star className="w-2.5 h-2.5 text-arcade-green" /></div>{item}
                    </li>
                  ))}
                </ul>
                <Link to={role === 'streamer' ? '/create-room' : '/join'} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-blue text-white font-semibold text-sm hover:opacity-90 transition-opacity min-h-[44px] sm:min-h-auto">
                  {role === 'streamer' ? 'Go to Dashboard' : 'Try Art Arena'} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-square rounded-xl overflow-hidden border border-arcade-purple/30"><img src="/art/showcase-1.png" alt="Art" className="w-full h-full object-cover" /></div>
                  <div className="aspect-square rounded-xl overflow-hidden border border-arcade-blue/30"><img src="/art/showcase-2.png" alt="Art" className="w-full h-full object-cover" /></div>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-arcade-pink/10 via-arcade-blue/10 to-arcade-blue/10 blur-3xl -z-10" />
              </motion.div>
            </div>
          </div>
        </section>

        {role === 'viewer' && (
        <section className="relative z-10 py-8 md:py-16 px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { value: '~45K', label: 'Games Played Today', icon: Gamepad2 },
                  { value: '~12K', label: 'Art Pieces Submitted', icon: Palette },
                  { value: '~3.2K', label: 'Players Online', icon: Users },
                ].map((stat) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="text-center p-3 sm:p-4 rounded-xl bg-gradient-to-b from-arcade-blue/8 to-transparent border border-arcade-blue/15"
                  >
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1.5 sm:mb-2 text-arcade-blue" />
                    <div className="text-lg sm:text-2xl font-bold gradient-text mb-0.5 sm:mb-1">{stat.value}</div>
                    <div className="text-[10px] sm:text-[11px] text-neutral-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {role === 'viewer' && (
        <section id="faq" className="relative z-10 py-8 md:py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6 md:mb-10">
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
                <span className="text-text-primary">Frequently Asked </span><span className="gradient-text">Questions</span>
              </h2>
              <p className="text-neutral-400 text-sm">Everything you need to know before joining</p>
            </motion.div>
            <div className="space-y-3">
              {[
                { q: 'Do I need an account to play?', a: 'No. Just enter a 6-character room code shared by the streamer and you\'re in. No sign-up, no email, no password.' },
                { q: 'Is it free?', a: 'Yes — joining rooms, playing mini-games, submitting art, and basic queue access are completely free. Priority queue uses coins earned from participation.' },
                { q: 'How do I join a room?', a: 'Ask the streamer for their room code, enter it on the Join page, and you\'ll be connected instantly. You can also browse active rooms from the Live Rooms section.' },
                { q: 'What kind of games are there?', a: 'Pixel Quiz, Arcade Guess, Button Mash, and Art Rating — with more being added. Games run live during the stream and the streamer controls when they start.' },
                { q: 'Can I submit my own art?', a: 'Yes — upload your artwork during a live stream. The streamer can review and rate it on air, and it gets displayed on the OBS overlay.' },
                { q: 'How do leaderboards work?', a: 'You earn points by winning games and getting your art rated. Points accumulate weekly and rankings reset periodically. Top players get recognized on stream.' },
              ].map((faq) => (
                <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>
        )}

        <footer className="relative z-10 border-t border-arcade-pink/10 pt-14 pb-6 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-10">
              <div className="col-span-2 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-arcade-pink" />
                  <span className="font-display font-bold text-lg"><span className="gradient-text">final</span>STREAm</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mb-4">Interactive live streaming platform. Join rooms, play games, submit art, and compete on leaderboards — all from your browser.</p>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-arcade-blue hover:border-arcade-blue/30 transition-all cursor-pointer min-w-[44px] sm:min-w-auto">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                  </span>
                  <span className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-arcade-blue hover:border-arcade-blue/30 transition-all cursor-pointer min-w-[44px] sm:min-w-auto">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                  </span>
                  <span className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-arcade-blue hover:border-arcade-blue/30 transition-all cursor-pointer min-w-[44px] sm:min-w-auto">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
                  </span>
                  <span className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-arcade-blue hover:border-arcade-blue/30 transition-all cursor-pointer min-w-[44px] sm:min-w-auto">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4">Platform</h4>
                <ul className="space-y-3">
                  <li><Link to="/join" className="text-xs text-neutral-400 hover:text-arcade-blue transition-colors min-h-[44px] sm:min-h-auto inline-flex items-center">Join a Room</Link></li>
                  <li><Link to="/create-room" className="text-xs text-neutral-400 hover:text-arcade-blue transition-colors min-h-[44px] sm:min-h-auto inline-flex items-center">Create Room</Link></li>
                  <li><Link to="/login" className="text-xs text-neutral-400 hover:text-arcade-blue transition-colors min-h-[44px] sm:min-h-auto inline-flex items-center">Sign In</Link></li>
                  <li><Link to="/settings" className="text-xs text-neutral-400 hover:text-arcade-blue transition-colors min-h-[44px] sm:min-h-auto inline-flex items-center">Settings</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4">Explore</h4>
                <ul className="space-y-3">
                  <li><a href="#features" className="text-xs text-neutral-400 hover:text-arcade-blue transition-colors min-h-[44px] sm:min-h-auto inline-flex items-center">Features</a></li>
                  <li><a href="#how-it-works" className="text-xs text-neutral-400 hover:text-arcade-blue transition-colors min-h-[44px] sm:min-h-auto inline-flex items-center">How It Works</a></li>
                  <li><Link to="/join" className="text-xs text-neutral-400 hover:text-arcade-blue transition-colors min-h-[44px] sm:min-h-auto inline-flex items-center">Live Rooms</Link></li>
                  <li><a href="#art" className="text-xs text-neutral-400 hover:text-arcade-blue transition-colors min-h-[44px] sm:min-h-auto inline-flex items-center">Art Arena</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4">Company</h4>
                <ul className="space-y-3">
                  <li><Link to="/about" className="text-xs text-neutral-400 hover:text-arcade-blue transition-colors min-h-[44px] sm:min-h-auto inline-flex items-center">About</Link></li>
                  <li><Link to="/leaderboard" className="text-xs text-neutral-400 hover:text-arcade-blue transition-colors min-h-[44px] sm:min-h-auto inline-flex items-center">Leaderboard</Link></li>
                  <li><Link to="/contact" className="text-xs text-neutral-400 hover:text-arcade-blue transition-colors min-h-[44px] sm:min-h-auto inline-flex items-center">Contact</Link></li>
                  <li><Link to="/privacy" className="text-xs text-neutral-400 hover:text-arcade-blue transition-colors min-h-[44px] sm:min-h-auto inline-flex items-center">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-xs text-neutral-400 hover:text-arcade-blue transition-colors min-h-[44px] sm:min-h-auto inline-flex items-center">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            <div className="relative pt-6 border-t border-zinc-800/50">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-px bg-gradient-to-r from-transparent via-arcade-pink/30 to-transparent" />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-neutral-500">© 2026 finalSTREAm. All rights reserved.</p>
                <p className="text-[11px] text-neutral-500">Built for streamers & players who love interactive live content.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <FloatingAssistant role={role} />
    </div>
  );
}

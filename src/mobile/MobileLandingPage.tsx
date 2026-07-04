import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowRight, Radio, Gamepad2, Palette, Users, Star, Zap } from 'lucide-react';
import type { RoomData } from '../types';
import MobileHeader from './MobileHeader';
import MobileHero from './MobileHero';
import SocialProofBar from './SocialProofBar';
import FeatureCarousel from './FeatureCarousel';
import HowItWorks from './HowItWorks';
import StreamerTeaser from './StreamerTeaser';
import MobileFooter from './MobileFooter';

interface MobileLandingPageProps {
  totalViewers?: number | null;
  loading?: boolean;
  apiError?: boolean;
  rooms?: RoomData[];
  role: 'streamer' | 'viewer';
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group rounded-xl border border-arcade-blue/10 bg-white/[0.02] overflow-hidden transition-all duration-300">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left min-h-[48px] active:scale-[0.97] transition-transform duration-100">
        <span className="text-sm font-semibold text-zinc-200">{question}</span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="px-5 pb-4 text-xs text-neutral-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function MobileLandingPage({ totalViewers, loading, apiError, rooms = [], role }: MobileLandingPageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const switchRole = () => {
    const newRole = role === 'streamer' ? 'viewer' : 'streamer';
    localStorage.setItem('streamarena_role', newRole);
    navigate(`/${newRole}`);
  };

  return (
    <div className="min-h-screen bg-transparent">
      <MobileHeader />
      <MobileHero
        totalViewers={totalViewers}
        loading={loading}
        apiError={apiError}
        role={role}
        onSwitchRole={switchRole}
      />
      <SocialProofBar />
      <FeatureCarousel role={role} />
      <HowItWorks role={role} />

      {/* Live Rooms / Go Live prompt */}
      <section className="px-4 py-8">
        <div className="max-w-lg mx-auto">
          {role === 'viewer' ? (
            <>
              <h2 className="font-display text-2xl font-bold text-center mb-6">
                <span className="text-text-primary">Live </span><span className="gradient-text">Rooms</span>
              </h2>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06] animate-pulse">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white/5" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-24 rounded bg-white/10" />
                          <div className="h-3 w-16 rounded bg-white/5" />
                        </div>
                      </div>
                      <div className="h-6 w-full rounded bg-white/5" />
                    </div>
                  ))}
                </div>
              ) : apiError || rooms.filter(r => r.is_live).length === 0 ? (
                <div className="text-center py-8">
                  <Radio className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                  <p className="text-sm text-neutral-400">No live rooms right now</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rooms.filter(r => r.is_live).slice(0, 3).map((room: RoomData) => (
                    <Link key={room.id} to={`/room/${room.code}`} className="block bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 active:scale-[0.97] transition-transform duration-100">
                      <div className="flex items-center gap-3 mb-2">
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
                      <p className="text-xs text-neutral-400 line-clamp-2">{room.description}</p>
                    </Link>
                  ))}
                </div>
              )}
              <Link to="/join" className="w-full mt-3 min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] text-neutral-300 text-sm font-semibold active:scale-[0.97] active:opacity-90 transition-all duration-100 touch-manipulation ">
                Browse All Rooms <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <div className="bg-gradient-to-b from-arcade-purple/10 via-arcade-blue/5 to-transparent border border-arcade-purple/20 rounded-3xl p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-arcade-blue/20 to-arcade-purple/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🎙️</span>
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">
                <span className="text-text-primary">Ready to </span><span className="gradient-text">Go Live?</span>
              </h2>
              <p className="text-sm text-neutral-400 mb-5 leading-relaxed">
                Create your room in seconds. Share your code and let viewers play along — no setup needed.
              </p>
              <Link to="/create-room" className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-blue text-white font-bold text-sm active:scale-[0.97] active:opacity-90 transition-all duration-100 touch-manipulation mb-3">
                <span className="text-base">🎬</span> Create Your Room
              </Link>
              <Link to="/create-room" className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] text-neutral-300 text-sm font-semibold active:scale-[0.97] active:opacity-90 transition-all duration-100 touch-manipulation">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* "No account needed" badge (viewer only) */}
      {role === 'viewer' && (
        <section className="px-4 py-2">
          <div className="max-w-lg mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-arcade-green/5 border border-arcade-green/30">
              <Zap className="w-4 h-4 text-arcade-green" />
              <span className="text-xs text-arcade-green font-medium">No account needed. Just enter a room code and play.</span>
            </div>
          </div>
        </section>
      )}

      {/* Stats (viewer only) */}
      {role === 'viewer' && (
        <section className="px-4 py-8">
          <div className="max-w-lg mx-auto">
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: '45K', label: 'Games Played Today', icon: Gamepad2 },
                { value: '12K', label: 'Art Pieces Submitted', icon: Palette },
                { value: '3.2K', label: 'Players Online', icon: Users },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-xl bg-gradient-to-b from-arcade-blue/8 to-transparent border border-arcade-blue/15">
                  <stat.icon className="w-5 h-5 mx-auto mb-1.5 text-arcade-blue" />
                  <div className="text-lg font-bold gradient-text">{stat.value}</div>
                  <div className="text-[10px] text-neutral-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Art Section */}
      <section className="px-4 py-8">
        <div className="max-w-lg mx-auto">
          <h2 className="font-display text-2xl font-bold mb-4">
            <span className="text-text-primary">Fan Art </span><span className="gradient-text">Creativity</span>
          </h2>
          <p className="text-sm text-neutral-400 mb-4 leading-relaxed">
            {role === 'viewer'
              ? 'Submit artwork during a live stream. The streamer rates it on air — and you earn points.'
              : 'Review and rate viewer artwork live on stream. Submissions appear on your OBS overlay in real time.'}
          </p>
          <ul className="space-y-2 mb-5">
            {['Upload in seconds', 'Live streamer review & rating', 'Featured on OBS overlay', 'Earn points & badges'].map(item => (
              <li key={item} className="flex items-center gap-2 text-neutral-300 text-sm">
                <div className="w-4 h-4 rounded-full bg-arcade-green/20 flex items-center justify-center">
                  <Star className="w-2.5 h-2.5 text-arcade-green" />
                </div>
                {item}
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="aspect-square rounded-xl overflow-hidden border border-arcade-purple/30 bg-gradient-to-br from-arcade-purple/20 to-transparent" />
            <div className="aspect-square rounded-xl overflow-hidden border border-arcade-blue/30 bg-gradient-to-br from-arcade-blue/20 to-transparent" />
          </div>
          <Link to={role === 'streamer' ? '/create-room' : '/join'} className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-blue text-white font-semibold text-sm active:scale-[0.97] active:opacity-90 transition-all duration-100 touch-manipulation ">
            {role === 'streamer' ? 'Go to Dashboard' : 'Try Art Arena'} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {role === 'viewer' && (
      <section className="px-4 py-8">
        <div className="max-w-lg mx-auto">
          <h2 className="font-display text-2xl font-bold text-center mb-6">
            <span className="text-text-primary">Frequently Asked </span><span className="gradient-text">Questions</span>
          </h2>
          <div className="space-y-3">
            {[
              { q: 'Do I need an account to play?', a: 'No. Just enter a 6-character room code shared by the streamer and you\'re in. No sign-up, no email, no password.' },
              { q: 'Is it free?', a: 'Yes — joining rooms, playing mini-games, submitting art, and basic queue access are completely free.' },
              { q: 'How do I join a room?', a: 'Ask the streamer for their room code, enter it on the Join page, and you\'ll be connected instantly.' },
              { q: 'What kind of games are there?', a: 'Pixel Quiz, Arcade Guess, Button Mash, and Art Rating — with more being added.' },
              { q: 'Can I submit my own art?', a: 'Yes — upload your artwork during a live stream for the streamer to review and rate on air.' },
              { q: 'How do leaderboards work?', a: 'You earn points by winning games and getting your art rated. Top players get recognized on stream.' },
            ].map((faq) => (
              <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Switch role */}
      <section className="px-4 pb-4">
        <div className="max-w-lg mx-auto text-center">
          <button onClick={switchRole} className="text-xs text-neutral-400 active:text-arcade-blue transition-colors underline underline-offset-2 min-h-[44px]">
            {role === 'streamer' ? 'Not a streamer? Switch to Viewer →' : 'Not a viewer? Switch to Streamer →'}
          </button>
        </div>
      </section>

      {role === 'viewer' && <StreamerTeaser />}
      <MobileFooter />
    </div>
  );
}



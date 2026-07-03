import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface MobileHeroProps {
  totalViewers?: number | null;
  loading?: boolean;
  apiError?: boolean;
  role: 'streamer' | 'viewer';
  onSwitchRole: () => void;
}

export default function MobileHero({ totalViewers, loading, apiError, role }: MobileHeroProps) {
  const navigate = useNavigate();

  return (
    <section
      className="relative flex flex-col justify-center min-h-[100dvh] px-4 pt-16 pb-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-lg mx-auto w-full flex flex-col justify-center flex-1">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-arcade-pink/30 mb-5 w-fit mx-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-16 h-3 rounded bg-white/10 animate-pulse" />
            </span>
          ) : (
            <span className="text-xs text-neutral-400">
              {apiError
                ? 'Offline'
                : `Live Now \u00B7 ${(totalViewers ?? 2800).toLocaleString()}+ streams active`}
            </span>
          )}
        </div>

        {/* Headline */}
        <h1 className="font-display text-[32px] leading-[1.1] font-black text-center mb-2">
          {role === 'viewer' ? (
            <>
              <span className="text-text-primary">Where Streams</span><br />
              <span className="bg-gradient-to-r from-arcade-blue via-arcade-purple to-arcade-pink bg-clip-text text-transparent">
                Become Games ✨
              </span>
            </>
          ) : (
            <>
              <span className="text-text-primary">The Future of</span><br />
              <span className="bg-gradient-to-r from-arcade-blue via-arcade-purple to-arcade-pink bg-clip-text text-transparent">
                Live Streaming ✨
              </span>
            </>
          )}
        </h1>

        <p className="text-base text-neutral-400 text-center mb-8">
          {role === 'viewer' ? (
            <>Join. Play. Win.<br />No downloads needed.</>
          ) : (
            <>Host. Moderate. Engage.<br />All from your browser.</>
          )}
        </p>

        {role === 'viewer' ? (
          <>
            <button
              onClick={() => navigate('/join')}
              className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-blue text-white text-base font-bold active:scale-[0.97] active:opacity-90 transition-all duration-100 touch-manipulation mb-3"
            >
              🚀 Join a Room
            </button>
          </>
        ) : (
          <>
            <Link to="/create-room" className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-blue text-white font-bold text-base active:scale-[0.97] active:opacity-90 transition-all duration-100 touch-manipulation mb-3">
              🎬 Create Your Room
            </Link>
            <Link to="/dashboard" className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] text-neutral-300 text-sm font-semibold active:scale-[0.97] active:opacity-90 transition-all duration-100 touch-manipulation">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

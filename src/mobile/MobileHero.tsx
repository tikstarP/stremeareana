import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, QrCode } from 'lucide-react';

interface MobileHeroProps {
  totalViewers?: number | null;
  loading?: boolean;
  apiError?: boolean;
  role: 'streamer' | 'viewer';
  onSwitchRole: () => void;
}

export default function MobileHero({ totalViewers, loading, apiError, role, onSwitchRole }: MobileHeroProps) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleJoin = () => {
    if (code.trim().length >= 3) {
      navigate(`/join?code=${code.trim()}`);
    } else {
      navigate('/join');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleJoin();
  };

  const handleBrowse = () => navigate('/join');

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
              <span className="bg-gradient-to-r from-arcade-yellow via-arcade-orange to-red-500 bg-clip-text text-transparent">
                Become Games ✨
              </span>
            </>
          ) : (
            <>
              <span className="text-text-primary">The Future of</span><br />
              <span className="bg-gradient-to-r from-arcade-yellow via-arcade-orange to-red-500 bg-clip-text text-transparent">
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
            {/* Room code input + QR scan combined */}
            <form onSubmit={handleSubmit} className="w-full mb-3">
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-1 focus-within:border-arcade-yellow/30 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="off"
                  placeholder="Enter Room Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9a-zA-Z]/g, '').toUpperCase())}
                  className="flex-1 bg-transparent border-none outline-none text-white text-lg tracking-widest font-mono placeholder-neutral-600 min-h-[48px]"
                  style={{ fontSize: '18px' }}
                />
                <button
                  type="button"
                  onClick={() => navigate('/join?scan=1')}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-neutral-500 active:text-arcade-yellow active:scale-[0.97] transition-all duration-100 touch-manipulation "
                  aria-label="Scan QR code"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={code.trim().length < 3}
                className="w-full min-h-[52px] mt-2 inline-flex items-center justify-center gap-2 rounded-xl text-base font-bold active:scale-[0.97] active:opacity-90 transition-all duration-100 touch-manipulation disabled:opacity-40 disabled:active:scale-100"
                style={{
                  background: code.trim().length >= 3
                    ? 'linear-gradient(135deg, #f59e0b, #f97316)'
                    : 'rgba(255,255,255,0.05)',
                  color: code.trim().length >= 3 ? '#000' : '#666',
                  border: code.trim().length < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}
              >
                🚀 JOIN ROOM
              </button>
            </form>

            {/* Browse Live Rooms */}
            <button
              onClick={handleBrowse}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] text-neutral-300 text-sm font-semibold active:scale-[0.97] active:opacity-90 transition-all duration-100 touch-manipulation "
            >
              📺 Browse Live Rooms <ArrowRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <Link to="/create-room" className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-arcade-orange to-arcade-yellow text-white font-bold text-base active:scale-[0.97] active:opacity-90 transition-all duration-100 touch-manipulation mb-3">
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



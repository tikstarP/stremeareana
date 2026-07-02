import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Headphones, Mic, Play, Activity, Wifi, WifiOff, Speaker, Bell, Radio, Zap } from 'lucide-react';
import MoltenBackground from '../components/MoltenBackground';

interface AudioSource {
  id: string;
  label: string;
  icon: typeof Speaker;
  color: string;
  volume: number;
  muted: boolean;
}

export default function AudioDock() {
  const { roomCode } = useParams();
  const [connected] = useState(true);
  const [masterMuted, setMasterMuted] = useState(false);
  const [masterVolume, setMasterVolume] = useState(80);
  const [sources, setSources] = useState<AudioSource[]>([
    { id: 'voice', label: 'AI Voice', icon: Mic, color: 'text-arcade-purple', volume: 80, muted: false },
    { id: 'shoutout', label: 'Arena Shoutout', icon: Radio, color: 'text-arcade-yellow', volume: 70, muted: false },
    { id: 'sfx', label: 'Sound Effects', icon: Zap, color: 'text-arcade-pink', volume: 60, muted: false },
    { id: 'alerts', label: 'Alert Sounds', icon: Bell, color: 'text-arcade-green', volume: 75, muted: false },
  ]);
  const [levels] = useState(() => Array.from({ length: 12 }, () => Math.random() * 0.8 + 0.1));
  const animRef = useRef<number>(0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bars = barRef.current?.querySelectorAll('.audio-bar');
    let running = true;
    const tick = () => {
      if (!running) return;
      bars?.forEach((bar) => {
        const el = bar as HTMLElement;
        const h = Math.random() * 100;
        el.style.height = `${Math.max(4, h)}%`;
        el.style.opacity = `${0.3 + Math.random() * 0.7}`;
      });
      animRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, []);

  const toggleSourceMute = (id: string) => {
    setSources(s => s.map(src => src.id === id ? { ...src, muted: !src.muted } : src));
  };

  const setSourceVolume = (id: string, vol: number) => {
    setSources(s => s.map(src => src.id === id ? { ...src, volume: vol } : src));
  };

  const effectiveVolume = (src: AudioSource) => {
    if (masterMuted || src.muted) return 0;
    return Math.round((masterVolume / 100) * (src.volume / 100) * 100);
  };

  const handleTestVoice = () => {
    try {
      const msg = new SpeechSynthesisUtterance('Welcome to the arena!');
      msg.volume = effectiveVolume(sources[0]) / 100;
      window.speechSynthesis.speak(msg);
    } catch { console.warn('Audio not supported'); }
  };

  const handleTestSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 440;
      g.gain.value = 0.1 * (masterVolume / 100);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      o.start();
      o.stop(ctx.currentTime + 0.3);
    } catch { console.warn('Audio not supported'); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <MoltenBackground />
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/[0.03] rounded-2xl border border-arcade-pink/10 p-4 sm:p-8 space-y-5">
          {/* Header */}
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-arcade-purple/30 to-arcade-blue/20 border border-arcade-purple/30 flex items-center justify-center mx-auto mb-3">
              <Headphones className="w-7 h-7 sm:w-8 sm:h-8 text-arcade-purple" />
            </div>
            <h1 className="font-display text-lg sm:text-xl font-bold text-text-primary">Audio Dock</h1>
            <p className="text-xs text-text-muted mt-1">Room {roomCode || '—'}</p>
            <div className={`flex items-center justify-center gap-1.5 mt-3 ${connected ? 'text-arcade-green' : 'text-red-400'}`}>
              {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-semibold">{connected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>

          {/* Audio visualizer */}
          <div ref={barRef} className="flex items-end justify-center gap-[3px] h-12 px-2">
            {levels.map((_, i) => (
              <div key={i} className="audio-bar w-[6px] rounded-full bg-gradient-to-t from-arcade-purple to-arcade-yellow transition-all duration-75" style={{ height: '4%', opacity: 0.3 }} />
            ))}
          </div>

          {/* Master volume */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <button onClick={() => setMasterMuted(!masterMuted)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-text-primary transition-all"
                aria-label={masterMuted ? 'Unmute master' : 'Mute master'}
              >{masterMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</button>
              <div className="flex-1">
                <label className="text-[10px] text-text-muted block mb-1">Master Volume: {masterMuted ? 0 : masterVolume}%</label>
                <input type="range" min={0} max={100} value={masterMuted ? 0 : masterVolume}
                  onChange={e => setMasterVolume(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/[0.08] rounded-full appearance-none cursor-pointer accent-arcade-purple"
                />
              </div>
            </div>
          </div>

          {/* Per-source controls */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sources</p>
            <AnimatePresence>
              {sources.map((src, idx) => {
                const Icon = src.icon;
                const vol = effectiveVolume(src);
                return (
                  <motion.div key={src.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06] space-y-2"
                  >
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleSourceMute(src.id)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] hover:opacity-80 transition-all"
                        aria-label={src.muted ? `Unmute ${src.label}` : `Mute ${src.label}`}
                      >{src.muted ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Icon className={`w-4 h-4 ${src.color}`} />}</button>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">{src.label}</span>
                        <span className="text-[10px] text-text-muted shrink-0">{vol}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-[44px]">
                      <Speaker className="w-3 h-3 text-text-muted shrink-0" />
                      <input type="range" min={0} max={100} value={src.muted ? 0 : src.volume}
                        onChange={e => setSourceVolume(src.id, parseInt(e.target.value))}
                        className="flex-1 h-1 bg-white/[0.08] rounded-full appearance-none cursor-pointer accent-arcade-purple"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Test buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleTestVoice}
              className="min-h-[52px] rounded-xl bg-gradient-to-r from-arcade-purple/20 to-arcade-blue/20 border border-arcade-purple/30 text-arcade-purple text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            ><Mic className="w-4 h-4" /> Test Voice</motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleTestSound}
              className="min-h-[52px] rounded-xl bg-gradient-to-r from-arcade-yellow/20 to-arcade-orange/20 border border-arcade-yellow/30 text-arcade-yellow text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            ><Play className="w-4 h-4" /> Test Sound</motion.button>
          </div>

          {/* Info */}
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 space-y-2">
            <p className="text-[11px] font-bold text-text-primary flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-arcade-purple" /> About
            </p>
            <p className="text-[10px] text-text-muted leading-relaxed">
              Add this page as a Browser Source in OBS with audio enabled to capture StreamArena audio on your livestream.
              Each source can be independently muted and leveled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

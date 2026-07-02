import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Music,
  Bell,
  Trophy,
  Coins,
  MessageSquare,
  X,
  Play,
} from 'lucide-react';

interface StudioSoundControlProps {
  soundEnabled: boolean;
  masterVolume: number;
  soundPack: string;
  onToggleSound: () => void;
  onVolumeChange: (v: number) => void;
  onSoundPackChange: (v: string) => void;
  onTestSound: () => void;
  addToast: (t: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

const soundPacks = [
  { value: 'default', label: 'Default' },
  { value: 'arcade', label: 'Arcade' },
  { value: 'retro', label: 'Retro' },
  { value: 'nature', label: 'Nature' },
  { value: 'custom', label: 'Custom' },
];

const muteOptions = [
  { id: 'muteQueue', label: 'Queue sound', icon: Bell },
  { id: 'muteWinner', label: 'Winner sound', icon: Trophy },
  { id: 'muteCoinAlert', label: 'Coin alert sound', icon: Coins },
  { id: 'muteSuperChat', label: 'Super Chat sound', icon: MessageSquare },
];

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-label={checked ? 'Disable sound' : 'Enable sound'}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-arcade-pink' : 'bg-white/10'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function StudioSoundControl({
  soundEnabled,
  masterVolume,
  soundPack,
  onToggleSound,
  onVolumeChange,
  onSoundPackChange,
  onTestSound,
  addToast,
}: StudioSoundControlProps) {
  const [muted, setMuted] = useState<Record<string, boolean>>({
    muteQueue: false,
    muteWinner: false,
    muteCoinAlert: false,
    muteSuperChat: false,
  });

  const toggleMute = (id: string) => {
    setMuted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(Number(e.target.value));
  };

  return (
    <div className="bg-white/[0.03] rounded-2xl border border-arcade-pink/10 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Music className="w-5 h-5 text-arcade-pink" />
          Sound Control
        </h2>
        <div className="flex items-center gap-3">
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-green-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-red-400" />
          )}
          <ToggleSwitch checked={soundEnabled} onChange={onToggleSound} />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            Master Volume ({masterVolume}%)
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={masterVolume}
            onChange={handleVolumeChange}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-arcade-pink range-thumb:bg-arcade-pink"
            style={{
              background: `linear-gradient(to right, #f72585 ${masterVolume}%, rgba(255,255,255,0.1) ${masterVolume}%)`,
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">Sound Pack</label>
          <select
            value={soundPack}
            onChange={e => onSoundPackChange(e.target.value)}
            className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-arcade-pink/50 transition-all appearance-none"
          >
            {soundPacks.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-3">Mute Specific Sounds</label>
        <div className="space-y-2">
          {muteOptions.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleMute(opt.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  muted[opt.id]
                    ? 'border-red-500/30 bg-red-500/10'
                    : 'border-arcade-pink/10 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${muted[opt.id] ? 'text-red-400' : 'text-neutral-400'}`} />
                  <span className={`text-sm ${muted[opt.id] ? 'text-red-400' : 'text-text-primary'}`}>
                    {opt.label}
                  </span>
                </div>
                {muted[opt.id] ? (
                  <X className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-green-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          onTestSound();
          addToast({ message: 'Test sound played', type: 'info' });
        }}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-arcade-orange to-arcade-yellow text-black font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        <Play className="w-4 h-4" />
        Test Sound
      </motion.button>


    </div>
  );
}

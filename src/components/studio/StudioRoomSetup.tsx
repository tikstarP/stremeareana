import { motion } from 'framer-motion';
import { Shield, Eye, Unlock, BookOpen, Monitor, Smartphone, Save, Check } from 'lucide-react';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'bn', label: 'Bengali' },
  { value: 'mr', label: 'Marathi' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'pa', label: 'Punjabi' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'kn', label: 'Kannada' },
  { value: 'ur', label: 'Urdu' },
  { value: 'other', label: 'Other' },
];

const moderationModes = [
  {
    id: 'safe' as const,
    icon: Shield,
    label: 'Safe',
    desc: 'Strict filtering',
  },
  {
    id: 'review' as const,
    icon: Eye,
    label: 'Review',
    desc: 'Manual approval',
  },
  {
    id: 'loose' as const,
    icon: Unlock,
    label: 'Loose',
    desc: 'Minimal filtering',
  },
  {
    id: 'manual_read' as const,
    icon: BookOpen,
    label: 'Manual Read',
    desc: 'All messages need approval',
  },
];

const streamerModes = [
  { id: 'desktop_obs' as const, icon: Monitor, label: 'Desktop OBS Mode' },
  { id: 'mobile_host' as const, icon: Smartphone, label: 'Mobile Host Mode' },
];

interface StudioRoomSetupProps {
  roomTitle: string;
  youtubeUrl: string;
  language: string;
  moderationMode: 'safe' | 'review' | 'loose' | 'manual_read';
  streamerMode: 'desktop_obs' | 'mobile_host';
  onUpdateRoomTitle: (v: string) => void;
  onUpdateYoutubeUrl: (v: string) => void;
  onUpdateLanguage: (v: string) => void;
  onUpdateModeration: (v: 'safe' | 'review' | 'loose' | 'manual_read') => void;
  onUpdateStreamerMode: (v: 'desktop_obs' | 'mobile_host') => void;
  onSave: () => void;
  addToast: (t: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

export default function StudioRoomSetup({
  roomTitle,
  youtubeUrl,
  language,
  moderationMode,
  streamerMode,
  onUpdateRoomTitle,
  onUpdateYoutubeUrl,
  onUpdateLanguage,
  onUpdateModeration,
  onUpdateStreamerMode,
  onSave,
}: StudioRoomSetupProps) {
  return (
    <div className="bg-white/[0.03] rounded-2xl border border-arcade-pink/10 p-6 space-y-6">
      <h2 className="text-lg font-bold text-text-primary">Room Setup</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">Room Title</label>
          <input
            type="text"
            value={roomTitle}
            onChange={e => onUpdateRoomTitle(e.target.value)}
            placeholder="Enter room title"
            className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-pink/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">YouTube Live URL</label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={e => onUpdateYoutubeUrl(e.target.value)}
            placeholder="Paste your YouTube stream key/link"
            className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-pink/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">Room Language</label>
          <select
            value={language}
            onChange={e => onUpdateLanguage(e.target.value)}
            className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-arcade-pink/50 transition-all appearance-none"
          >
            {languages.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-3">Moderation Mode</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {moderationModes.map(mode => {
            const Icon = mode.icon;
            const selected = moderationMode === mode.id;
            return (
              <motion.button
                key={mode.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => onUpdateModeration(mode.id)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border text-left transition-all min-h-[44px] sm:min-h-auto ${
                  selected
                    ? 'border-arcade-pink/60 bg-arcade-pink/10'
                    : 'border-arcade-pink/10 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                {selected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-arcade-pink flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <Icon className={`w-5 h-5 ${selected ? 'text-arcade-pink' : 'text-neutral-400'}`} />
                <span className={`text-sm font-bold ${selected ? 'text-arcade-pink' : 'text-text-primary'}`}>{mode.label}</span>
                <span className="text-[10px] text-text-muted text-center leading-tight">{mode.desc}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-3">Streamer Mode</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {streamerModes.map(mode => {
            const Icon = mode.icon;
            const selected = streamerMode === mode.id;
            return (
              <motion.button
                key={mode.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => onUpdateStreamerMode(mode.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all min-h-[44px] sm:min-h-auto ${
                  selected
                    ? 'border-arcade-pink/60 bg-arcade-pink/10'
                    : 'border-arcade-pink/10 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <Icon className={`w-5 h-5 ${selected ? 'text-arcade-pink' : 'text-neutral-400'}`} />
                <span className={`text-sm font-bold ${selected ? 'text-arcade-pink' : 'text-text-primary'}`}>{mode.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onSave}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-arcade-orange to-arcade-yellow text-black font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 min-h-[44px] sm:min-h-auto"
      >
        <Save className="w-4 h-4" />
        Save Settings
      </motion.button>
    </div>
  );
}

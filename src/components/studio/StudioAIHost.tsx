import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Volume2,
  Mic,
  Play,
  Shuffle,
  Unlock,
  Shield,
  Eye,
  BookOpen,
} from 'lucide-react';

interface StudioAIHostProps {
  aiEnabled: boolean;
  voiceVolume: number;
  voiceMode: string;
  onToggleAI: () => void;
  onVolumeChange: (v: number) => void;
  onVoiceModeChange: (v: string) => void;
  onSpeak: (text: string) => void;
  addToast: (t: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

const voiceModes = ['Friendly', 'Professional', 'Energetic', 'Calm'];
const moderationModes = ['Safe', 'Review', 'Loose', 'Manual Read'];

const moderationIcons: Record<string, React.ElementType> = {
  Safe: Shield,
  Review: Eye,
  Loose: Unlock,
  'Manual Read': BookOpen,
};

export default function StudioAIHost({
  aiEnabled,
  voiceVolume,
  voiceMode,
  onToggleAI,
  onVolumeChange,
  onVoiceModeChange,
  onSpeak,
  addToast,
}: StudioAIHostProps) {
  const [customMessage, setCustomMessage] = useState('');
  const [moderationMode, setModerationMode] = useState('Safe');

  const handleSpeak = () => {
    if (!customMessage.trim()) {
      addToast({ message: 'Please enter a message to speak', type: 'warning' });
      return;
    }
    onSpeak(customMessage.trim());
    setCustomMessage('');
  };

  const ModerationIcon = moderationIcons[moderationMode] || Shield;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-semibold text-white/90">AI Host</h3>
        </div>
        <button
          onClick={onToggleAI}
          aria-label={aiEnabled ? 'Disable AI host' : 'Enable AI host'}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            aiEnabled ? 'bg-purple-500' : 'bg-white/20'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              aiEnabled ? 'translate-x-[18px]' : 'translate-x-[2px]'
            }`}
          />
        </button>
      </div>

      {/* Settings Group */}
      <div className="space-y-3">
        {/* Volume */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-white/60 shrink-0" />
          <input
            type="range"
            min={0}
            max={100}
            value={voiceVolume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            disabled={!aiEnabled}
            className="flex-1 h-1 appearance-none rounded-full bg-white/20 accent-purple-500 cursor-pointer disabled:opacity-40"
          />
          <span className="text-xs text-white/40 w-8 text-right">{voiceVolume}</span>
        </div>

        {/* Voice Mode */}
        <div className="flex items-center gap-3">
          <Shuffle className="w-4 h-4 text-white/60 shrink-0" />
          <select
            value={voiceMode}
            onChange={(e) => onVoiceModeChange(e.target.value)}
            disabled={!aiEnabled}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-white/80 outline-none focus:border-purple-500/50 disabled:opacity-40"
          >
            {voiceModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        {/* Moderation Mode */}
        <div className="flex items-center gap-3">
          <ModerationIcon className="w-4 h-4 text-white/60 shrink-0" />
          <select
            value={moderationMode}
            onChange={(e) => setModerationMode(e.target.value)}
            disabled={!aiEnabled}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-white/80 outline-none focus:border-purple-500/50 disabled:opacity-40"
          >
            {moderationModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Manual Announcement */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs text-white/50">
          <Mic className="w-3.5 h-3.5" />
          Manual Announcement
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSpeak()}
            placeholder="Type a message..."
            disabled={!aiEnabled}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 placeholder:text-white/30 outline-none focus:border-purple-500/50 disabled:opacity-40"
          />
          <button
            onClick={handleSpeak}
            disabled={!aiEnabled || !customMessage.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-purple-500/80 px-3 py-2 text-xs font-medium text-white hover:bg-purple-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="w-3.5 h-3.5" />
            Speak
          </button>
        </div>
      </div>

      {/* Safety Info */}
      <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
        <div className="flex items-center gap-1.5 text-[11px] text-white/40">
          <Shield className="w-3 h-3 text-green-400/60" />
          <span>User name/message → Bad word filter → Moderation → Speak safe text only</span>
        </div>
      </div>
    </motion.div>
  );
}

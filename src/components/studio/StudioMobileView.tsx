import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders, Sparkles, Shield, Eye, Coins,
  Volume2, VolumeX, RefreshCw, Link, Monitor, Bell, Bot,
  Play, Trophy, Check, X, Lock, Brain, Zap,
  MessageSquare, Star, Crown, Youtube,
} from 'lucide-react';

interface StudioMobileViewProps {
  roomCode: string;
  roomName: string;
  status: 'live' | 'offline' | 'paused' | 'ended';
  videoId: string;
  isMuted: boolean;
  viewerCount: number;
  queueCount: number;
  priorityCount: number;
  coinsSpent: number;
  coinsHeld: number;
  fanDropPending: number;
  fanDropStatus: string;
  onToggleMute: () => void;
  onRefresh: () => void;
  onCopyLink: () => void;
  onCopyOverlay: () => void;
  onTestAlert: () => void;
  onAISpeak: () => void;
  addToast: (t: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

const tabs = [
  { id: 'control', label: 'Control', icon: Sliders },
  { id: 'drops', label: 'Drops', icon: Sparkles },
  { id: 'mod', label: 'Mod', icon: Shield },
];

const mockFeed = [
  { id: 1, type: 'youtube_chat', user: 'RajGamer', text: 'Let\'s go! 🔥', time: 'now' },
  { id: 2, type: 'superchat', user: 'Aman', text: 'Great stream!', time: '30s', amount: 100 },
  { id: 3, type: 'shoutout', user: 'Priya', text: 'Check my channel!', time: '1m' },
  { id: 4, type: 'message', user: 'System', text: '50 coins held by Vikram', time: '1m' },
  { id: 5, type: 'selection', user: 'AI', text: 'Sofia won Quiz round 1', time: '2m' },
  { id: 6, type: 'fan_drop', user: 'Neha', text: 'Submitted artwork', time: '2m' },
];

const feedIcons: Record<string, typeof MessageSquare> = {
  youtube_chat: Youtube, superchat: Star, shoutout: Crown, message: MessageSquare, selection: Trophy, fan_drop: Sparkles,
};

const feedColors: Record<string, string> = {
  youtube_chat: 'text-red-400', superchat: 'text-arcade-yellow', shoutout: 'text-arcade-purple',
  message: 'text-arcade-blue', selection: 'text-arcade-green', fan_drop: 'text-arcade-pink',
};

export default function StudioMobileView({
  roomCode, status, videoId, isMuted,
  viewerCount, coinsSpent, coinsHeld,
  fanDropPending, fanDropStatus,
  onToggleMute, onRefresh,
  onCopyLink, onCopyOverlay, onTestAlert, onAISpeak, addToast,
}: StudioMobileViewProps) {
  const [activeTab, setActiveTab] = useState('control');
  const [smartControl, setSmartControl] = useState(true);

  const isLive = status === 'live';

  const topBar = (
    <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-arcade-pink/10">
      <div className="px-3 py-2 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-arcade-pink to-arcade-blue flex items-center justify-center shrink-0">
              <span className="text-[9px] font-black text-white">SA</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-primary leading-tight truncate">Studio</p>
              <p className="text-[9px] text-text-muted font-mono truncate">{roomCode}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border shrink-0 ${isLive ? 'bg-arcade-green/15 border-arcade-green/30' : 'bg-neutral-500/10 border-neutral-500/20'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-arcade-green animate-pulse' : 'bg-neutral-400'}`} />
            <span className={`text-[9px] font-bold ${isLive ? 'text-arcade-green' : 'text-neutral-400'}`}>LIVE</span>
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { icon: Eye, value: viewerCount, color: 'text-arcade-blue' },
            { icon: Coins, value: coinsSpent, color: 'text-arcade-yellow' },
            { icon: Coins, value: `${coinsHeld}H`, color: 'text-arcade-blue' },
            { icon: Sparkles, value: fanDropPending, color: 'text-arcade-pink' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] shrink-0">
              <s.icon className={`w-3 h-3 ${s.color}`} />
              <span className="text-[10px] font-bold text-text-primary tabular-nums">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const pipPreview = videoId ? (
    <div className="fixed bottom-[68px] right-2 z-50 w-44 rounded-lg overflow-hidden bg-black border border-white/10 shadow-2xl">
      <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
        <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&controls=0`}
          className="w-full h-full pointer-events-none" allow="autoplay" title="pip"
        />
        <div className="absolute top-0.5 left-0.5 px-1 py-0.5 rounded bg-red-500/80 text-[7px] font-bold text-white leading-none">LIVE</div>
      </div>
    </div>
  ) : null;

  const controlTab = (
    <div className="px-3 pb-4 space-y-3">
      {/* Smart Control */}
      <div className="bg-white/[0.03] rounded-2xl border border-arcade-purple/20 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-arcade-purple" />
            <span className="text-xs font-bold text-text-primary">Smart Control</span>
          </div>
          <button onClick={() => { setSmartControl(!smartControl); addToast({ message: smartControl ? 'Smart OFF' : 'Smart ON', type: 'info' }); }}
            className={`relative w-10 h-5 rounded-full transition-all ${smartControl ? 'bg-arcade-green' : 'bg-white/[0.1]'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 shadow transition-all ${smartControl ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>
        {smartControl && (
          <div className="px-3 pb-2.5 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-arcade-green" />
            <span className="text-[9px] text-text-muted">AI handles selections & moderation</span>
          </div>
        )}
      </div>

      {/* Live Feed */}
      <div className="bg-white/[0.03] rounded-2xl border border-arcade-pink/10 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-arcade-pink/10">
          <MessageSquare className="w-4 h-4 text-arcade-blue" />
          <span className="text-xs font-bold text-text-primary">Live Feed</span>
        </div>
        <div className="max-h-[280px] overflow-y-auto no-scrollbar">
          {mockFeed.map(entry => {
            const Icon = feedIcons[entry.type] || MessageSquare;
            return (
              <div key={entry.id} className="flex items-start gap-2 p-2.5 border-b border-white/[0.03] last:border-0">
                <Icon className={`w-3.5 h-3.5 ${feedColors[entry.type] || 'text-neutral-400'} mt-0.5 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-text-primary truncate">{entry.user}</span>
                    <span className="text-[8px] text-text-muted shrink-0">{entry.time}</span>
                  </div>
                  <p className="text-[10px] text-text-muted">{entry.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { icon: Play, label: 'Start Game', color: 'text-arcade-green', action: () => addToast({ message: 'Quick game started!', type: 'success' }) },
          { icon: Sparkles, label: 'Open Drops', color: 'text-arcade-pink', action: () => addToast({ message: 'Drops opened!', type: 'success' }) },
          { icon: Lock, label: 'Emergency', color: 'text-red-400', action: () => addToast({ message: 'Emergency lock', type: 'warning' }) },
          { icon: Bot, label: 'AI Speak', color: 'text-arcade-purple', action: () => { onAISpeak(); } },
        ].map((btn, i) => (
          <button key={i} onClick={btn.action}
            className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all touch-manipulation min-h-[56px]"
          >
            <btn.icon className={`w-4 h-4 ${btn.color}`} />
            <span className="text-[9px] font-medium text-text-muted text-center leading-tight">{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Links */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onCopyLink}
          className="min-h-[44px] rounded-xl bg-white/[0.03] border border-white/[0.08] text-neutral-300 text-xs font-bold hover:bg-white/[0.06] transition-all flex items-center justify-center gap-1.5 touch-manipulation"
        ><Link className="w-3.5 h-3.5" /> Copy Link</button>
        <button onClick={onCopyOverlay}
          className="min-h-[44px] rounded-xl bg-white/[0.03] border border-white/[0.08] text-neutral-300 text-xs font-bold hover:bg-white/[0.06] transition-all flex items-center justify-center gap-1.5 touch-manipulation"
        ><Monitor className="w-3.5 h-3.5" /> Copy Overlay</button>
      </div>
      <button onClick={onTestAlert}
        className="w-full min-h-[44px] rounded-xl bg-white/[0.03] border border-white/[0.08] text-neutral-300 text-xs font-bold hover:bg-white/[0.06] transition-all flex items-center justify-center gap-1.5 touch-manipulation"
      ><Bell className="w-3.5 h-3.5" /> Test Alert</button>
    </div>
  );

  const dropsTab = () => (
    <div className="px-3 pb-4 space-y-3">
      <div className="bg-white/[0.03] rounded-2xl border border-arcade-pink/10 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-arcade-pink/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-arcade-pink" />
            <span className="text-xs font-bold text-text-primary">Fan Drop Room</span>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${
            fanDropStatus === 'open' ? 'bg-arcade-green/15 text-arcade-green' : 'bg-arcade-blue/15 text-arcade-blue'
          }`}>{fanDropStatus === 'open' ? 'Open' : 'Locked'}</span>
        </div>
        <div className="p-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => addToast({ message: 'Fan Drop opened!', type: 'success' })}
              className="min-h-[44px] rounded-xl bg-arcade-green/15 border border-arcade-green/25 text-arcade-green text-xs font-bold hover:bg-arcade-green/25 transition-all"
            ><Sparkles className="w-3.5 h-3.5 inline mr-1" />Open</button>
            <button onClick={() => addToast({ message: 'Fan Drop closed', type: 'info' })}
              className="min-h-[44px] rounded-xl bg-arcade-pink/15 border border-arcade-pink/25 text-arcade-pink text-xs font-bold hover:bg-arcade-pink/25 transition-all"
            ><X className="w-3.5 h-3.5 inline mr-1" />Close</button>
          </div>
          <p className="text-[10px] text-text-muted">{fanDropPending} pending submissions</p>
        </div>
      </div>
    </div>
  );

  const modTab = () => (
    <div className="px-3 pb-4 space-y-3">
      <div className="bg-white/[0.03] rounded-2xl border border-arcade-pink/10 p-4 text-center">
        <Shield className="w-8 h-8 text-arcade-green mx-auto mb-2" />
        <p className="text-xs font-bold text-text-primary">Safe Mode</p>
        <p className="text-[10px] text-text-muted mt-1">AI is moderating messages</p>
      </div>
      <button onClick={() => addToast({ message: 'Emergency lock toggled', type: 'warning' })}
        className="w-full min-h-[44px] rounded-xl border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/10 transition-all"
      ><Lock className="w-3.5 h-3.5 inline mr-1" />Emergency Lock</button>
    </div>
  );

  return (
    <div className="md:hidden min-h-screen bg-transparent pb-[60px] flex flex-col">
      {topBar}
      {pipPreview}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="pt-2"
          >
            {activeTab === 'control' && controlTab}
            {activeTab === 'drops' && dropsTab()}
            {activeTab === 'mod' && modTab()}
          </motion.div>
        </AnimatePresence>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-arcade-pink/10" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around px-1 py-1">
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-colors min-w-[52px] min-h-[44px] touch-manipulation"
              >
                {active && (
                  <motion.div layoutId="mobileStudioTab"
                    className="absolute inset-0 bg-arcade-pink/10 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <tab.icon className={`w-5 h-5 ${active ? 'text-arcade-pink' : 'text-neutral-400'}`} />
                <span className={`text-[9px] font-medium ${active ? 'text-arcade-pink' : 'text-text-muted'}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

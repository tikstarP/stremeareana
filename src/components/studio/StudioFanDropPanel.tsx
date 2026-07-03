import { useState } from 'react';
import { Lock, Clock, Unlock, Check, X, Eye, Star, Coins, Bot, Trash2, Settings, Image, Type, Smile, Film, Camera, GripHorizontal, Shield, ToggleLeft, ToggleRight, Sparkles, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FanDropSubmission {
  id: number;
  username: string;
  avatar_url: string;
  type: string;
  preview: string;
  submitted_at: string;
  likes: number;
  status: 'pending' | 'approved' | 'rejected';
}

interface StudioFanDropPanelProps {
  roomId?: number;
  fanDropStatus: 'locked' | 'scheduled' | 'open' | 'closed';
  fanDropTheme: string;
  pendingSubmissions: FanDropSubmission[];
  onSetStatus: (s: 'locked' | 'scheduled' | 'open' | 'closed') => void;
  onUpdateTheme: (t: string) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
  onShowOnOverlay: (id: number) => void;
  onRate: (id: number) => void;
  onAwardPoints: (id: number) => void;
  onAIRead: (id: number) => void;
  onClearPending: () => void;
  addToast: (t: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

const mockSubmissions: FanDropSubmission[] = [
  { id: 1, username: 'gamer_raj', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gamer_raj', type: 'text', preview: 'That was an insane headshot bro!', submitted_at: '2026-06-28T10:23:00Z', likes: 12, status: 'pending' },
  { id: 2, username: 'bgmi_lover', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bgmi_lover', type: 'image', preview: 'screenshot_2026_06_28.png', submitted_at: '2026-06-28T10:25:00Z', likes: 8, status: 'pending' },
  { id: 3, username: 'pro_noob', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pro_noob', type: 'gif', preview: 'dance_gif_animation.gif', submitted_at: '2026-06-28T10:27:00Z', likes: 24, status: 'pending' },
  { id: 4, username: 'stream_queen', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=stream_queen', type: 'emoji', preview: '🔥🔥🔥', submitted_at: '2026-06-28T10:28:00Z', likes: 5, status: 'approved' },
  { id: 5, username: 'clutch_king', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=clutch_king', type: 'sticker', preview: '👑', submitted_at: '2026-06-28T10:30:00Z', likes: 3, status: 'rejected' },
  { id: 6, username: 'headshot_hunter', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=headshot_hunter', type: 'video', preview: 'clutch_round_highlight.mp4', submitted_at: '2026-06-28T10:32:00Z', likes: 45, status: 'pending' },
  { id: 7, username: 'nade_king', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nade_king', type: 'text', preview: 'Can we get a FPP mode soon?', submitted_at: '2026-06-28T10:35:00Z', likes: 18, status: 'pending' },
  { id: 8, username: 'loot_god', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=loot_god', type: 'image', preview: 'airdrop_location.png', submitted_at: '2026-06-28T10:38:00Z', likes: 7, status: 'pending' },
];

const statusConfig: Record<string, { icon: typeof Lock; label: string; color: string; bg: string; border: string; glow: string }> = {
  locked: { icon: Lock, label: 'Locked', color: 'text-arcade-blue', bg: 'bg-arcade-blue/15', border: 'border-arcade-blue/30', glow: 'shadow-arcade-blue/20' },
  scheduled: { icon: Clock, label: 'Scheduled', color: 'text-arcade-yellow', bg: 'bg-arcade-yellow/15', border: 'border-arcade-yellow/30', glow: 'shadow-arcade-yellow/20' },
  open: { icon: Unlock, label: 'Open', color: 'text-arcade-green', bg: 'bg-arcade-green/15', border: 'border-arcade-green/30', glow: 'shadow-arcade-green/20' },
  closed: { icon: Lock, label: 'Closed', color: 'text-arcade-pink', bg: 'bg-arcade-pink/15', border: 'border-arcade-pink/30', glow: 'shadow-arcade-pink/20' },
};

const allowedContentTypes = [
  { id: 'text', label: 'Text/message', icon: Type },
  { id: 'emoji', label: 'Emoji', icon: Smile },
  { id: 'image', label: 'Image/screenshot', icon: Image, hint: 'PNG, JPG, JPEG, WEBP' },
  { id: 'gif', label: 'GIF', icon: Film },
  { id: 'sticker', label: 'Sticker', icon: Sparkles },
  { id: 'video', label: 'Short video', icon: Camera, hint: 'MP4/WEBM, 15-18s max' },
];

const blockedContentTypes = ['ZIP', 'RAR', '7Z', 'EXE', 'APK', 'PDF', 'DOC', 'DOCX', 'HTML', 'JS', 'Unknown'];

const moderationOptions = [
  { id: 'safe', label: 'Safe', desc: 'Auto-filter offensive content' },
  { id: 'review', label: 'Review', desc: 'Manual approval required' },
  { id: 'loose', label: 'Loose', desc: 'Minimal filtering' },
  { id: 'manual_read', label: 'Manual Read', desc: 'All messages need approval' },
];

const typeIcons: Record<string, typeof Type> = {
  text: Type,
  emoji: Smile,
  image: Image,
  gif: Film,
  sticker: Sparkles,
  video: Camera,
};

const submissionStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-arcade-yellow', bg: 'bg-arcade-yellow/15' },
  approved: { label: 'Approved', color: 'text-arcade-green', bg: 'bg-arcade-green/15' },
  rejected: { label: 'Rejected', color: 'text-arcade-pink', bg: 'bg-arcade-pink/15' },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function ToggleSwitch({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
        enabled
          ? 'bg-arcade-green/10 border-arcade-green/30 text-arcade-green'
          : 'bg-white/[0.03] border-white/[0.06] text-neutral-500 hover:text-text-primary'
      }`}
    >
      {enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
      {label}
    </button>
  );
}

function ActionButton({ icon: Icon, label, color, onClick }: { icon: typeof Check; label: string; color: string; onClick: () => void }) {
  const colorMap: Record<string, string> = {
    green: 'from-arcade-green to-arcade-green/80 text-white shadow-arcade-green/20',
    red: 'from-arcade-pink to-arcade-pink/80 text-white shadow-arcade-pink/20',
    gray: 'bg-white/[0.06] text-neutral-400 hover:text-text-primary border border-white/[0.08]',
    yellow: 'from-arcade-yellow to-arcade-yellow/80 text-black shadow-arcade-yellow/20',
    purple: 'from-arcade-purple to-arcade-purple/80 text-white shadow-arcade-purple/20',
    blue: 'from-arcade-blue to-arcade-blue/80 text-white shadow-arcade-blue/20',
  };
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={label}
      className={`min-h-[36px] min-w-[36px] p-2 rounded-lg text-xs font-bold flex items-center justify-center transition-all bg-gradient-to-r ${
        colorMap[color] || colorMap.gray
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
    </motion.button>
  );
}

export default function StudioFanDropPanel({
  roomId,
  fanDropStatus,
  fanDropTheme,
  pendingSubmissions: _pendingSubmissions,
  onSetStatus,
  onUpdateTheme,
  onApprove,
  onReject,
  onDelete,
  onShowOnOverlay,
  onRate,
  onAwardPoints,
  onAIRead,
  onClearPending,
  addToast,
}: StudioFanDropPanelProps) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [allowedTypes, setAllowedTypes] = useState<string[]>(['text', 'emoji', 'image', 'gif', 'sticker', 'video']);
  const [moderationMode, setModerationMode] = useState('review');
  const [likeVoting, setLikeVoting] = useState(true);
  const [onePerViewer, setOnePerViewer] = useState(false);
  const [extraWithCoins, setExtraWithCoins] = useState(false);
  const [submissions, setSubmissions] = useState<FanDropSubmission[]>(_pendingSubmissions && _pendingSubmissions.length > 0 ? _pendingSubmissions : mockSubmissions);

  const toggleAllowedType = (id: string) => {
    setAllowedTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
    addToast({ message: `${allowedTypes.includes(id) ? 'Removed' : 'Added'} ${id}`, type: 'info' });
  };

  const handleSchedule = () => {
    if (!scheduleDate || !scheduleTime) {
      addToast({ message: 'Please select date and time', type: 'warning' });
      return;
    }
    onSetStatus('scheduled');
    addToast({ message: `Scheduled for ${scheduleDate} at ${scheduleTime}`, type: 'success' });
    setShowSchedule(false);
  };

  const status = statusConfig[fanDropStatus];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Section 1: Fan Drop Room Control */}
      <div className="bg-white/[0.03] rounded-2xl border border-arcade-pink/10 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-arcade-yellow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Fan Drop Room</h2>
              <p className="text-xs text-text-muted">Control and manage your fan drop room</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${status.bg} ${status.border} ${status.color} shadow-sm ${status.glow}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{status.label}</span>
          </div>
        </div>

        {/* Status quick buttons */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Room Status</label>
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(statusConfig).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const selected = fanDropStatus === key;
              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onSetStatus(key as typeof fanDropStatus)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                    selected
                      ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                      : 'border-white/[0.06] text-neutral-500 hover:text-text-primary bg-white/[0.02]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cfg.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">Theme / Title</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={fanDropTheme}
              onChange={e => onUpdateTheme(e.target.value)}
              placeholder="e.g. Funniest BGMI Moment"
              className="flex-1 bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-yellow/40 transition-all"
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onSetStatus('open')}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-arcade-green to-arcade-green/80 text-white text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              Open Now
            </motion.button>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-muted">Schedule Opening</label>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowSchedule(!showSchedule)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                showSchedule
                  ? 'bg-arcade-yellow/10 border-arcade-yellow/30 text-arcade-yellow'
                  : 'border-white/[0.06] text-neutral-400 hover:text-text-primary bg-white/[0.02]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {showSchedule ? 'Hide' : 'Schedule'}
            </motion.button>
          </div>
          <AnimatePresence>
            {showSchedule && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1">Date</label>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={e => setScheduleDate(e.target.value)}
                        className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-arcade-yellow/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1">Time</label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={e => setScheduleTime(e.target.value)}
                        className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-arcade-yellow/40 transition-all"
                      />
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSchedule}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-arcade-yellow to-arcade-yellow/80 text-black text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Confirm Schedule
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">Duration (minutes)</label>
          <input
            type="number"
            min={1}
            max={180}
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="30"
            className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-yellow/40 transition-all"
          />
        </div>

        {/* Allowed Content Types */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-3">Allowed Content Types</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allowedContentTypes.map(ct => {
              const Icon = ct.icon;
              const enabled = allowedTypes.includes(ct.id);
              return (
                <motion.button
                  key={ct.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleAllowedType(ct.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                    enabled
                      ? 'bg-arcade-green/10 border-arcade-green/30'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${enabled ? 'text-arcade-green' : 'text-neutral-500'}`} />
                  <div>
                    <span className={`text-xs font-medium ${enabled ? 'text-arcade-green' : 'text-text-primary'}`}>
                      {ct.label}
                    </span>
                    {ct.hint && (
                      <span className="block text-[9px] text-text-muted leading-tight">{ct.hint}</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Blocked Content Types */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            <Shield className="w-3.5 h-3.5 inline mr-1 text-arcade-pink" />
            Blocked Content Types
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {blockedContentTypes.map(type => (
              <span
                key={type}
                className="px-2.5 py-1 rounded-lg bg-arcade-pink/10 border border-arcade-pink/20 text-[10px] font-medium text-arcade-pink"
              >
                {type}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-text-muted mt-1.5">These file types are automatically blocked for security.</p>
        </div>

        {/* Moderation Mode */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-3">Moderation Mode</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {moderationOptions.map(opt => {
              const selected = moderationMode === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setModerationMode(opt.id);
                    addToast({ message: `Moderation set to ${opt.label}`, type: 'info' });
                  }}
                  className={`relative p-3 rounded-xl border text-left transition-all ${
                    selected
                      ? 'border-arcade-purple/60 bg-arcade-purple/10'
                      : 'border-arcade-pink/10 bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  {selected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-arcade-purple flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  <Shield className={`w-4 h-4 mb-1 ${selected ? 'text-arcade-purple' : 'text-neutral-400'}`} />
                  <div className={`text-xs font-bold ${selected ? 'text-arcade-purple' : 'text-text-primary'}`}>
                    {opt.label}
                  </div>
                  <div className="text-[9px] text-text-muted leading-tight mt-0.5">{opt.desc}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Toggles */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-3">Room Settings</label>
          <div className="flex items-center gap-2 flex-wrap">
            <ToggleSwitch enabled={likeVoting} onToggle={() => { setLikeVoting(!likeVoting); addToast({ message: likeVoting ? 'Like voting disabled' : 'Like voting enabled', type: 'info' }); }} label="Like Voting" />
            <ToggleSwitch enabled={onePerViewer} onToggle={() => { setOnePerViewer(!onePerViewer); addToast({ message: onePerViewer ? 'Multiple submissions allowed' : 'One submission per viewer', type: 'info' }); }} label="One per Viewer" />
            <ToggleSwitch enabled={extraWithCoins} onToggle={() => { setExtraWithCoins(!extraWithCoins); addToast({ message: extraWithCoins ? 'Extra submission removed' : 'Extra submission with coins', type: 'info' }); }} label="Extra with Coins" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/[0.06]">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onSetStatus('open')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-arcade-green to-arcade-green/80 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Unlock className="w-3.5 h-3.5" />
            Open Now
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowSchedule(true)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-arcade-yellow to-arcade-yellow/80 text-black text-xs font-bold flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            Schedule
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { onSetStatus('closed'); addToast({ message: 'Room closed', type: 'info' }); }}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-arcade-pink to-arcade-pink/80 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            Close Room
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => addToast({ message: 'Gallery opened', type: 'info' })}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-arcade-blue to-arcade-blue/80 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Show Gallery
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { onClearPending(); addToast({ message: 'Pending submissions cleared', type: 'success' }); }}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-neutral-400 hover:text-text-primary text-xs font-bold flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Pending
          </motion.button>
        </div>
      </div>

      {/* Section 2: Fan Drop Review Panel */}
      <div className="bg-white/[0.03] rounded-2xl border border-arcade-pink/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <GripHorizontal className="w-5 h-5 text-arcade-purple" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Review Panel</h2>
              <p className="text-xs text-text-muted">
                {submissions.filter(s => s.status === 'pending').length} pending submission{submissions.filter(s => s.status === 'pending').length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-text-muted">No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {submissions.map(sub => {
                const TypeIcon = typeIcons[sub.type] || Type;
                const statusCfg = submissionStatusConfig[sub.status];

                return (
                  <motion.div
                    key={sub.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/[0.04] rounded-xl border border-arcade-pink/10 p-4 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={sub.avatar_url}
                        alt={sub.username}
                        className="w-8 h-8 rounded-full bg-white/[0.06] flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-text-primary truncate">{sub.username}</span>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold ${statusCfg.bg} ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.04]">
                            <TypeIcon className="w-3 h-3 text-text-muted" />
                            <span className="text-[10px] text-text-muted capitalize">{sub.type}</span>
                          </div>
                          <span className="text-[10px] text-text-muted">{formatTime(sub.submitted_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-arcade-pink">
                        <HeartIcon className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{sub.likes}</span>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-bg-secondary rounded-lg px-3 py-2 border border-white/[0.04]">
                      <p className="text-xs text-text-primary/80 truncate">{sub.preview}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <ActionButton icon={Check} label="Approve" color="green" onClick={() => { onApprove(sub.id); setSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'approved' } : s)); addToast({ message: 'Approved', type: 'success' }); }} />
                      <ActionButton icon={X} label="Reject" color="red" onClick={() => { onReject(sub.id); setSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'rejected' } : s)); addToast({ message: 'Rejected', type: 'error' }); }} />
                      <ActionButton icon={Trash2} label="Delete" color="gray" onClick={() => { onDelete(sub.id); setSubmissions(prev => prev.filter(s => s.id !== sub.id)); addToast({ message: 'Deleted', type: 'info' }); }} />
                      <ActionButton icon={Eye} label="Show on Overlay" color="purple" onClick={() => { onShowOnOverlay(sub.id); addToast({ message: 'Shown on overlay', type: 'success' }); }} />
                      <ActionButton icon={Star} label="Rate" color="yellow" onClick={() => { onRate(sub.id); addToast({ message: 'Rating submitted', type: 'info' }); }} />
                      <ActionButton icon={Coins} label="Award Points" color="blue" onClick={() => { onAwardPoints(sub.id); addToast({ message: 'Points awarded', type: 'success' }); }} />
                      {sub.type === 'text' && (
                        <ActionButton icon={Bot} label="AI Read" color="gray" onClick={() => { onAIRead(sub.id); addToast({ message: 'AI analysis complete', type: 'info' }); }} />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        <div className="bg-arcade-yellow/5 border border-arcade-yellow/10 rounded-xl p-3">
          <p className="text-[11px] text-text-muted leading-relaxed">
            All media requires approval before public gallery or overlay. Text should pass bad word moderation. GIFs and videos should not autoplay on overlay unless streamer manually clicks Show on Overlay.
          </p>
        </div>
      </div>
    </div>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { Lock, Clock, Upload, Image, MessageSquare, Sticker, Video, Heart, XCircle, Bell, Eye, Camera, Send, Settings, Sparkles, Sliders, ToggleLeft, ToggleRight, Play, Trash2, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../context/AppContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';

const stickers = [
  { id: 'fire', emoji: '🔥' }, { id: 'heart', emoji: '❤️' }, { id: 'crown', emoji: '👑' },
  { id: 'star', emoji: '⭐' }, { id: 'hundo', emoji: '💯' }, { id: 'clap', emoji: '👏' },
  { id: 'rocket', emoji: '🚀' }, { id: 'party', emoji: '🎉' }, { id: 'skull', emoji: '💀' },
  { id: 'eyes', emoji: '👀' }, { id: 'pizza', emoji: '🍕' }, { id: 'game', emoji: '🎮' },
];

const contentTypes = [
  { id: 'text', label: 'Text', icon: MessageSquare, desc: 'Max 280 chars' },
  { id: 'emoji', label: 'Emoji', icon: Sparkles, desc: 'Max 20 emojis' },
  { id: 'image', label: 'Image', icon: Image, desc: 'PNG/JPG/WEBP, 5MB' },
  { id: 'gif', label: 'GIF', icon: Camera, desc: 'GIF, 5MB' },
  { id: 'sticker', label: 'Sticker', icon: Sticker, desc: 'Built-in pack' },
  { id: 'video', label: 'Video', icon: Video, desc: 'MP4, 15s, 20MB' },
];

const durationOptions = [
  { id: 'now', label: 'Open now' },
  { id: '5min', label: '5 minutes' },
  { id: '10min', label: '10 minutes' },
  { id: '30min', label: '30 minutes' },
  { id: 'specific', label: 'Specific time' },
  { id: 'manual', label: 'Close manually' },
];

const moderationModes = [
  { id: 'auto', label: 'Auto-safe', desc: 'Auto-approve safe content' },
  { id: 'review', label: 'Review before public', desc: 'Require approval' },
  { id: 'manual', label: 'Manual approval only', desc: 'You review all' },
];

export default function FanDropRoom({ roomId, isHost, onStateChange }: { roomId?: number; isHost?: boolean; onStateChange?: (state: string) => void }) {
  const { user } = useAuth();
  const { profile, addToast } = useApp();
  const [roomState, setRoomState] = useState<'locked' | 'scheduled' | 'open' | 'closed'>('locked');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [notifyMe, setNotifyMe] = useState(false);
  const [galleryView, setGalleryView] = useState(false);
  const [gallery, setGallery] = useState<any[]>([]);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [scheduleTime, setScheduleTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const mySubmission = submissions.find(s => s.user_id === user?.id);

  const [config, setConfig] = useState({
    theme: 'Funniest BGMI Moment',
    status: 'locked' as 'locked' | 'scheduled' | 'open' | 'closed',
    allowedTypes: ['text', 'emoji', 'image', 'gif', 'sticker', 'video'],
    duration: 'manual' as string,
    scheduledAt: new Date(Date.now() + 120000),
    moderationMode: 'review' as string,
    allowHearts: true,
    doubleTapLike: true,
  });

  const notifyStateChange = (s: string) => {
    setRoomState(s as any);
    setConfig(prev => ({ ...prev, status: s as any }));
    if (s === 'scheduled') {
      setScheduleTime(config.scheduledAt || new Date(Date.now() + 120000));
    }
    onStateChange?.(s);
  };

  useEffect(() => {
    fetchGallery();
  }, [roomId]);

  useRealtimeSubscription('art_submissions', roomId ? { column: 'room_id', value: roomId } : undefined,
    (newArt: any) => {
      if (newArt.status === 'approved' && !gallery.find((g: any) => g.id === newArt.id)) {
        setGallery(prev => [...prev, newArt]);
      }
    },
    (updatedArt: any) => {
      if (updatedArt.status === 'approved') {
        setGallery(prev => prev.some(g => g.id === updatedArt.id) ? prev : [...prev, updatedArt]);
      } else {
        setGallery(prev => prev.filter(g => g.id !== updatedArt.id));
      }
    },
    (deletedArt: any) => {
      setGallery(prev => prev.filter(g => g.id !== deletedArt.id));
    },
  );

  useEffect(() => {
    if (config.status === 'scheduled' && config.scheduledAt) {
      setRoomState('scheduled');
      const tick = () => {
        const now = Date.now();
        const diff = config.scheduledAt.getTime() - now;
        if (diff <= 0) { notifyStateChange('open'); return; }
        setTimeRemaining(Math.floor(diff / 1000));
      };
      tick();
      const i = setInterval(tick, 1000);
      return () => clearInterval(i);
    }
  }, [config.status, config.scheduledAt]);

  useEffect(() => {
    if (config.status === 'open' && config.duration !== 'manual' && config.duration !== 'now') {
      const mins = parseInt(config.duration);
      if (!isNaN(mins)) {
        const endTime = Date.now() + mins * 60000;
        const tick = () => {
          const now = Date.now();
          const diff = endTime - now;
          if (diff <= 0) { notifyStateChange('closed'); return; }
          setTimeRemaining(Math.floor(diff / 1000));
        };
        tick();
        const i = setInterval(tick, 1000);
        return () => clearInterval(i);
      }
    }
  }, [config.status, config.duration]);

  const fetchGallery = async () => {
    try {
      if (!roomId) return;
      const url = `/api/art?roomId=${roomId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setGallery(data.filter((a: any) => a.status === 'approved'));
      }
    } catch { console.warn('Failed to fetch gallery'); }
    finally { setLoading(false); }
  };

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (selectedType === 'image' && !['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
      addToast({ message: 'PNG/JPG/WEBP only', type: 'error' }); return;
    }
    if (selectedType === 'gif' && ext !== 'gif') {
      addToast({ message: 'GIF only', type: 'error' }); return;
    }
    if (selectedType === 'video' && !['mp4', 'webm'].includes(ext || '')) {
      addToast({ message: 'MP4/WebM only', type: 'error' }); return;
    }
    if ((selectedType === 'image' || selectedType === 'gif') && file.size > 5 * 1024 * 1024) {
      addToast({ message: 'Max 5MB', type: 'error' }); return;
    }
    if (selectedType === 'video') {
      if (file.size > 20 * 1024 * 1024) { addToast({ message: 'Max 20MB', type: 'error' }); return; }
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 15) { addToast({ message: 'Max 15 seconds', type: 'error' }); return; }
          setSelectedFile(file);
          setPreview(URL.createObjectURL(file));
        };
        video.src = URL.createObjectURL(file);
        return;
      }
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!user) { addToast({ message: 'Sign in to submit', type: 'warning' }); return; }
    if (selectedType === 'text' && (!textInput.trim() || textInput.length > 280)) {
      addToast({ message: 'Text must be 1-280 characters', type: 'error' }); return;
    }
    addToast({ message: 'Submission sent!', type: 'success' });
    setSelectedType(null);
    setTextInput('');
    setSelectedFile(null);
    setPreview(null);
    setSelectedSticker(null);
  };

  const handleDoubleTap = (id: number) => {
    if (!config.doubleTapLike) return;
    const now = Date.now();
    if (now - lastTap < 300) { toggleLike(id); }
    setLastTap(now);
  };

  const toggleLike = (id: number) => {
    if (!config.allowHearts) return;
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const renderGalleryCard = (item: any) => {
    const isOwn = item.user_id === user?.id;
    const contentType = item.type || (item.image_url ? 'image' : 'text');
    const typeIcon = contentTypes.find(c => c.id === contentType);
    return (
      <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        onClick={() => handleDoubleTap(item.id)}
        className="bg-bg-secondary/50 rounded-xl overflow-hidden border border-arcade-pink/10 group cursor-pointer active:scale-[0.98] transition-transform"
      >
        {item.image_url ? (
          <div className="relative aspect-video bg-black/40">
            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
            {contentType === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                  <Play className="w-5 h-5 text-white ml-0.5" />
                </div>
              </div>
            )}
          </div>
        ) : item.emoji ? (
          <div className="aspect-video bg-gradient-to-br from-arcade-purple/20 to-arcade-pink/10 flex items-center justify-center text-4xl">{item.emoji}</div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-arcade-blue/10 to-arcade-purple/5 flex items-center justify-center p-4">
            <p className="text-xs text-text-primary text-center italic line-clamp-3">"{item.message}"</p>
          </div>
        )}
        <div className="p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <img src={item.avatar_url} alt="" className="w-4 h-4 rounded-full" />
            <span className="text-[10px] font-medium text-text-primary truncate">{item.username}</span>
            {typeIcon && <span className="ml-auto text-[10px] text-neutral-500">{typeIcon.label}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); toggleLike(item.id); }}
              aria-label={likedIds.has(item.id) ? 'Unlike' : 'Like'}
              className="flex items-center gap-0.5 min-h-[44px] min-w-[44px] px-1 py-1 touch-manipulation"
            >
              <motion.div animate={likedIds.has(item.id) ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                <Heart className={`w-3.5 h-3.5 ${likedIds.has(item.id) ? 'fill-arcade-pink text-arcade-pink' : 'text-neutral-400 group-hover:text-arcade-pink'} transition-colors`} />
              </motion.div>
              <span className="text-[10px] text-neutral-400">{(item.likes || 0) + (likedIds.has(item.id) ? 1 : 0)}</span>
            </button>
            {isOwn && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                item.status === 'approved' ? 'bg-arcade-green/15 text-arcade-green' :
                item.status === 'rejected' ? 'bg-arcade-pink/15 text-arcade-pink' :
                'bg-arcade-yellow/15 text-arcade-yellow'
              }`}>
                {item.status === 'approved' ? 'Approved' : item.status === 'rejected' ? 'Rejected' : 'Pending'}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderGallery = () => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-text-primary">Recent Gallery</h4>
        <span className="text-[10px] text-neutral-500">{gallery.length} items</span>
      </div>
      {gallery.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-neutral-500">No approved submissions yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {gallery.map(item => renderGalleryCard(item))}
        </div>
      )}
    </div>
  );

  const renderSubmissionForm = () => {
    if (!selectedType) {
      return (
        <div className="space-y-2">
          <p className="text-xs text-neutral-400 mb-2">What would you like to drop?</p>
          <div className="grid grid-cols-3 gap-1.5">
            {contentTypes.filter(t => config.allowedTypes.includes(t.id)).map(t => (
              <button key={t.id} onClick={() => setSelectedType(t.id)}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-arcade-yellow/30 hover:bg-white/[0.06] transition-all min-h-[44px] active:scale-[0.97] touch-manipulation"
              >
                <t.icon className="w-4 h-4 text-arcade-yellow" />
                <span className="text-[9px] text-neutral-400 font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-primary capitalize">{selectedType} submission</span>
          <button onClick={() => { setSelectedType(null); setSelectedFile(null); setPreview(null); setTextInput(''); setSelectedSticker(null); }}
            className="text-[10px] text-neutral-400 hover:text-text-primary min-h-[44px] px-2 py-1 touch-manipulation"
          >Change</button>
        </div>

        {selectedType === 'text' && (
          <div className="space-y-2">
            <textarea value={textInput} onChange={e => setTextInput(e.target.value)} maxLength={280} rows={3} placeholder="Drop your message..."
              className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-yellow/40 resize-none" />
            <div className="flex items-center justify-between">
              <span className={`text-[10px] ${textInput.length > 260 ? 'text-arcade-pink' : 'text-neutral-500'}`}>{textInput.length}/280</span>
              <button onClick={handleSubmit} disabled={!textInput.trim()}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-arcade-orange to-arcade-yellow text-white text-xs font-bold disabled:opacity-30 active:scale-[0.97] touch-manipulation flex items-center gap-1.5"
              ><Send className="w-3.5 h-3.5" /> Drop</button>
            </div>
          </div>
        )}

        {selectedType === 'emoji' && (
          <div className="space-y-2">
            <div className="grid grid-cols-6 gap-2">
              {stickers.map(s => (
                <button key={s.id} onClick={() => { setSelectedSticker(s.emoji); addToast({ message: `Added ${s.emoji}`, type: 'info' }); }}
                  className={`min-h-[44px] p-2 rounded-xl border transition-all text-xl active:scale-[0.97] touch-manipulation ${
                    selectedSticker === s.emoji ? 'border-arcade-yellow bg-arcade-yellow/10' : 'border-white/[0.08] bg-white/[0.03] hover:border-arcade-yellow/30'
                  }`}
                >{s.emoji}</button>
              ))}
            </div>
            <button onClick={handleSubmit} disabled={!selectedSticker}
              className="w-full min-h-[44px] py-2 rounded-xl bg-gradient-to-r from-arcade-orange to-arcade-yellow text-white text-xs font-bold disabled:opacity-30 active:scale-[0.97] touch-manipulation"
            >Drop Emoji {selectedSticker}</button>
          </div>
        )}

        {selectedType === 'sticker' && (
          <div className="space-y-2">
            <div className="grid grid-cols-6 gap-2">
              {stickers.map(s => (
                <button key={s.id} onClick={() => setSelectedSticker(s.emoji)}
                  className={`min-h-[44px] p-2 rounded-xl border transition-all text-xl active:scale-[0.97] touch-manipulation ${
                    selectedSticker === s.emoji ? 'border-arcade-yellow bg-arcade-yellow/10' : 'border-white/[0.08] bg-white/[0.03] hover:border-arcade-yellow/30'
                  }`}
                >{s.emoji}</button>
              ))}
            </div>
            <button onClick={handleSubmit} disabled={!selectedSticker}
              className="w-full min-h-[44px] py-2 rounded-xl bg-gradient-to-r from-arcade-orange to-arcade-yellow text-white text-xs font-bold disabled:opacity-30 active:scale-[0.97] touch-manipulation"
            >Drop Sticker {selectedSticker}</button>
          </div>
        )}

        {(selectedType === 'image' || selectedType === 'gif' || selectedType === 'video') && (
          <div className="space-y-2">
            {preview ? (
              <div className="relative rounded-xl overflow-hidden border border-arcade-pink/10 bg-black">
                {selectedType === 'video' ? (
                  <video src={preview} controls className="w-full max-h-[200px] object-contain" />
                ) : (
                  <img src={preview} alt="Preview" className="w-full max-h-[200px] object-contain" />
                )}
                <button onClick={() => { setPreview(null); setSelectedFile(null); }}
                  aria-label="Remove file"
                  className="absolute top-2 right-2 min-h-[44px] min-w-[44px] p-1.5 rounded-lg bg-black/60 text-white active:scale-[0.97] touch-manipulation"
                ><XCircle className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                className="w-full min-h-[100px] rounded-xl border-2 border-dashed border-white/[0.08] hover:border-arcade-yellow/30 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-arcade-yellow transition-all active:scale-[0.97] touch-manipulation"
              >
                <Upload className="w-6 h-6" />
                <span className="text-xs font-medium">Tap to upload {selectedType === 'video' ? 'video' : selectedType === 'gif' ? 'GIF' : 'image'}</span>
                <span className="text-[10px] text-neutral-500">{selectedType === 'video' ? 'MP4/WebM, 15s, 20MB' : selectedType === 'gif' ? 'GIF, 5MB' : 'PNG/JPG/WEBP, 5MB'}</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept={selectedType === 'video' ? 'video/mp4,video/webm' : selectedType === 'gif' ? 'image/gif' : 'image/png,image/jpeg,image/webp'} className="hidden" onChange={e => e.target.files?.[0] && processFile(e.target.files[0])} />
            {preview && (
              <button onClick={handleSubmit} className="w-full min-h-[44px] py-2 rounded-xl bg-gradient-to-r from-arcade-orange to-arcade-yellow text-white text-xs font-bold active:scale-[0.97] touch-manipulation">
                Drop {selectedType === 'video' ? 'Video' : selectedType === 'gif' ? 'GIF' : 'Image'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderLocked = () => (
    <div className="p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-arcade-blue/10 border border-arcade-blue/20 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8 text-arcade-blue" />
      </div>
      <h3 className="font-display text-lg font-bold text-text-primary mb-2">Fan Drop Room Locked</h3>
      {config.theme && <p className="text-xs text-arcade-yellow font-semibold mb-2">Theme: {config.theme}</p>}
      <p className="text-xs text-neutral-400 max-w-xs mx-auto mb-4">
        The streamer has not opened submissions yet. When opened, you can drop text, emojis, images, GIFs, stickers, videos, and more.
      </p>
      {config.scheduledAt && config.scheduledAt > new Date() && scheduleTime && timeRemaining > 0 && (
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-arcade-yellow/10 border border-arcade-yellow/20 mb-4">
          <Clock className="w-4 h-4 text-arcade-yellow" />
          <span className="text-xs font-bold text-arcade-yellow">Opens in {formatCountdown(timeRemaining)}</span>
        </div>
      )}
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => { setNotifyMe(!notifyMe); addToast({ message: notifyMe ? 'Removed notification' : 'We\'ll notify you!', type: 'success' }); }}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.97] touch-manipulation ${notifyMe ? 'bg-arcade-yellow/20 text-arcade-yellow border border-arcade-yellow/30' : 'bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-text-primary'}`}
        ><Bell className="w-3.5 h-3.5 inline mr-1.5" />{notifyMe ? 'Notifying You' : 'Notify Me When Open'}</button>
        <button onClick={() => setGalleryView(!galleryView)}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-text-primary text-xs font-bold transition-all active:scale-[0.97] touch-manipulation"
        ><Eye className="w-3.5 h-3.5 inline mr-1.5" />{galleryView ? 'Hide' : 'View Recent'} Gallery</button>
      </div>
    </div>
  );

  const renderScheduled = () => (
    <div className="p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-arcade-yellow/10 border border-arcade-yellow/20 flex items-center justify-center mx-auto mb-4">
        <Clock className="w-8 h-8 text-arcade-yellow" />
      </div>
      <h3 className="font-display text-lg font-bold text-text-primary mb-1">Fan Drop Room Opens Soon</h3>
      {config.theme && <p className="text-sm font-semibold text-arcade-yellow mb-1">Theme: {config.theme}</p>}
      <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-arcade-yellow/10 border border-arcade-yellow/20 mb-3 inline-flex">
        <Clock className="w-4 h-4 text-arcade-yellow" />
        <span className="text-lg font-mono font-bold text-arcade-yellow">{formatCountdown(timeRemaining)}</span>
      </div>
      <div className="flex items-center justify-center gap-1.5 flex-wrap mb-4">
        {contentTypes.filter(t => config.allowedTypes.includes(t.id)).map(t => (
          <span key={t.id} className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-neutral-400">{t.desc}</span>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => addToast({ message: 'Reminder set!', type: 'success' })}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-arcade-orange to-arcade-yellow text-white text-xs font-bold active:scale-[0.97] touch-manipulation"
        ><Bell className="w-3.5 h-3.5 inline mr-1.5" /> Remind Me</button>
        <button onClick={() => setGalleryView(!galleryView)}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-text-primary text-xs font-bold active:scale-[0.97] touch-manipulation"
        ><Eye className="w-3.5 h-3.5 inline mr-1.5" /> Gallery</button>
      </div>
    </div>
  );

  const renderOpen = () => (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-arcade-green animate-pulse" />
          <h3 className="font-semibold text-sm text-text-primary">Fan Drop Room Open</h3>
        </div>
        {config.duration !== 'manual' && config.duration !== 'now' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-arcade-pink/10 border border-arcade-pink/20">
            <Clock className="w-3 h-3 text-arcade-pink" />
            <span className="text-xs font-mono font-bold text-arcade-pink">{formatCountdown(timeRemaining)}</span>
          </div>
        )}
      </div>
      {config.theme && <p className="text-xs font-semibold text-arcade-yellow mb-3">Theme: {config.theme}</p>}
      <div className="space-y-3">
        {renderSubmissionForm()}
      </div>
      {gallery.length > 0 && <div className="mt-4 pt-4 border-t border-white/[0.06]">{renderGallery()}</div>}
    </div>
  );

  const renderClosed = () => (
    <div className="p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-arcade-pink/10 border border-arcade-pink/20 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8 text-arcade-pink" />
      </div>
      <h3 className="font-display text-lg font-bold text-text-primary mb-1">Fan Drop Room Closed</h3>
      <p className="text-xs text-neutral-400 max-w-xs mx-auto mb-4">Submissions are closed. You can still view and like the recent gallery.</p>
      {mySubmission && (
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-arcade-purple/10 border border-arcade-purple/20 mb-4">
          <span className="text-xs text-neutral-400">Your submission:</span>
          <span className={`text-xs font-bold ${mySubmission.status === 'approved' ? 'text-arcade-green' : mySubmission.status === 'rejected' ? 'text-arcade-pink' : 'text-arcade-yellow'}`}>
            {mySubmission.status === 'approved' ? '✅ Approved' : mySubmission.status === 'rejected' ? '❌ Rejected' : '⏳ Pending review'}
          </span>
        </div>
      )}
      <button onClick={() => setGalleryView(!galleryView)}
        className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-arcade-orange to-arcade-yellow text-white text-xs font-bold active:scale-[0.97] touch-manipulation"
      ><Eye className="w-3.5 h-3.5 inline mr-1.5" /> View Recent Gallery</button>
    </div>
  );

  const renderStreamerControls = () => (
    <div className="border-b border-arcade-pink/10">
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-arcade-pink" />
            <span className="text-xs font-bold text-text-primary">Streamer Controls</span>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} aria-label={showSettings ? 'Close settings' : 'Open settings'} className="min-h-[44px] px-2 py-1 rounded-lg text-neutral-400 hover:text-text-primary transition-all active:scale-[0.97] touch-manipulation">
            <Settings className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => notifyStateChange('open')} disabled={roomState === 'open'}
            className="min-h-[44px] px-3 py-1.5 rounded-xl bg-gradient-to-r from-arcade-orange to-arcade-yellow text-white text-[10px] font-bold disabled:opacity-30 active:scale-[0.97] touch-manipulation flex items-center gap-1"
          ><Play className="w-3 h-3" /> Open</button>
          <button onClick={() => { notifyStateChange('scheduled'); addToast({ message: 'Opening scheduled!', type: 'success' }); }}
            className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-text-primary text-[10px] font-bold active:scale-[0.97] touch-manipulation flex items-center gap-1"
          ><Clock className="w-3 h-3" /> Schedule</button>
          <button onClick={() => notifyStateChange('closed')} disabled={roomState === 'closed' || roomState === 'locked'}
            className="min-h-[44px] px-3 py-1.5 rounded-xl bg-arcade-pink/15 border border-arcade-pink/30 text-arcade-pink text-[10px] font-bold disabled:opacity-30 active:scale-[0.97] touch-manipulation flex items-center gap-1"
          ><Lock className="w-3 h-3" /> Close</button>
          <button onClick={() => addToast({ message: 'Pending cleared!', type: 'success' })}
            className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-text-primary text-[10px] font-bold active:scale-[0.97] touch-manipulation flex items-center gap-1"
          ><Trash2 className="w-3 h-3" /> Clear</button>
          <button onClick={() => setGalleryView(!galleryView)}
            className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-text-primary text-[10px] font-bold active:scale-[0.97] touch-manipulation flex items-center gap-1"
          ><Layout className="w-3 h-3" /> Gallery</button>
          <button onClick={() => addToast({ message: 'Sent to overlay!', type: 'success' })}
            className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-text-primary text-[10px] font-bold active:scale-[0.97] touch-manipulation flex items-center gap-1"
          ><Eye className="w-3 h-3" /> Overlay</button>
        </div>
      </div>
      {showSettings && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
          className="px-3 pb-3 space-y-3 border-t border-arcade-pink/10 pt-3"
        >
          <div>
            <p className="text-[10px] text-neutral-500 mb-1.5">Room Status</p>
            <div className="flex items-center gap-1.5">
              {['locked', 'scheduled', 'open', 'closed'].map(s => (
                <button key={s} onClick={() => notifyStateChange(s)}
                  className={`min-h-[44px] px-2.5 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all active:scale-[0.97] touch-manipulation ${
                    config.status === s ? 'bg-arcade-pink/20 text-arcade-pink border border-arcade-pink/30' : 'bg-white/[0.04] text-neutral-400 border border-transparent hover:text-text-primary'
                  }`}
                >{s}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 mb-1.5">Theme</p>
            <input type="text" value={config.theme} onChange={e => setConfig(prev => ({ ...prev, theme: e.target.value }))} placeholder="Set a theme..."
              className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-pink/40" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 mb-1.5">Allowed Content</p>
            <div className="grid grid-cols-3 gap-1.5">
              {contentTypes.map(t => {
                const enabled = config.allowedTypes.includes(t.id);
                return (
                  <button key={t.id} onClick={() => setConfig(prev => ({
                    ...prev,
                    allowedTypes: enabled ? prev.allowedTypes.filter(a => a !== t.id) : [...prev.allowedTypes, t.id],
                  }))}
                    className={`min-h-[44px] flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-medium transition-all active:scale-[0.97] touch-manipulation border ${
                      enabled ? 'bg-arcade-green/10 border-arcade-green/30 text-arcade-green' : 'bg-white/[0.03] border-white/[0.06] text-neutral-500'
                    }`}
                  >
                    {enabled ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 mb-1.5">Duration</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {durationOptions.map(d => (
                <button key={d.id} onClick={() => setConfig(prev => ({ ...prev, duration: d.id }))}
                  className={`min-h-[44px] px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all active:scale-[0.97] touch-manipulation ${
                    config.duration === d.id ? 'bg-arcade-blue/15 text-arcade-blue border border-arcade-blue/30' : 'bg-white/[0.03] text-neutral-400 border border-transparent hover:text-text-primary'
                  }`}
                >{d.label}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 mb-1.5">Moderation</p>
            <div className="flex items-center gap-1.5">
              {moderationModes.map(m => (
                <button key={m.id} onClick={() => setConfig(prev => ({ ...prev, moderationMode: m.id }))}
                  className={`flex-1 min-h-[44px] px-2 py-1.5 rounded-xl text-[10px] font-medium text-center transition-all active:scale-[0.97] touch-manipulation border ${
                    config.moderationMode === m.id ? 'bg-arcade-purple/15 border-arcade-purple/30 text-arcade-purple' : 'bg-white/[0.03] border-transparent text-neutral-400 hover:text-text-primary'
                  }`}
                >
                  <span className="block">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 mb-1.5">Like Voting</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setConfig(prev => ({ ...prev, allowHearts: !prev.allowHearts }))}
                className={`min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all active:scale-[0.97] touch-manipulation border ${
                  config.allowHearts ? 'bg-arcade-pink/10 border-arcade-pink/30 text-arcade-pink' : 'bg-white/[0.03] border-transparent text-neutral-500'
                }`}
              >{config.allowHearts ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />} Allow Hearts</button>
              <button onClick={() => setConfig(prev => ({ ...prev, doubleTapLike: !prev.doubleTapLike }))}
                className={`min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all active:scale-[0.97] touch-manipulation border ${
                  config.doubleTapLike ? 'bg-arcade-blue/10 border-arcade-blue/30 text-arcade-blue' : 'bg-white/[0.03] border-transparent text-neutral-500'
                }`}
              >{config.doubleTapLike ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />} Double Tap</button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  const stateIcon = roomState === 'open' ? '🟢' : roomState === 'scheduled' ? '⏰' : roomState === 'closed' ? '🔒' : '🔒';
  const stateColors: Record<string, string> = {
    open: 'bg-arcade-green/15 text-arcade-green border-arcade-green/30',
    scheduled: 'bg-arcade-yellow/15 text-arcade-yellow border-arcade-yellow/30',
    closed: 'bg-arcade-pink/15 text-arcade-pink border-arcade-pink/30',
    locked: 'bg-arcade-blue/15 text-arcade-blue border-arcade-blue/30',
  };

  return (
    <div className="bg-white/[0.03] rounded-2xl overflow-hidden border border-arcade-pink/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-arcade-pink/10">
        <div className="flex items-center gap-2">
          <span className="text-lg">{stateIcon}</span>
          <h3 className="font-semibold text-text-primary text-sm">Fan Drop</h3>
        </div>
        <div className={`px-2 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1 border ${stateColors[roomState]}`}>
          {roomState === 'open' ? '🟢 Open' : roomState === 'scheduled' ? '⏰ Soon' : roomState === 'closed' ? '🔒 Closed' : '🔒 Locked'}
        </div>
      </div>
      {isHost && renderStreamerControls()}
      <AnimatePresence mode="wait">
        {galleryView ? (
          <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-text-primary">Recent Gallery</h4>
              <button onClick={() => setGalleryView(false)} className="text-[10px] text-neutral-400 hover:text-text-primary min-h-[44px] px-2 py-1 touch-manipulation">Back</button>
            </div>
            {renderGallery()}
          </motion.div>
        ) : (
          <motion.div key={roomState} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {roomState === 'locked' && renderLocked()}
            {roomState === 'scheduled' && renderScheduled()}
            {roomState === 'open' && renderOpen()}
            {roomState === 'closed' && renderClosed()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

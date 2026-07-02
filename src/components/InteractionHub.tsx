import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Volume2, VolumeX, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../context/AppContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';

const quickEmojis = [{ emoji: '🔥' }, { emoji: '❤️' }, { emoji: '👍' }, { emoji: '⭐' }, { emoji: '⚡' }, { emoji: '👑' }];

export default function InteractionHub({ roomId }: { roomId?: number }) {
  const { user } = useAuth();
  const { profile, refreshProfile, addToast } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [tab, setTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [ttsText, setTtsText] = useState('');
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!roomId) return;
    try {
      const url = `/api/chat?roomId=${roomId}`;
      const res = await fetch(url);
      if (res.ok) setMessages(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [roomId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  useRealtimeSubscription('chat_messages', roomId ? { column: 'room_id', value: roomId } : undefined,
    (newMsg: any) => { setMessages(prev => [...prev, newMsg]); },
  );

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (isSuper = false) => {
    if (!message.trim()) return;
    if (!user) { addToast({ message: 'Sign in to chat', type: 'warning' }); return; }
    if (isSuper && (profile?.coins ?? 0) < 10) { addToast({ message: 'Need 10 coins for Super Chat', type: 'error' }); return; }
    if (!roomId) return;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId, user_id: user.id,
          username: profile?.username || user.email?.split('@')[0],
          message, amount: isSuper ? 10 : 0,
          color: isSuper ? '#FFB000' : '#FFF2DD', is_super: isSuper,
        }),
      });
      if (res.ok) {
        setMessage('');
        if (isSuper) { await refreshProfile(); addToast({ message: 'Super Chat sent!', type: 'success' }); }
        fetchMessages();
      }
    } catch { addToast({ message: 'Send failed', type: 'error' }); }
  };

  const speakTTS = () => {
    if (!ttsText.trim()) return;
    if ((profile?.coins ?? 0) < 5) { addToast({ message: 'Need 5 coins', type: 'error' }); return; }
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(ttsText);
      u.rate = 1; u.pitch = 1.2; u.volume = volume / 100;
      window.speechSynthesis.speak(u);
      addToast({ message: 'AI Host announced!', type: 'success' });
      setTtsText('');
    }
  };

  const sendEmoji = async (emoji: string) => {
    if (!user) return;
    try {
      if (!roomId) return;
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId, user_id: user.id,
          username: profile?.username || user.email?.split('@')[0],
          message: emoji, amount: 0, color: '#FF5A1F', is_super: false,
        }),
      });
      fetchMessages();
    } catch { console.warn('Failed to send emoji'); }
  };

  return (
    <div className="bg-white/[0.03] rounded-2xl overflow-hidden border border-arcade-pink/10 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-arcade-pink/10">
        <div className="flex items-center gap-2"><span className="text-lg">💬</span><h3 className="font-semibold text-text-primary text-sm">Chat</h3></div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMuted(!muted)} aria-label={muted ? 'Unmute chat sounds' : 'Mute chat sounds'} className="min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto p-1.5 rounded-lg hover:bg-white/5 text-neutral-400">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-14 h-1 bg-bg-secondary rounded-full accent-arcade-blue" />
        </div>
      </div>
      <div className="flex border-b border-arcade-pink/10">
        {['chat', 'tts'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 min-h-[44px] sm:min-h-auto py-2 text-[11px] font-bold transition-colors capitalize ${tab === t ? 'text-arcade-pink border-b-2 border-arcade-pink' : 'text-text-muted hover:text-text-primary'}`}>
            {t === 'tts' ? 'AI Voice' : t}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {tab === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
                {loading ? (
                  <div className="py-6 text-center"><div className="w-5 h-5 border-2 border-arcade-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : messages.map(chat => (
                  <motion.div key={chat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-2.5 rounded-xl ${chat.is_super ? 'bg-gradient-to-r from-arcade-yellow/15 to-arcade-pink/10 border border-arcade-yellow/25' : 'bg-bg-secondary/50'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold" style={{ color: chat.color }}>{chat.username}</span>
                      {chat.is_super && <span className="px-1.5 py-0.5 rounded-full bg-arcade-yellow/20 text-arcade-yellow text-[10px] font-bold">{chat.amount} 🎲</span>}
                    </div>
                    <p className="text-sm text-text-primary break-words">{chat.message}</p>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 border-t border-arcade-pink/10 space-y-2">
                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                    {quickEmojis.map((e, i) => (
                    <button key={i} onClick={() => sendEmoji(e.emoji)} aria-label={`Send ${e.emoji} emoji`} className="min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto w-8 h-8 rounded-lg bg-bg-secondary hover:bg-white/10 flex items-center justify-center text-sm transition-colors shrink-0">{e.emoji}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type..."
                    className="flex-1 bg-bg-secondary border border-arcade-pink/10 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-pink/40" />
                  <button onClick={() => sendMessage()} aria-label="Send message" className="min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto p-2 rounded-xl bg-arcade-blue/20 text-arcade-blue hover:bg-arcade-blue/30"><Send className="w-4 h-4" /></button>
                  <button onClick={() => sendMessage(true)} className="min-h-[44px] sm:min-h-auto px-3 py-2 rounded-xl bg-gradient-to-r from-arcade-yellow to-arcade-pink text-white text-[10px] font-bold hover:opacity-90">Super</button>
                </div>
              </div>
            </motion.div>
          )}
          {tab === 'tts' && (
            <motion.div key="tts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-arcade-purple/10 border border-arcade-purple/30">
                <Mic className="w-5 h-5 text-arcade-purple" />
                <div><p className="text-sm font-medium text-text-primary">AI Host Voice</p><p className="text-xs text-neutral-400">5 coins per msg</p></div>
              </div>
              <textarea value={ttsText} onChange={e => setTtsText(e.target.value)} placeholder="What should AI say..." rows={3}
                className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-purple/40 resize-none" />
              <button onClick={speakTTS} disabled={!ttsText.trim()}
                className="w-full min-h-[44px] sm:min-h-auto py-2.5 rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-pink text-white text-sm font-bold hover:opacity-90 disabled:opacity-30 flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" />Announce (5🎲)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Coins, Sparkles, Bot, Shield, Trophy, Star, Crown, Youtube, Check, X, UserPlus, Ban, Eye, Moon, Sun, Filter, ArrowDown, Smartphone } from 'lucide-react';

export type FeedEntryType = 'youtube_chat' | 'youtube_superchat' | 'arena_shoutout' | 'arena_join' | 'coin' | 'selection' | 'fan_drop' | 'ai' | 'moderation' | 'system' | 'join_link';

interface ModerationResult {
  level: 'safe' | 'mild' | 'restricted' | 'severe';
  reason?: string;
}

export interface FeedEntry {
  id: number;
  type: FeedEntryType;
  username: string;
  avatar_url?: string;
  text: string;
  time: string;
  amount?: number;
  moderation?: ModerationResult;
}

interface LiveFeedProps {
  entries?: FeedEntry[];
  onAllowShoutout?: (id: number) => void;
  onRejectShoutout?: (id: number) => void;
  addToast: (t: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
  height?: string;
  roomCode?: string;
}

type FilterTab = 'all' | 'chat' | 'arena' | 'alerts';

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'chat', label: 'Chat' },
  { id: 'arena', label: 'Arena' },
  { id: 'alerts', label: 'Alerts' },
];

const typeConfig: Record<string, { icon: typeof MessageSquare; color: string; prefix: string; group: 'chat' | 'arena' | 'alerts' }> = {
  youtube_chat: { icon: Youtube, color: 'text-red-400', prefix: 'YT', group: 'chat' },
  youtube_superchat: { icon: Star, color: 'text-arcade-yellow', prefix: 'YT Super Chat', group: 'chat' },
  arena_shoutout: { icon: Crown, color: 'text-arcade-purple', prefix: 'Shoutout', group: 'arena' },
  arena_join: { icon: UserPlus, color: 'text-arcade-blue', prefix: 'Arena', group: 'arena' },
  coin: { icon: Coins, color: 'text-arcade-yellow', prefix: 'Coin', group: 'arena' },
  selection: { icon: Trophy, color: 'text-arcade-green', prefix: 'Selection', group: 'arena' },
  fan_drop: { icon: Sparkles, color: 'text-arcade-pink', prefix: 'Fan Drop', group: 'arena' },
  ai: { icon: Bot, color: 'text-arcade-purple', prefix: 'AI', group: 'alerts' },
  moderation: { icon: Shield, color: 'text-arcade-orange', prefix: 'Mod', group: 'alerts' },
  system: { icon: MessageSquare, color: 'text-neutral-400', prefix: 'System', group: 'alerts' },
  join_link: { icon: Smartphone, color: 'text-arcade-green', prefix: 'Join', group: 'alerts' },
};

const mockEntries: FeedEntry[] = [
  { id: 1, type: 'youtube_chat', username: 'RajGamer', text: 'bhai next match?', time: 'now' },
  { id: 2, type: 'youtube_superchat', username: 'Priya', text: 'great stream!', time: '30s', amount: 100 },
  { id: 3, type: 'arena_join', username: 'Rahul', text: 'joined Player Lobby', time: '1m' },
  { id: 4, type: 'arena_shoutout', username: 'Neha', text: 'pick me next!', time: '1m', amount: 50, moderation: { level: 'safe' } },
  { id: 5, type: 'coin', username: 'Vikram', text: '50 coins held', time: '1m', amount: 50 },
  { id: 6, type: 'selection', username: 'Priya', text: 'selected for main game', time: '2m' },
  { id: 7, type: 'arena_shoutout', username: 'Anon', text: 'you are a terrible streamer and i hope you fail', time: '3m', amount: 30, moderation: { level: 'restricted', reason: 'Negative language detected' } },
  { id: 8, type: 'fan_drop', username: 'Sofia', text: 'submitted image "sketch.png"', time: '3m' },
  { id: 9, type: 'ai', username: 'AI Host', text: 'Round 2 finished — Aman leading', time: '4m' },
  { id: 10, type: 'moderation', username: 'System', text: 'Severe message blocked automatically', time: '5m', moderation: { level: 'severe' } },
  { id: 11, type: 'moderation', username: 'System', text: 'Suspicious link blocked from SpamBot', time: '6m', moderation: { level: 'severe' } },
];

export default function LiveFeed({ entries: _entries, onAllowShoutout, onRejectShoutout, addToast, roomCode }: LiveFeedProps) {
  const [entries, setEntries] = useState<FeedEntry[]>(_entries && _entries.length > 0 ? _entries : mockEntries);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [darkFeed, setDarkFeed] = useState(true);
  const [pinned, setPinned] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef(true);

  useEffect(() => {
    if (!roomCode) return;
    try {
      const ch = new BroadcastChannel(`streamarena-${roomCode}`);
      ch.onmessage = (e) => {
        if (e.data?.type === 'show_qr') {
          setEntries(prev => [{ id: Date.now(), type: 'join_link', username: 'StreamArena', text: `🔗 Join link shared to stream — ${window.location.origin}/room/${roomCode}`, time: 'now' }, ...prev]);
        }
      };
      return () => ch.close();
    } catch { console.warn('BroadcastChannel not supported'); return; }
  }, [roomCode]);

  const filteredEntries = filter === 'all'
    ? entries
    : entries.filter(e => (typeConfig[e.type]?.group || 'alerts') === filter);

  const scrollToBottom = useCallback((smooth = false) => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (atBottom !== pinRef.current) {
      pinRef.current = atBottom;
      setPinned(atBottom);
      if (atBottom) setNewCount(0);
    }
  }, []);

  const jumpToBottom = useCallback(() => {
    scrollToBottom(true);
    pinRef.current = true;
    setPinned(true);
    setNewCount(0);
  }, [scrollToBottom]);

  useEffect(() => {
    if (pinRef.current) {
      scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight);
    } else {
      setNewCount(c => c + 1);
    }
  }, [filteredEntries.length]);

  const handleAllow = (id: number) => {
    onAllowShoutout?.(id);
    setEntries(prev => prev.map(e => e.id === id ? { ...e, moderation: { level: 'safe' } } : e));
    addToast({ message: 'Shoutout allowed', type: 'success' });
  };

  const handleReject = (id: number) => {
    onRejectShoutout?.(id);
    setEntries(prev => prev.filter(e => e.id !== id));
    addToast({ message: 'Shoutout rejected — coins returned', type: 'info' });
  };

  return (
    <div className={`rounded-2xl border overflow-hidden flex flex-col ${
      darkFeed
        ? 'bg-white/[0.03] border-arcade-pink/10'
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 ${
        darkFeed ? 'border-b border-arcade-pink/10' : 'border-b border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <MessageSquare className={`w-4 h-4 ${darkFeed ? 'text-arcade-blue' : 'text-gray-700'}`} />
          <h3 className={`font-semibold text-sm ${darkFeed ? 'text-text-primary' : 'text-gray-900'}`}>Live Feed</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] tabular-nums ${darkFeed ? 'text-text-muted' : 'text-gray-400'}`}>{filteredEntries.length} items</span>
          <button onClick={() => setDarkFeed(p => !p)}
            aria-label={darkFeed ? 'Switch to light feed' : 'Switch to dark feed'}
            className={`p-1.5 rounded-lg transition-all touch-manipulation ${
              darkFeed ? 'text-arcade-yellow hover:bg-white/[0.04]' : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={darkFeed ? 'Switch to light feed' : 'Switch to dark feed'}
          >{darkFeed ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}</button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={`flex border-b ${
        darkFeed ? 'border-arcade-pink/10' : 'border-gray-200'
      }`}>
        {filterTabs.map(tab => (
          <button key={tab.id} onClick={() => setFilter(tab.id)}
            className={`flex-1 min-h-[36px] text-[10px] font-semibold transition-all ${
              filter === tab.id
                ? darkFeed ? 'text-arcade-pink bg-arcade-pink/5' : 'text-arcade-pink bg-arcade-pink/5'
                : darkFeed ? 'text-text-muted hover:text-text-primary' : 'text-gray-400 hover:text-gray-700'
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {/* Feed */}
      <div ref={scrollRef} onScroll={handleScroll} className="overflow-y-auto no-scrollbar flex-1 relative" style={{ height: 'auto', minHeight: 0 }}>
        {!pinned && newCount > 0 && (
          <button onClick={jumpToBottom}
            className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg transition-all touch-manipulation ${
              darkFeed
                ? 'bg-arcade-purple text-white hover:bg-arcade-purple/90'
                : 'bg-arcade-purple text-white hover:bg-arcade-purple/90'
            }`}
          ><ArrowDown className="w-3 h-3" /> {newCount} new</button>
        )}
        <div className="p-1.5 space-y-0.5">
          <AnimatePresence initial={false}>
            {filteredEntries.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare className={`w-6 h-6 mx-auto mb-1 opacity-40 ${darkFeed ? 'text-text-muted' : 'text-gray-400'}`} />
                <p className={`text-xs ${darkFeed ? 'text-text-muted' : 'text-gray-400'}`}>No {filter} items</p>
              </div>
            ) : filteredEntries.map((entry) => {
              const cfg = typeConfig[entry.type] || typeConfig.system;
              const Icon = cfg.icon;
              const mod = entry.moderation?.level;
              const isRestricted = mod === 'restricted';
              const isSevere = mod === 'severe';

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={isRestricted ? { opacity: 0, x: -20 } : undefined}
                  className={`group flex items-start gap-2.5 p-2.5 rounded-xl transition-colors ${
                    isRestricted
                      ? darkFeed ? 'bg-arcade-yellow/5 border border-arcade-yellow/20' : 'bg-yellow-50 border border-yellow-200'
                      : isSevere
                        ? darkFeed ? 'bg-red-500/5 border border-red-500/20' : 'bg-red-50 border border-red-200'
                        : darkFeed ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${cfg.color} ${
                    darkFeed ? 'bg-white/[0.04] border-white/[0.06]' : 'bg-gray-100 border-gray-200'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Top line: prefix + username + time + badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[11px] font-bold ${cfg.color} px-1.5 py-0.5 rounded shrink-0 ${
                        darkFeed ? 'bg-white/[0.04]' : 'bg-gray-100'
                      }`}>[{cfg.prefix}]</span>
                      <span className={`text-xs font-semibold truncate ${darkFeed ? 'text-text-primary' : 'text-gray-900'}`}>{entry.username}</span>
                      <span className={`text-[10px] shrink-0 ${darkFeed ? 'text-text-muted' : 'text-gray-400'}`}>{entry.time}</span>
                      {entry.amount && (
                        <span className={`flex items-center gap-0.5 text-[10px] font-bold text-arcade-yellow px-1.5 py-0.5 rounded shrink-0 ${
                          darkFeed ? 'bg-arcade-yellow/10' : 'bg-arcade-yellow/10'
                        }`}>
                          <Coins className="w-2.5 h-2.5" />{entry.amount}
                        </span>
                      )}
                      {isRestricted && (
                        <span className={`text-[8px] font-bold shrink-0 px-1.5 py-0.5 rounded ${
                          darkFeed ? 'text-arcade-yellow bg-arcade-yellow/15' : 'text-yellow-700 bg-yellow-100'
                        }`}>RESTRICTED</span>
                      )}
                      {isSevere && (
                        <span className={`text-[8px] font-bold shrink-0 px-1.5 py-0.5 rounded ${
                          darkFeed ? 'text-red-400 bg-red-500/15' : 'text-red-700 bg-red-100'
                        }`}>SEVERE</span>
                      )}
                    </div>
                    {/* Main message text - larger */}
                    <p className={`text-sm leading-relaxed mt-1 ${
                      darkFeed ? 'text-text-primary' : 'text-gray-800'
                    }`}>{entry.text}</p>

                    {/* Restricted: Allow / Reject */}
                    {isRestricted && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <button onClick={() => handleAllow(entry.id)}
                          className={`min-h-[32px] px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 touch-manipulation ${
                            darkFeed
                              ? 'bg-arcade-green/15 border border-arcade-green/30 text-arcade-green hover:bg-arcade-green/25'
                              : 'bg-green-100 border border-green-300 text-green-700 hover:bg-green-200'
                          }`}
                        ><Check className="w-3 h-3" /> Allow</button>
                        <button onClick={() => handleReject(entry.id)}
                          className={`min-h-[32px] px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 touch-manipulation ${
                            darkFeed
                              ? 'bg-arcade-pink/15 border border-arcade-pink/30 text-arcade-pink hover:bg-arcade-pink/25'
                              : 'bg-red-100 border border-red-300 text-red-700 hover:bg-red-200'
                          }`}
                        ><X className="w-3 h-3" /> Reject</button>
                      </div>
                    )}

                    {/* Severe: View only */}
                    {isSevere && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <button onClick={() => addToast({ message: 'Blocked message details', type: 'info' })}
                          className={`min-h-[32px] px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 touch-manipulation ${
                            darkFeed
                              ? 'bg-white/[0.05] border border-white/[0.1] text-neutral-400 hover:text-text-primary'
                              : 'bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-700'
                          }`}
                        ><Eye className="w-3 h-3" /> View</button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className={`px-3 py-1.5 flex items-center gap-2 text-[8px] justify-center flex-wrap ${
        darkFeed ? 'border-t border-arcade-pink/10 text-text-muted' : 'border-t border-gray-200 text-gray-400'
      }`}>
        <span className="flex items-center gap-1"><Youtube className="w-2.5 h-2.5 text-red-400" />YT</span>
        <span className="flex items-center gap-1"><Crown className="w-2.5 h-2.5 text-arcade-purple" />Shoutout</span>
        <span className="flex items-center gap-1"><Coins className="w-2.5 h-2.5 text-arcade-yellow" />Coin</span>
        <span className="flex items-center gap-1"><Trophy className="w-2.5 h-2.5 text-arcade-green" />Selection</span>
        <span className="flex items-center gap-1"><Sparkles className="w-2.5 h-2.5 text-arcade-pink" />Fan Drop</span>
        <span className="flex items-center gap-1"><Bot className="w-2.5 h-2.5 text-arcade-purple" />AI</span>
        <span className="flex items-center gap-1"><Shield className="w-2.5 h-2.5 text-arcade-orange" />Mod</span>
        <span className="flex items-center gap-1"><Smartphone className="w-2.5 h-2.5 text-arcade-green" />Join</span>
      </div>
    </div>
  );
}

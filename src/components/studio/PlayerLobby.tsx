import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, UserPlus, Clock, Coins, Trophy, X, Undo2, Check, RefreshCw, Target, Award, Medal, Flame, Activity } from 'lucide-react';

export interface PlayerStats {
  skillScore: number;
  winRate: number;
  gamesPlayed: number;
  coinsEarned: number;
  streak: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  accuracy?: number;
  avgScore?: number;
  lastGames: ('win' | 'loss' | 'draw')[];
  topGame?: string;
}

export interface LobbyPlayer {
  id: number;
  username: string;
  avatar_url: string;
  method?: string;
  score?: number;
  coins_held?: number;
  team?: string;
  status: 'waiting' | 'selected' | 'replaced' | 'completed';
  joined_at: string;
  stats?: PlayerStats;
}

interface PlayerLobbyProps {
  playersNeeded: number;
  players: LobbyPlayer[];
  onSelect: (id: number) => void;
  onReplace: (id: number) => void;
  onRemove: (id: number) => void;
  onReturnCoins: (id: number) => void;
  onInvite: () => void;
  onStartGame: () => void;
  gameActive: boolean;
  mainGame: string;
  addToast: (t: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

const tabs = [
  { id: 'waiting', label: 'Waiting', icon: Users },
  { id: 'selected', label: 'Selected', icon: UserCheck },
  { id: 'teams', label: 'Teams', icon: Trophy },
  { id: 'history', label: 'History', icon: Clock },
];

// Mock data removed — empty states below handle no-data gracefully

const teamNames = ['Team A', 'Team B', 'Team C', 'Team D'];

export default function PlayerLobby({
  playersNeeded, players: _players, onSelect, onReplace, onRemove, onReturnCoins,
  onInvite, onStartGame, gameActive, mainGame, addToast,
}: PlayerLobbyProps) {
  const [activeTab, setActiveTab] = useState('selected');
  const players = _players;

  const selected = players.filter(p => p.status === 'selected');
  const waiting = players.filter(p => p.status === 'waiting');
  const replaced = players.filter(p => p.status === 'replaced');
  const completed = players.filter(p => p.status === 'completed');
  const selectedCount = selected.length;
  const showReady = selectedCount >= playersNeeded;

  const rankConfig: Record<string, { color: string; bg: string; border: string; icon: typeof Award }> = {
    Bronze: { color: 'text-orange-400', bg: 'bg-orange-400/15', border: 'border-orange-400/30', icon: Award },
    Silver: { color: 'text-gray-300', bg: 'bg-gray-300/15', border: 'border-gray-300/30', icon: Award },
    Gold: { color: 'text-arcade-yellow', bg: 'bg-arcade-yellow/15', border: 'border-arcade-yellow/30', icon: Medal },
    Platinum: { color: 'text-cyan-400', bg: 'bg-cyan-400/15', border: 'border-cyan-400/30', icon: Medal },
    Diamond: { color: 'text-arcade-pink', bg: 'bg-arcade-pink/15', border: 'border-arcade-pink/30', icon: Trophy },
  };

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const renderPlayerCard = (player: LobbyPlayer, showActions: boolean) => {
    const s = player.stats;
    const isExpanded = expandedId === player.id;
    const rankCfg = s ? rankConfig[s.rank] || rankConfig.Bronze : null;

    return (
      <motion.div key={player.id} layout className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <motion.div
          layout
          onClick={() => setExpandedId(isExpanded ? null : player.id)}
          className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-white/[0.04] transition-colors"
        >
          {/* Avatar with rank glow */}
          <div className="relative shrink-0">
            <img src={player.avatar_url} alt={player.username} className="w-9 h-9 rounded-full border border-white/[0.08]" />
            {s && (
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${rankCfg?.bg} ${rankCfg?.border} border flex items-center justify-center`}>
                <span className="text-[6px] font-black">{s.rank === 'Diamond' ? '💎' : s.rank === 'Platinum' ? '🔷' : s.rank === 'Gold' ? '⭐' : '🏅'}</span>
              </div>
            )}
          </div>

          {/* Name + method */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-text-primary truncate">{player.username}</span>
              {player.team && (
                <span className="px-1.5 py-0.5 rounded text-[7px] font-bold bg-arcade-purple/15 text-arcade-purple border border-arcade-purple/20 shrink-0">{player.team}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {player.method && <span className="text-[8px] text-text-muted">{player.method}</span>}
              {player.score && <span className="text-[8px] text-arcade-green font-medium">+{player.score} pts</span>}
              {player.coins_held && <span className="text-[8px] text-arcade-yellow flex items-center gap-0.5"><Coins className="w-2 h-2" />{player.coins_held}</span>}
            </div>
          </div>

          {/* Skill score + rank */}
          {s && (
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <div className={`text-lg font-black tabular-nums ${rankCfg?.color}`}>{s.skillScore}</div>
                <div className={`text-[7px] font-bold uppercase tracking-wider ${rankCfg?.color}`}>{s.rank}</div>
              </div>
              <div className={`w-1 h-8 rounded-full ${rankCfg?.bg}`} style={{ background: `linear-gradient(to top, ${rankCfg?.color.replace('text-', '') || '#888'}, transparent)` }} />
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
              {player.status === 'waiting' && (
                <>
                  <button onClick={() => { onSelect(player.id); addToast({ message: `${player.username} selected!`, type: 'success' }); }}
                    aria-label={`Select ${player.username}`}
                    className="min-h-[32px] min-w-[32px] p-1.5 rounded-lg bg-arcade-green/15 text-arcade-green hover:bg-arcade-green/25 transition-all" title="Select"
                  ><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { onRemove(player.id); if (player.coins_held) { onReturnCoins(player.id); } addToast({ message: `${player.username} removed`, type: 'info' }); }}
                    aria-label={`Remove ${player.username}`}
                    className="min-h-[32px] min-w-[32px] p-1.5 rounded-lg text-neutral-500 hover:text-arcade-pink hover:bg-arcade-pink/10 transition-all" title="Remove"
                  ><X className="w-3.5 h-3.5" /></button>
                </>
              )}
              {player.status === 'selected' && (
                <>
                  <button onClick={() => { onReplace(player.id); onReturnCoins(player.id); addToast({ message: `${player.username} replaced`, type: 'info' }); }}
                    aria-label={`Replace ${player.username}`}
                    className="min-h-[32px] min-w-[32px] p-1.5 rounded-lg bg-arcade-yellow/15 text-arcade-yellow hover:bg-arcade-yellow/25 transition-all" title="Replace"
                  ><RefreshCw className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { onRemove(player.id); addToast({ message: `${player.username} removed`, type: 'warning' }); }}
                    aria-label={`Remove ${player.username}`}
                    className="min-h-[32px] min-w-[32px] p-1.5 rounded-lg text-neutral-500 hover:text-arcade-pink hover:bg-arcade-pink/10 transition-all" title="Remove"
                  ><X className="w-3.5 h-3.5" /></button>
                </>
              )}
              {player.status === 'replaced' && player.coins_held && (
                <button onClick={() => { onReturnCoins(player.id); addToast({ message: `${player.coins_held} coins returned`, type: 'success' }); }}
                  aria-label={`Return ${player.coins_held} coins to ${player.username}`}
                  className="min-h-[32px] min-w-[32px] p-1.5 rounded-lg bg-arcade-yellow/15 text-arcade-yellow hover:bg-arcade-yellow/25 transition-all" title="Return coins"
                ><Undo2 className="w-3.5 h-3.5" /></button>
              )}
            </div>
          )}
        </motion.div>

        {/* Expanded stats */}
        <AnimatePresence>
          {isExpanded && s && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/[0.06]"
            >
              <div className="p-3 space-y-3">
                {/* Stat grid */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Target className="w-3 h-3 text-arcade-green" />
                    </div>
                    <div className="text-sm font-black text-arcade-green tabular-nums">{s.winRate}%</div>
                    <div className="text-[7px] text-text-muted">Win Rate</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Activity className="w-3 h-3 text-arcade-blue" />
                    </div>
                    <div className="text-sm font-black text-arcade-blue tabular-nums">{s.gamesPlayed}</div>
                    <div className="text-[7px] text-text-muted">Games</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Flame className="w-3 h-3 text-arcade-orange" />
                    </div>
                    <div className={`text-sm font-black tabular-nums ${s.streak > 0 ? 'text-arcade-orange' : 'text-neutral-500'}`}>{s.streak}</div>
                    <div className="text-[7px] text-text-muted">Streak</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Coins className="w-3 h-3 text-arcade-yellow" />
                    </div>
                    <div className="text-sm font-black text-arcade-yellow tabular-nums">{(s.coinsEarned / 1000).toFixed(1)}k</div>
                    <div className="text-[7px] text-text-muted">Earned</div>
                  </div>
                </div>

                {/* Skill bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] text-text-muted">Skill Rating</span>
                    <span className={`text-[9px] font-bold ${rankCfg?.color}`}>{s.skillScore}/100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.skillScore}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${rankCfg?.color.replace('text-', '') || '#888'}, ${rankCfg?.color.replace('text-', '') || '#888'}88)` }}
                    />
                  </div>
                </div>

                {/* Extra stats row */}
                <div className="flex items-center justify-between text-[8px] text-text-muted">
                  {s.accuracy && <span>Accuracy: <span className="font-bold text-text-primary">{s.accuracy}%</span></span>}
                  {s.avgScore && <span>Avg Score: <span className="font-bold text-text-primary">{s.avgScore}</span></span>}
                  {s.topGame && <span>Top Game: <span className="font-bold text-text-primary">{s.topGame}</span></span>}
                </div>

                {/* Recent games */}
                {s.lastGames.length > 0 && (
                  <div>
                    <span className="text-[8px] text-text-muted block mb-1.5">Recent Results</span>
                    <div className="flex items-center gap-1.5">
                      {s.lastGames.map((result, i) => (
                        <div key={i} className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold ${
                          result === 'win' ? 'bg-arcade-green/20 text-arcade-green' :
                          result === 'loss' ? 'bg-arcade-pink/20 text-arcade-pink' :
                          'bg-arcade-yellow/20 text-arcade-yellow'
                        }`}>
                          {result === 'win' ? 'W' : result === 'loss' ? 'L' : 'D'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'waiting':
        return waiting.length === 0
          ? <p className="text-xs text-text-muted text-center py-6">No waiting players</p>
          : <div className="space-y-1.5">{waiting.map(p => renderPlayerCard(p, true))}</div>;
      case 'selected':
        return (
          <div className="space-y-3">
            {selected.length === 0
              ? <p className="text-xs text-text-muted text-center py-6">No players selected yet — run a Selection to fill the lobby</p>
              : <div className="space-y-1.5">{selected.map(p => renderPlayerCard(p, true))}</div>
            }
            {showReady && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { onStartGame(); addToast({ message: `${mainGame} started with ${selectedCount} players!`, type: 'success' }); }}
                className="w-full min-h-[44px] py-2.5 rounded-xl bg-gradient-to-r from-arcade-green to-arcade-blue text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-arcade-green/15"
              ><Trophy className="w-4 h-4" /> Start {mainGame} ({selectedCount}v{selectedCount > 1 ? selectedCount : 1})</motion.button>
            )}
          </div>
        );
      case 'teams':
        return (
          <div className="space-y-3">
            {selected.length === 0
              ? <p className="text-xs text-text-muted text-center py-6">Select players first to assign teams</p>
              : teamNames.slice(0, Math.ceil(selectedCount / 2)).map((team, i) => {
                  const teamPlayers = selected.filter(p => p.team === team);
                  if (teamPlayers.length === 0) return null;
                  return (
                    <div key={team} className="space-y-1.5">
                      <p className="text-[10px] font-bold text-arcade-purple uppercase tracking-wider">{team} ({teamPlayers.length})</p>
                      {teamPlayers.map(p => renderPlayerCard(p, false))}
                    </div>
                  );
                })
            }
          </div>
        );
      case 'history':
        return (
          <div className="space-y-3">
            {[...replaced, ...completed].length === 0
              ? <p className="text-xs text-text-muted text-center py-6">No history yet</p>
              : <div className="space-y-1.5">
                  {replaced.map(p => renderPlayerCard(p, true))}
                  {completed.map(p => renderPlayerCard(p, false))}
                </div>
            }
          </div>
        );
    }
  };

  return (
    <div className="bg-white/[0.03] rounded-2xl border border-arcade-purple/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-arcade-purple/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-arcade-purple/30 to-arcade-blue/20 border border-arcade-purple/30 flex items-center justify-center">
            <Users className="w-4 h-4 text-arcade-purple" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Player Lobby</h3>
            <p className="text-[10px] text-text-muted">{selectedCount}/{playersNeeded} selected · {waiting.length} waiting</p>
          </div>
        </div>
        <button onClick={() => { onInvite(); addToast({ message: 'Invite link generated', type: 'success' }); }}
          className="min-h-[36px] px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-neutral-400 text-[10px] font-bold hover:text-text-primary hover:bg-white/[0.08] transition-all flex items-center gap-1"
        ><UserPlus className="w-3 h-3" /> Invite</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-arcade-purple/10">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-h-[40px] py-2 text-[10px] font-bold transition-colors relative ${
                active ? 'text-arcade-purple' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <Icon className="w-3 h-3" />{tab.label}
              </span>
              {active && <motion.div layoutId="lobbyTab" className="absolute bottom-0 left-2 right-2 h-0.5 bg-arcade-purple rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="max-h-[320px] overflow-y-auto no-scrollbar p-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            {getTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Coin info */}
      <div className="px-3 py-2 border-t border-arcade-purple/10">
        <p className="text-[9px] text-text-muted text-center">
          <Coins className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />
          Coins held when entered · spent only if selected · returned if not selected or stream ends
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Brain, Zap, Hash, ThumbsUp, Coins, Shuffle, UserCheck, Layers, Play, Trophy, StopCircle, Eye, X, UserPlus, Users, Clock, Check, UsersRound, RefreshCw } from 'lucide-react';

const mainGames = [
  'BGMI', 'Free Fire MAX', 'Valorant', 'COD Mobile', 'GTA V', 'Minecraft',
  'Clash Royale', 'eFootball', 'FIFA',
];

const playerOptions = [1, 2, 4, 6, 10, 15, 20];

const durationOptions = [
  { value: 30, label: '30 sec' },
  { value: 60, label: '1 min' },
  { value: 120, label: '2 min' },
  { value: 0, label: 'Custom' },
];

const selectionMethods = [
  { id: 'ai_quiz', label: 'AI Quiz', icon: Brain, desc: 'Auto-generated challenge' },
  { id: 'fastest', label: 'Fastest Finger', icon: Zap, desc: 'First to answer wins' },
  { id: 'guess', label: 'Guess Number', icon: Hash, desc: 'Closest number wins' },
  { id: 'prediction', label: 'Prediction', icon: ThumbsUp, desc: 'Vote on outcomes' },
  { id: 'coin', label: 'Coin Priority', icon: Coins, desc: 'Highest coins first' },
  { id: 'random', label: 'Random Pick', icon: Shuffle, desc: 'Fair random draw' },
  { id: 'pick', label: 'Streamer Pick', icon: UserCheck, desc: 'You choose' },
  { id: 'hybrid', label: 'Hybrid', icon: Layers, desc: 'AI + Priority + Random' },
];

interface SelectionArenaProps {
  onStartSelection: (config: SelectionConfig) => void;
  onResetSelection: () => void;
  selectionActive: boolean;
  selectedCount?: number;
  playersNeeded?: number;
  addToast: (t: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

export interface SelectionConfig {
  mainGame: string;
  playerCount: number;
  teamMode: boolean;
  selectionMethod: string;
  rounds?: number;
  duration?: number;
}

export default function SelectionArena({ onStartSelection, onResetSelection, selectionActive, selectedCount = 0, playersNeeded = 0, addToast }: SelectionArenaProps) {
  const [mainGame, setMainGame] = useState('BGMI');
  const [customGame, setCustomGame] = useState('');
  const [showCustomGameInput, setShowCustomGameInput] = useState(false);
  const [selectionMethod, setSelectionMethod] = useState('');

  // Popup 1: Player count
  const [showPopup1, setShowPopup1] = useState(false);
  const [playerCount, setPlayerCount] = useState(4);
  const [customPlayerInput, setCustomPlayerInput] = useState('');
  const [teamMode, setTeamMode] = useState(false);
  const [showCustomPlayer, setShowCustomPlayer] = useState(false);

  // Popup 2: Rounds or Duration
  const [showPopup2, setShowPopup2] = useState(false);
  const [rounds, setRounds] = useState(3);
  const [duration, setDuration] = useState(60);
  const [customDurationInput, setCustomDurationInput] = useState('');
  const [showCustomDuration, setShowCustomDuration] = useState(false);

  // Running state
  const [currentRound, setCurrentRound] = useState(1);
  const [selectionPhase, setSelectionPhase] = useState<'running' | 'completed'>('running');

  const methodConfig = selectionMethods.find(m => m.id === selectionMethod);
  const MethodIcon = methodConfig?.icon || Brain;
  const gameName = customGame.trim() || mainGame;

  const needsRounds = ['ai_quiz', 'fastest', 'guess', 'prediction', 'hybrid'].includes(selectionMethod);
  const needsDuration = selectionMethod === 'coin';
  const skipsPopup2 = ['random', 'pick'].includes(selectionMethod);

  const openPopup1 = (method: string) => {
    setSelectionMethod(method);
    setShowPopup1(true);
  };

  const handlePopup1Next = () => {
    const count = showCustomPlayer ? (parseInt(customPlayerInput) || 4) : playerCount;
    setPlayerCount(count);
    setShowPopup1(false);

    if (skipsPopup2) {
      onStartSelection({
        mainGame: gameName,
        playerCount: count,
        teamMode,
        selectionMethod,
      });
      setSelectionPhase('completed');
      setCurrentRound(1);
    } else {
      setShowPopup2(true);
    }
  };

  const handlePopup2Start = () => {
    setShowPopup2(false);
    const config: SelectionConfig = {
      mainGame: gameName,
      playerCount,
      teamMode,
      selectionMethod,
    };
    if (needsRounds) config.rounds = rounds;
    if (needsDuration) config.duration = showCustomDuration ? (parseInt(customDurationInput) || 60) : duration;
    onStartSelection(config);
    setCurrentRound(1);
    setSelectionPhase('running');
  };

  const handleNextRound = () => {
    const totalRounds = rounds || 3;
    if (currentRound < totalRounds) {
      setCurrentRound(r => r + 1);
      addToast({ message: `Round ${currentRound + 1} of ${totalRounds} starting...`, type: 'info' });
    } else {
      setSelectionPhase('completed');
      addToast({ message: 'Selection complete! Players are ready.', type: 'success' });
    }
  };

  return (
    <>
      <div className="bg-white/[0.03] rounded-2xl border border-arcade-purple/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-arcade-purple/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-arcade-purple/30 to-arcade-blue/20 border border-arcade-purple/30 flex items-center justify-center">
            <Swords className="w-4 h-4 text-arcade-purple" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Selection Arena</h3>
            <p className="text-[10px] text-text-muted">{selectionActive ? `${methodConfig?.label} running` : 'Select players for your main game'}</p>
          </div>
        </div>

        {selectionActive ? (
          <div className="p-4 space-y-3">
            {selectionPhase === 'running' ? (
              <>
                <div className="rounded-xl bg-gradient-to-br from-arcade-green/10 to-arcade-blue/5 border border-arcade-green/20 p-4 text-center">
                  <Trophy className="w-8 h-8 text-arcade-green mx-auto mb-2" />
                  <p className="text-sm font-bold text-text-primary">
                    {needsRounds ? `Round ${currentRound} of ${rounds}` : 'Selection Running'}
                  </p>
                  <p className="text-[10px] text-text-muted mt-1">{methodConfig?.label} · {gameName} · {selectedCount}/{playerCount} selected</p>
                  <div className="mt-2 text-[10px] text-text-muted">{Math.max(0, playerCount - selectedCount)} more needed</div>
                  {needsRounds && (
                    <div className="mt-3 w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentRound / (rounds || 3)) * 100}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-arcade-green to-arcade-blue"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {needsRounds && (
                    <button onClick={handleNextRound}
                      className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-gradient-to-r from-arcade-green to-arcade-blue text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-arcade-green/20 hover:opacity-90 transition-all"
                    ><Play className="w-4 h-4" /> {currentRound < (rounds || 3) ? 'Next Round' : 'Finish'}</button>
                  )}
                  <button onClick={() => addToast({ message: 'Showing selection on overlay...', type: 'info' })}
                    className="min-h-[44px] px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-arcade-blue text-[11px] font-bold hover:bg-white/[0.08] transition-all flex items-center gap-1.5"
                  ><Eye className="w-3.5 h-3.5" /> Show on Overlay</button>
                  <button onClick={() => { onResetSelection(); addToast({ message: 'Selection stopped', type: 'warning' }); }}
                    className="min-h-[44px] px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-bold hover:bg-red-500/20 transition-all flex items-center gap-1.5"
                  ><StopCircle className="w-3.5 h-3.5" /> Stop</button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-xl bg-arcade-green/10 border border-arcade-green/30 p-4 text-center">
                  <Check className="w-8 h-8 text-arcade-green mx-auto mb-2" />
                  <p className="text-sm font-bold text-text-primary">Selected Players {selectedCount}/{playerCount}</p>
                  {selectedCount < playerCount && (
                    <p className="text-[10px] text-text-muted mt-1">{Math.max(0, playerCount - selectedCount)} more needed</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => addToast({ message: `${mainGame} started with ${selectedCount} players!`, type: 'success' })}
                    className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-gradient-to-r from-arcade-green to-arcade-blue text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-arcade-green/20 hover:opacity-90 transition-all"
                  ><Trophy className="w-4 h-4" /> Start Main Game</button>
                  <button onClick={() => addToast({ message: 'Select a replacement from Player Lobby', type: 'info' })}
                    className="min-h-[44px] px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-arcade-yellow text-[11px] font-bold hover:bg-white/[0.08] transition-all flex items-center gap-1.5"
                  ><RefreshCw className="w-3.5 h-3.5" /> Replace</button>
                  <button onClick={() => addToast({ message: 'Pick a player manually', type: 'info' })}
                    className="min-h-[44px] px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-arcade-blue text-[11px] font-bold hover:bg-white/[0.08] transition-all flex items-center gap-1.5"
                  ><UserPlus className="w-3.5 h-3.5" /> Add Manual</button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <p className="text-[10px] text-text-muted text-center py-2">Choose method to start player selection.</p>

            {/* Main Game */}
            <div>
              <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Main Game</label>
              <select value={mainGame} onChange={e => { setMainGame(e.target.value); setShowCustomGameInput(e.target.value === 'Custom'); }}
                className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-arcade-purple/50 transition-all appearance-none"
              >
                {mainGames.map(g => <option key={g} value={g}>{g}</option>)}
                <option value="Custom">Custom...</option>
              </select>
              {showCustomGameInput && (
                <input type="text" value={customGame} onChange={e => setCustomGame(e.target.value)}
                  placeholder="Type any game name..."
                  className="w-full mt-2 bg-bg-secondary border border-arcade-purple/30 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-arcade-purple/50 transition-all"
                />
              )}
            </div>

            {/* Selection Method */}
            <div>
              <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">
                <Brain className="w-3 h-3 inline mr-1" />Selection Method
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {selectionMethods.map(m => {
                  const Icon = m.icon;
                  const selected = selectionMethod === m.id;
                  return (
                    <motion.button key={m.id} whileTap={{ scale: 0.97 }}
                      onClick={() => openPopup1(m.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all ${
                        selected
                          ? 'border-arcade-purple/60 bg-arcade-purple/10'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${selected ? 'text-arcade-purple' : 'text-neutral-400'}`} />
                      <span className={`text-[8px] font-bold ${selected ? 'text-arcade-purple' : 'text-text-primary'}`}>{m.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Start Selection */}
            <button onClick={() => { if (selectionMethod) openPopup1(selectionMethod); else addToast({ message: 'Select a method first', type: 'warning' }); }}
              className="w-full min-h-[52px] py-3 rounded-2xl bg-gradient-to-r from-arcade-green to-arcade-blue text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-arcade-green/20 hover:shadow-xl hover:shadow-arcade-green/30 hover:opacity-90 transition-all active:scale-[0.97] touch-manipulation"
            ><Play className="w-5 h-5" /> Start Selection</button>
          </div>
        )}
      </div>

      {/* Popup 1: Select Players */}
      <AnimatePresence>
        {showPopup1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPopup1(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-bg-primary border border-arcade-purple/20 rounded-2xl p-5 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Select Players</h3>
                  <p className="text-[10px] text-text-muted mt-0.5">How many players should be selected?</p>
                </div>
                <button onClick={() => setShowPopup1(false)}
                  aria-label="Close"
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-neutral-400 hover:text-text-primary hover:bg-white/[0.04] transition-all"
                ><X className="w-4 h-4" /></button>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {playerOptions.map(n => (
                  <button key={n} onClick={() => { setPlayerCount(n); setShowCustomPlayer(false); }}
                    className={`min-h-[44px] rounded-xl border text-sm font-bold transition-all ${
                      !showCustomPlayer && playerCount === n
                        ? 'bg-arcade-purple/20 border-arcade-purple/50 text-arcade-purple'
                        : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-text-primary hover:border-white/[0.15]'
                    }`}
                  >{n}</button>
                ))}
                <button onClick={() => setShowCustomPlayer(true)}
                  className={`min-h-[44px] rounded-xl border text-xs font-bold transition-all ${
                    showCustomPlayer
                      ? 'bg-arcade-purple/20 border-arcade-purple/50 text-arcade-purple col-span-1'
                      : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-text-primary'
                  }`}
                >Custom</button>
              </div>

              {showCustomPlayer && (
                <input type="number" min={1} max={100} value={customPlayerInput}
                  onChange={e => setCustomPlayerInput(e.target.value)}
                  placeholder="Number of players"
                  className="w-full mb-3 bg-bg-secondary border border-arcade-purple/30 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-arcade-purple/50 transition-all"
                />
              )}

              {/* Team mode */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3">
                <div className="flex items-center gap-2">
                  <UsersRound className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-xs text-text-muted">Team mode</span>
                </div>
                <button onClick={() => setTeamMode(p => !p)}
                  aria-label={teamMode ? 'Disable team mode' : 'Enable team mode'}
                  className={`relative w-10 h-5 rounded-full transition-all ${teamMode ? 'bg-arcade-purple' : 'bg-white/[0.1]'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 shadow transition-all ${teamMode ? 'left-[22px]' : 'left-[2px]'}`} />
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowPopup1(false)}
                  className="flex-1 min-h-[44px] rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs font-semibold text-neutral-400 hover:text-text-primary hover:border-white/[0.15] transition-all"
                >Cancel</button>
                <button onClick={handlePopup1Next}
                  className="flex-1 min-h-[44px] rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-blue text-white text-xs font-bold hover:opacity-90 transition-all"
                >Next</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup 2: Rounds / Duration */}
      <AnimatePresence>
        {showPopup2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPopup2(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-bg-primary border border-arcade-purple/20 rounded-2xl p-5 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    {needsDuration ? 'Selection Duration' : 'Rounds'}
                  </h3>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {needsDuration ? 'How long should selection run?' : 'How many rounds?'}
                  </p>
                </div>
                <button onClick={() => setShowPopup2(false)}
                  aria-label="Close"
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-neutral-400 hover:text-text-primary hover:bg-white/[0.04] transition-all"
                ><X className="w-4 h-4" /></button>
              </div>

              {needsDuration ? (
                <>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {durationOptions.map(d => (
                      <button key={d.value} onClick={() => { setDuration(d.value); setShowCustomDuration(d.value === 0); }}
                        className={`min-h-[44px] rounded-xl border text-xs font-bold transition-all ${
                          showCustomDuration && d.value === 0
                            ? 'bg-arcade-purple/20 border-arcade-purple/50 text-arcade-purple'
                            : !showCustomDuration && duration === d.value
                              ? 'bg-arcade-purple/20 border-arcade-purple/50 text-arcade-purple'
                              : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-text-primary'
                        }`}
                      >{d.label}</button>
                    ))}
                  </div>
                  {showCustomDuration && (
                    <div className="flex items-center gap-2 mb-3">
                      <input type="number" min={1} value={customDurationInput}
                        onChange={e => setCustomDurationInput(e.target.value)}
                        placeholder="Seconds"
                        className="flex-1 bg-bg-secondary border border-arcade-purple/30 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-arcade-purple/50 transition-all"
                      />
                      <span className="text-xs text-text-muted">sec</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button key={r} onClick={() => setRounds(r)}
                      className={`flex-1 min-h-[44px] rounded-xl border text-sm font-bold transition-all ${
                        rounds === r
                          ? 'bg-arcade-purple/20 border-arcade-purple/50 text-arcade-purple'
                          : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-text-primary'
                      }`}
                    >{r}</button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => { setShowPopup2(false); setShowPopup1(true); }}
                  className="flex-1 min-h-[44px] rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs font-semibold text-neutral-400 hover:text-text-primary hover:border-white/[0.15] transition-all"
                >Back</button>
                <button onClick={handlePopup2Start}
                  className="flex-1 min-h-[44px] rounded-xl bg-gradient-to-r from-arcade-green to-arcade-blue text-white text-xs font-bold hover:opacity-90 transition-all"
                >Start Selection</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

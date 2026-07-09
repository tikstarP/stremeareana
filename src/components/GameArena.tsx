import { useState, useCallback, useEffect } from 'react';
import { Timer, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../context/AppContext';
import { submitScore } from '../lib/api';

const quizQuestions = [
  { question: 'Capital of Japan?', options: ['Beijing', 'Seoul', 'Tokyo', 'Bangkok'], correct: 2 },
  { question: 'Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correct: 1 },
  { question: '15 x 15 = ?', options: ['215', '225', '235', '245'], correct: 1 },
  { question: 'Mona Lisa painter?', options: ['Van Gogh', 'Picasso', 'Da Vinci', 'Michelangelo'], correct: 2 },
];

const games = [
  { id: 'quiz', title: 'Pixel Quiz', desc: 'Trivia blast', emoji: '🎮', color: 'from-arcade-purple/30 to-arcade-purple/5', border: 'border-arcade-purple/30', glow: 'glow-pink' },
  { id: 'guess', title: 'Arcade Guess', desc: 'Number 1-100', emoji: '🎰', color: 'from-arcade-blue/30 to-arcade-blue/5', border: 'border-arcade-blue/30', glow: 'glow-blue' },
  { id: 'fastest', title: 'Button Mash', desc: 'Type to win', emoji: '🕹️', color: 'from-arcade-pink/30 to-arcade-pink/5', border: 'border-arcade-pink/30', glow: 'glow-pink' },
];

export default function GameArena({ roomId }: { roomId?: number }) {
  const { user } = useAuth();
  const { profile, refreshProfile, addToast } = useApp();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [guessInput, setGuessInput] = useState('');
  const [typeInput, setTypeInput] = useState('');
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [numberTarget, setNumberTarget] = useState(0);

  const startGame = (id: string) => {
    const time = id === 'fastest' ? 10 : 30;
    setActiveGame(id); setTimeLeft(time); setTotalTime(time);
    setQIndex(0); setSelected(null); setGuessInput(''); setTypeInput('');
    setResult(null); setScore(0);
    if (id === 'guess') setNumberTarget(Math.floor(Math.random() * 100) + 1);
  };

  const saveScore = useCallback(async (finalScore: number, gameType: string) => {
    if (!user) return;
    try {
      await submitScore({
        room_id: roomId || 1, user_id: user.id,
        username: profile?.username || user.email?.split('@')[0],
        game_type: gameType, score: finalScore,
      });
      refreshProfile();
    } catch (err) { console.error('Save score error:', err); }
  }, [user, roomId, profile, refreshProfile]);

  const endGame = useCallback((r: 'win' | 'lose') => {
    setResult(r);
    if (r === 'win') {
      const finalScore = score + 50;
      addToast({ message: `HIGH SCORE! +${finalScore} pts`, type: 'success' });
      saveScore(finalScore, activeGame || 'quiz');
    } else {
      addToast({ message: 'GAME OVER!', type: 'info' });
      if (score > 0) saveScore(score, activeGame || 'quiz');
    }
  }, [score, activeGame, saveScore, addToast]);

  useEffect(() => {
    if (!activeGame || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); endGame('lose'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeGame, timeLeft, endGame]);

  const handleQuizAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === quizQuestions[qIndex].correct;
    if (correct) { setScore(prev => prev + 100); addToast({ message: 'PERFECT! +100', type: 'success' }); }
    setTimeout(() => {
      if (qIndex < quizQuestions.length - 1) { setQIndex(prev => prev + 1); setSelected(null); setTimeLeft(30); }
      else endGame(score + (correct ? 100 : 0) >= 200 ? 'win' : 'lose');
    }, 1000);
  };

  const handleGuess = () => {
    const num = parseInt(guessInput);
    if (isNaN(num)) return;
    if (Math.abs(num - numberTarget) <= 5) { setScore(200); endGame('win'); } else endGame('lose');
  };

  const handleType = () => {
    if (typeInput.toLowerCase().trim() === 'streamarena') { setScore(150); endGame('win'); } else endGame('lose');
  };

  if (!activeGame) {
    return (
      <div className="bg-white/[0.03] rounded-2xl overflow-hidden border border-arcade-pink/10">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-arcade-pink/10">
          <span className="text-lg">🎮</span><h3 className="font-semibold text-text-primary text-sm">Arcade</h3>
        </div>
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 text-center">
              <div className="text-5xl mb-3">{result === 'win' ? '🏆' : '💀'}</div>
              <h4 className={`text-xl font-bold mb-1 ${result === 'win' ? 'text-arcade-green' : 'text-arcade-pink'}`}>{result === 'win' ? 'HIGH SCORE!' : 'GAME OVER'}</h4>
              <p className="text-text-primary text-xs mb-4">Score: {score} pts</p>
              <button onClick={() => setResult(null)} className="min-h-[44px] sm:min-h-auto px-5 py-2 rounded-xl bg-arcade-pink/20 text-arcade-pink text-xs font-bold hover:bg-arcade-pink/30">INSERT COIN 🎲</button>
            </motion.div>
          ) : (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 space-y-2">
              {games.map(game => (
                <motion.button key={game.id} whileTap={{ scale: 0.97 }} onClick={() => startGame(game.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r ${game.color} border ${game.border} text-left group`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl ${game.glow}`}>{game.emoji}</div>
                  <div className="flex-1"><h4 className="font-bold text-text-primary text-sm">{game.title}</h4><p className="text-[11px] text-neutral-400">{game.desc}</p></div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-primary" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const currentGame = games.find(g => g.id === activeGame);

  return (
    <div className="bg-white/[0.03] rounded-2xl overflow-hidden border border-arcade-pink/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-arcade-pink/10">
        <div className="flex items-center gap-2"><span className="text-lg">{currentGame?.emoji}</span><h3 className="font-semibold text-text-primary text-sm">{currentGame?.title}</h3></div>
        <div className="flex items-center gap-1.5"><Timer className="w-3.5 h-3.5 text-arcade-yellow" /><span className={`text-xs font-mono font-bold ${timeLeft <= 5 ? 'text-arcade-pink' : 'text-arcade-yellow'}`}>{timeLeft}s</span></div>
      </div>
      <div className="p-4">
        <div className="w-full h-1 bg-bg-secondary rounded-full mb-4 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-arcade-pink to-arcade-blue" animate={{ width: `${(timeLeft / totalTime) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
        {activeGame === 'quiz' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-text-muted">Q{qIndex + 1}/{quizQuestions.length}</span>
              <span className="text-[11px] text-arcade-purple font-bold">🎯 {score} pts</span>
            </div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">{quizQuestions[qIndex].question}</h4>
            <div className="grid grid-cols-1 gap-2">
              {quizQuestions[qIndex].options.map((opt, i) => (
                <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => handleQuizAnswer(i)} disabled={selected !== null}
                  className={`p-3 rounded-xl text-left text-xs font-semibold transition-all ${
                    selected === null ? 'bg-bg-secondary border border-arcade-pink/10 text-text-primary hover:border-arcade-pink/40'
                    : selected === i ? (i === quizQuestions[qIndex].correct ? 'bg-arcade-green/15 border border-arcade-green text-arcade-green' : 'bg-arcade-pink/15 border border-arcade-pink text-arcade-pink')
                    : i === quizQuestions[qIndex].correct ? 'bg-arcade-green/15 border border-arcade-green text-arcade-green' : 'bg-bg-secondary border border-arcade-pink/10 text-text-muted'
                  }`}
                >
                  <span className="inline-block w-5 text-text-muted">{String.fromCharCode(65 + i)}.</span>{opt}
                </motion.button>
              ))}
            </div>
          </div>
        )}
        {activeGame === 'guess' && (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-neutral-400 text-xs mb-4">Guess a number 1-100</p>
            <input type="number" value={guessInput} onChange={e => setGuessInput(e.target.value)} placeholder="?"
              className="w-full max-w-[180px] mx-auto block bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-3 text-center text-lg font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-blue/50 mb-3" />
            <button onClick={handleGuess} className="min-h-[44px] sm:min-h-auto px-6 py-2.5 rounded-xl bg-arcade-blue/20 text-arcade-blue text-xs font-bold hover:bg-arcade-blue/30">SHOOT 🎯</button>
          </div>
        )}
        {activeGame === 'fastest' && (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">⚡</div>
            <p className="text-neutral-400 text-xs mb-2">Mash the keys:</p>
            <p className="text-lg font-display font-bold text-arcade-pink mb-3 tracking-wider">STREAMARENA</p>
            <input type="text" value={typeInput} onChange={e => setTypeInput(e.target.value)} placeholder="Type here..."
              className="w-full max-w-[260px] mx-auto block bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-3 text-center text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-pink/50 mb-3" />
            <button onClick={handleType} className="min-h-[44px] sm:min-h-auto px-6 py-2.5 rounded-xl bg-arcade-pink/20 text-arcade-pink text-xs font-bold hover:bg-arcade-pink/30">SMASH ⚡</button>
          </div>
        )}
      </div>
    </div>
  );
}

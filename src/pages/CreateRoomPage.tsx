import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Radio, Copy, Check, Crosshair, Brain, Palette, Puzzle } from 'lucide-react';
import MoltenBackground from '../components/MoltenBackground';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../context/AppContext';
import { createRoom } from '../lib/api';

const templates = [
  { label: 'BGMI Battle', icon: Crosshair, name: 'BGMI Battle Royale', desc: 'Classic BGMI tournament — queue up, drop in, and fight for the winner spot.' },
  { label: 'Quiz Show', icon: Brain, name: 'Quiz Show Live', desc: 'Test your knowledge with live trivia. Fastest answer wins coins!' },
  { label: 'Art Jam', icon: Palette, name: 'Art Jam Session', desc: 'Submit your sketches live. Streamer rates and picks the best.' },
  { label: 'Custom', icon: Puzzle, name: 'Custom Room', desc: 'Start from scratch — set your own rules and games.' },
];

export default function CreateRoomPage() {
  const { user, session } = useAuth();
  const { addToast } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { addToast({ message: 'Enter a room name', type: 'error' }); return; }
    if (!user) { addToast({ message: 'Sign in to create a room', type: 'warning' }); navigate('/login'); return; }
    setLoading(true);
    try {
      const room = await createRoom(name, description);
      setCreatedRoom(room);
      addToast({ message: 'Room created!', type: 'success' });
    } catch (err: unknown) {
      addToast({ message: err instanceof Error ? err.message : 'Failed to create', type: 'error' });
    }
    finally { setLoading(false); }
  };

  const copyCode = () => {
    if (createdRoom) {
      navigator.clipboard?.writeText(createdRoom.code ?? '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <Navbar />
      <Toast />
      <div className="relative z-10 min-h-screen flex items-center justify-center pt-16 px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/streamer" className="inline-flex items-center gap-2 text-neutral-400 hover:text-text-primary transition-colors mb-8 text-sm min-h-[44px] sm:min-h-auto">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          <div className="bg-white/[0.03] rounded-3xl p-8 border border-arcade-pink/10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-arcade-purple to-arcade-blue flex items-center justify-center mx-auto mb-4">
                <Radio className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold text-text-primary mb-2">Create Room</h1>
              <p className="text-neutral-400 text-sm">Start your own live interactive room</p>
            </div>

            {createdRoom ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                <div className="p-6 rounded-2xl bg-arcade-green/10 border border-arcade-green/30">
                  <p className="text-sm text-neutral-400 mb-2">Your room code:</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-display text-4xl font-black tracking-widest text-arcade-green break-all">{createdRoom.code}</span>
                    <button onClick={copyCode} className="p-2 rounded-lg bg-arcade-green/20 text-arcade-green hover:bg-arcade-green/30 transition-colors min-h-[44px] sm:min-h-auto min-w-[44px] sm:min-w-auto flex items-center justify-center">
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <button onClick={() => navigate(`/studio/${createdRoom.code}`)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-arcade-pink to-arcade-blue text-white font-semibold hover:opacity-90 transition-opacity min-h-[44px] sm:min-h-auto"
                >
                  Enter Room
                </button>
                <button onClick={() => setCreatedRoom(null)} className="text-sm text-text-muted hover:text-text-primary transition-colors min-h-[44px] sm:min-h-auto">
                  Create another
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {/* Template picker */}
                <div>
                  <label className="text-[10px] text-text-muted block mb-2">Quick Start Template</label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((t, i) => {
                      const Icon = t.icon;
                      const active = selectedTemplate === i;
                      return (
                        <button key={i} onClick={() => {
                          setSelectedTemplate(i);
                          if (i < templates.length - 1) { setName(t.name); setDescription(t.desc); }
                          else { setName(''); setDescription(''); }
                        }}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all min-h-[44px] ${
                            active ? 'border-arcade-purple/60 bg-arcade-purple/10' : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${active ? 'text-arcade-purple' : 'text-neutral-400'}`} />
                          <span className={`text-[10px] font-semibold ${active ? 'text-arcade-purple' : 'text-text-primary'}`}>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Room name"
                  className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-pink/50 transition-all"
                />
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" rows={3}
                  className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-pink/50 transition-all resize-none"
                />
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleCreate} disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-arcade-purple to-arcade-blue text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px] sm:min-h-auto"
                >
                  {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  : <><Radio className="w-4 h-4" />Create Room</>}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Radio, Copy, Check } from 'lucide-react';
import MoltenBackground from '../components/MoltenBackground';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../context/AppContext';

export default function CreateRoomPage() {
  const { user, session } = useAuth();
  const { addToast } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { addToast({ message: 'Enter a room name', type: 'error' }); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ name, description }),
      });
      const room = await res.json();
      if (res.ok) {
        setCreatedRoom(room);
        addToast({ message: 'Room created!', type: 'success' });
      } else {
        addToast({ message: room.error || 'Failed to create', type: 'error' });
      }
    } catch { addToast({ message: 'Network error', type: 'error' }); }
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
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-neutral-400 hover:text-text-primary transition-colors mb-8 text-sm min-h-[44px] sm:min-h-auto">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>

          <div className="bg-white/[0.03] rounded-3xl p-8 border border-arcade-pink/10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-arcade-yellow to-arcade-orange flex items-center justify-center mx-auto mb-4 glow-yellow">
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
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Room name"
                  className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-pink/50 transition-all"
                />
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" rows={3}
                  className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-pink/50 transition-all resize-none"
                />
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleCreate} disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-arcade-yellow to-arcade-orange text-black font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px] sm:min-h-auto"
                >
                  {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full" />
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

import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Keyboard, QrCode, Users, Radio, Search } from 'lucide-react';
import MoltenBackground from '../components/MoltenBackground';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useApp } from '../context/AppContext';
import { RoomCardSkeleton } from '../components/Skeleton';

export default function JoinRoomPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrMode, setQrMode] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { addToast } = useApp();

  useEffect(() => {
    fetch('/api/rooms').then(r => r.json()).then(data => setRooms(data.filter((r: any) => r.is_live))).catch(() => { setRooms([]); }).finally(() => setRoomsLoading(false));
  }, []);

  const filteredRooms = useMemo(() => rooms.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.host_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.code.toLowerCase().includes(searchTerm.toLowerCase())
  ), [rooms, searchTerm]);

  const handleJoin = () => {
    if (!code.trim()) { addToast({ message: 'Enter a room code', type: 'error' }); inputRef.current?.focus(); return; }
    setLoading(true);
    setTimeout(() => navigate(`/room/${code.toUpperCase()}`), 800);
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <Navbar />
      <Toast />
      <div className="relative z-10 min-h-screen flex items-center justify-center pt-16 px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-text-primary transition-colors mb-8 text-sm min-h-[44px] sm:min-h-auto">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="bg-white/[0.03] rounded-3xl p-8 border border-arcade-pink/10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-arcade-pink to-arcade-blue flex items-center justify-center mx-auto mb-4 glow-pink">
                <span className="text-3xl">🚀</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-text-primary mb-2">Join a Room</h1>
              <p className="text-neutral-400 text-sm">Enter a room code or scan a QR</p>
            </div>
            <div className="flex gap-2 mb-6 p-1 rounded-xl bg-bg-secondary">
              <button onClick={() => setQrMode(false)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px] sm:min-h-auto ${!qrMode ? 'bg-arcade-pink/20 text-arcade-pink' : 'text-neutral-400 hover:text-text-primary'}`}>
                <Keyboard className="w-4 h-4" />Code
              </button>
              <button onClick={() => setQrMode(true)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px] sm:min-h-auto ${qrMode ? 'bg-arcade-blue/20 text-arcade-blue' : 'text-neutral-400 hover:text-text-primary'}`}>
                <QrCode className="w-4 h-4" />QR
              </button>
            </div>
            {!qrMode ? (
              <div className="space-y-4">
                <input ref={inputRef} type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  placeholder="ENTER ROOM CODE" maxLength={8}
                  className="w-full bg-bg-secondary border border-arcade-pink/10 rounded-xl px-4 py-4 text-center text-2xl font-display font-bold tracking-widest text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-pink/50 focus:ring-2 focus:ring-arcade-pink/20 transition-all uppercase" />
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleJoin} disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-arcade-pink to-arcade-blue text-white font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 glow-pink min-h-[44px] sm:min-h-auto"
                >
                  {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  : <>Join Room <span className="text-xl">🚀</span></>}
                </motion.button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-48 h-48 mx-auto rounded-2xl bg-white p-3 mb-4"><div className="w-full h-full bg-bg-primary rounded-lg flex items-center justify-center"><QrCode className="w-24 h-24 text-text-primary" /></div></div>
                <p className="text-neutral-400 text-sm">Point camera at QR code</p>
              </div>
            )}
          </div>
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3 px-1">
              <h3 className="text-sm font-semibold text-neutral-400">Live Rooms</h3>
              {!roomsLoading && rooms.length > 0 && (
                <span className="text-[10px] text-neutral-500 font-mono">{rooms.length} online</span>
              )}
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Filter rooms..."
                className="w-full bg-bg-secondary border border-white/[0.06] rounded-xl pl-9 pr-3 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-pink/40 transition-all" />
            </div>
            <div className="space-y-2">
              {roomsLoading ? (
                <>
                  {[1, 2, 3, 4].map(i => <RoomCardSkeleton key={i} />)}
                </>
              ) : filteredRooms.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-8">No rooms match your search</p>
              ) : filteredRooms.map((room, i) => (
                <motion.button key={room.code} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                  onClick={() => navigate(`/room/${room.code}`)}
                  aria-label={`Join room ${room.name}`}
                  className="w-full bg-white/[0.03] rounded-xl p-4 flex items-center gap-4 hover:border-arcade-pink/30 transition-all text-left group min-h-[44px] sm:min-h-auto"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-arcade-pink/20 to-arcade-blue/20 flex items-center justify-center shrink-0">
                    <Radio className="w-5 h-5 text-arcade-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary text-sm truncate">{room.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-arcade-pink/10 text-arcade-pink text-xs font-mono">{room.code}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {room.viewer_count}</span>
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-text-muted rotate-180 group-hover:text-arcade-blue transition-colors" />
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

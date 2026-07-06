import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Keyboard, QrCode, Users, Radio, Search, Camera, CameraOff, Loader2 } from 'lucide-react';
import { getLiveRooms } from '../lib/api';
import MoltenBackground from '../components/MoltenBackground';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useApp } from '../context/AppContext';
import { RoomCardSkeleton } from '../components/Skeleton';
import type { RoomData } from '../types';
import jsQR from 'jsqr';

export default function JoinRoomPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrMode, setQrMode] = useState(false);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number>(0);
  const navigate = useNavigate();
  const { addToast } = useApp();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const codeParam = params.get('code');
    const scanParam = params.get('scan');
    if (codeParam) {
      navigate(`/room/${codeParam.toUpperCase()}`, { replace: true });
      return;
    }
    if (scanParam === '1') {
      setQrMode(true);
      startCamera();
    }
  }, [location.search]);

  useEffect(() => {
    getLiveRooms().then(data => setRooms(data)).catch(() => { setRooms([]); }).finally(() => setRoomsLoading(false));
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const filteredRooms = useMemo(() => rooms.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.host_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.code.toLowerCase().includes(searchTerm.toLowerCase())
  ), [rooms, searchTerm]);

  const startCamera = async () => {
    setCameraError('');
    setScanning(true);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera not supported on this device/browser');
      setScanning(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        startScanning();
      } else {
        setCameraError('Camera element not ready');
        setScanning(false);
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (e.name === 'NotFoundError') {
        setCameraError('No camera found on this device');
      } else {
        setCameraError(e.message || 'Camera access denied');
      }
      setScanning(false);
    }
  };

  const stopCamera = () => {
    setScanning(false);
    if (scanIntervalRef.current) { cancelAnimationFrame(scanIntervalRef.current); scanIntervalRef.current = 0; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startScanning = () => {
    const tick = () => {
      if (!videoRef.current || !canvasRef.current || !scanning) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.readyState !== video.HAVE_ENOUGH_DATA) { scanIntervalRef.current = requestAnimationFrame(tick); return; }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { scanIntervalRef.current = requestAnimationFrame(tick); return; }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qr = jsQR(imageData.data, imageData.width, imageData.height);
      if (qr) {
        const url = qr.data;
        const match = url.match(/\/room\/([A-Z0-9]{6})/i);
        if (match) {
          setScanning(false);
          stopCamera();
          addToast({ message: 'QR scanned! Joining room...', type: 'success' });
          navigate(`/room/${match[1].toUpperCase()}`);
          return;
        }
      }
      scanIntervalRef.current = requestAnimationFrame(tick);
    };
    scanIntervalRef.current = requestAnimationFrame(tick);
  };

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
              <button onClick={() => { setQrMode(false); stopCamera(); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px] sm:min-h-auto ${!qrMode ? 'bg-arcade-pink/20 text-arcade-pink' : 'text-neutral-400 hover:text-text-primary'}`}>
                <Keyboard className="w-4 h-4" />Code
              </button>
              <button onClick={() => { setQrMode(true); startCamera(); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px] sm:min-h-auto ${qrMode ? 'bg-arcade-blue/20 text-arcade-blue' : 'text-neutral-400 hover:text-text-primary'}`}>
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
              <div className="text-center py-4">
                {cameraError ? (
                  <div className="space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <CameraOff className="w-10 h-10 text-neutral-500" />
                    </div>
                    <p className="text-xs text-red-400">{cameraError}</p>
                    <p className="text-xs text-neutral-500">Allow camera access or enter the code manually</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative w-56 h-56 mx-auto rounded-2xl overflow-hidden bg-black border-2 border-arcade-blue/30">
                      <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                      <canvas ref={canvasRef} className="hidden" />
                      {!cameraActive && scanning && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <Loader2 className="w-8 h-8 text-arcade-blue animate-spin" />
                        </div>
                      )}
                      {cameraActive && (
                        <div className="absolute inset-0 border-[3px] border-transparent border-t-arcade-blue animate-pulse pointer-events-none" style={{ boxShadow: 'inset 0 0 30px rgba(59,130,246,0.15)' }} />
                      )}
                    </div>
                    <p className="text-xs text-neutral-400">Point camera at the QR code from the streamer's room</p>
                    <button onClick={stopCamera}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-text-primary text-xs font-semibold"
                    >Cancel Scan</button>
                  </div>
                )}
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

import { useRef } from 'react';
import { Volume2, VolumeX, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLivePlayer } from '../contexts/LivePlayerContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function GlobalFloatingPlayer() {
  const { videoId, streamerName, isPlaying, isMuted, isPiP, roomCode, stopWatching, toggleMute } = useLivePlayer();
  const location = useLocation();
  const navigate = useNavigate();
  const pipRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const isOnLiveRoom = location.pathname.startsWith('/room/');
  if (!isPlaying || !videoId || isOnLiveRoom) return null;

  const handleDragStart = (e: React.PointerEvent) => {
    if (!pipRef.current) return;
    const rect = pipRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    pipRef.current.setPointerCapture(e.pointerId);
    pipRef.current.addEventListener('pointermove', handleDrag);
    pipRef.current.addEventListener('pointerup', handleDragEnd);
  };

  const handleDrag = (e: PointerEvent) => {
    if (!pipRef.current) return;
    pipRef.current.style.left = `${e.clientX - dragOffset.current.x}px`;
    pipRef.current.style.top = `${e.clientY - dragOffset.current.y}px`;
    pipRef.current.style.right = 'auto';
    pipRef.current.style.bottom = 'auto';
  };

  const handleDragEnd = (e: PointerEvent) => {
    if (!pipRef.current) return;
    pipRef.current.removeEventListener('pointermove', handleDrag);
    pipRef.current.removeEventListener('pointerup', handleDragEnd);
    pipRef.current.releasePointerCapture(e.pointerId);
  };

  const handleExpand = () => {
    if (roomCode) navigate(`/room/${roomCode}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={pipRef}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed z-[100] w-56 rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none', bottom: 'calc(1rem + env(safe-area-inset-bottom))', right: 'calc(1rem + env(safe-area-inset-right))' }}
        onPointerDown={handleDragStart}
        onClick={handleExpand}
      >
        <div className="relative aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&controls=0`}
            className="w-full h-full pointer-events-none"
            allow="autoplay"
          />
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-red-500/80 text-[9px] font-bold text-white flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
          </div>
          <div className="absolute bottom-1.5 left-1.5 right-1.5">
            <div className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
              <p className="text-[10px] text-white font-medium truncate">{streamerName}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-2 py-1.5 bg-black/90" onClick={e => e.stopPropagation()}>
          <button
            onClick={handleExpand}
            aria-label="Expand to full room"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md hover:bg-white/5 text-neutral-400 hover:text-white touch-manipulation"
            title="Expand"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md hover:bg-white/5 text-neutral-400 touch-manipulation"
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
            <button
              onClick={stopWatching}
              aria-label="Close player"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md hover:bg-white/5 text-red-400 hover:text-red-300 touch-manipulation"
              title="Close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

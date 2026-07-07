import { useState, useRef, useEffect } from 'react';
import { Play, Volume2, VolumeX, PictureInPicture2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function YouTubePlayer({ videoId = '' }: { videoId?: string }) {
  const [pip, setPip] = useState(false);
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pipRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (started && iframeRef.current) {
      iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&rel=0`;
    }
  }, [started, muted, videoId]);

  const handlePiPDragStart = (e: React.PointerEvent) => {
    if (!pipRef.current) return;
    const rect = pipRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    pipRef.current.setPointerCapture(e.pointerId);
    pipRef.current.addEventListener('pointermove', handlePiPDrag);
    pipRef.current.addEventListener('pointerup', handlePiPDragEnd);
  };

  const handlePiPDrag = (e: PointerEvent) => {
    if (!pipRef.current) return;
    pipRef.current.style.left = `${e.clientX - dragOffset.current.x}px`;
    pipRef.current.style.top = `${e.clientY - dragOffset.current.y}px`;
    pipRef.current.style.right = 'auto';
    pipRef.current.style.bottom = 'auto';
  };

  const handlePiPDragEnd = (e: PointerEvent) => {
    if (!pipRef.current) return;
    pipRef.current.removeEventListener('pointermove', handlePiPDrag);
    pipRef.current.removeEventListener('pointerup', handlePiPDragEnd);
    pipRef.current.releasePointerCapture(e.pointerId);
  };

  return (
    <>
      {/* Full player */}
      <AnimatePresence>
        {!pip && (
          <motion.div
            key="full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden bg-black border border-white/[0.06]"
          >
            <div className="relative aspect-video bg-black">
              {started ? (
                <iframe
                  ref={iframeRef}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <button
                    onClick={() => setStarted(true)}
                    className="group relative"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all group-hover:scale-110">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </button>
                </div>
              )}

              {/* LIVE badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[11px] font-bold text-white tracking-wider">LIVE</span>
              </div>

              {!started && (
                <div className="absolute bottom-3 left-3 right-3 text-center">
                  <p className="text-xs text-neutral-500">Waiting for stream to start...</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-3 py-2.5 bg-black/80 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-red-500 animate-pulse">LIVE</span>
                <span className="text-xs text-neutral-500">1,240 watching</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMuted(!muted)}
                  aria-label={muted ? 'Unmute video' : 'Mute video'}
                  className="min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors touch-manipulation"
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setPip(true)}
                  aria-label="Picture-in-Picture"
                  className="min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors touch-manipulation"
                  title="Picture-in-Picture"
                >
                  <PictureInPicture2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PiP floating player */}
      <AnimatePresence>
        {pip && (
          <motion.div
            ref={pipRef}
            key="pip"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed z-50 w-64 rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none', bottom: 'calc(5rem + env(safe-area-inset-bottom))', right: 'calc(1rem + env(safe-area-inset-right))' }}
            onPointerDown={handlePiPDragStart}
          >
            <div className="relative aspect-video bg-black">
              {started ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&rel=0&controls=0`}
                  className="w-full h-full pointer-events-none"
                  allow="autoplay"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-6 h-6 text-neutral-500" />
                </div>
              )}
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-red-500/80 text-[9px] font-bold text-white">LIVE</div>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 bg-black/90">
              <span className="text-[10px] text-neutral-400 truncate">Room Stream</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
                  aria-label={muted ? 'Unmute video' : 'Mute video'}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md hover:bg-white/5 text-neutral-400 touch-manipulation"
                >
                  {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setPip(false); }}
                  aria-label="Exit picture-in-picture"
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md hover:bg-white/5 text-neutral-400 touch-manipulation"
                >
                  <PictureInPicture2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useState, useCallback, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Eye, Coins, Users, Smartphone,
  Link, QrCode, Monitor, Power, X, Copy, ExternalLink, Check, Play
} from 'lucide-react';

interface StudioTopBarProps {
  roomName: string;
  roomCode: string;
  status: 'live' | 'offline' | 'paused' | 'ended';
  viewerCount: number;
  queueCount: number;
  priorityCount: number;
  fanDropPending: number;
  coinsSpent: number;
  coinsHeld: number;
  overlayUrl: string;
  onEndStream: () => void;
  addToast: (t: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

const statusConfig = {
  live: { label: 'LIVE', color: 'text-arcade-green', bg: 'bg-arcade-green/15', border: 'border-arcade-green/30', dot: 'bg-arcade-green' },
  offline: { label: 'OFFLINE', color: 'text-neutral-400', bg: 'bg-neutral-500/10', border: 'border-neutral-500/20', dot: 'bg-neutral-400' },
  paused: { label: 'PAUSED', color: 'text-arcade-yellow', bg: 'bg-arcade-yellow/15', border: 'border-arcade-yellow/30', dot: 'bg-arcade-yellow' },
  ended: { label: 'ENDED', color: 'text-arcade-pink', bg: 'bg-arcade-pink/15', border: 'border-arcade-pink/30', dot: 'bg-arcade-pink' },
};

export default function StudioTopBar({
  roomName, roomCode, status, viewerCount, queueCount, priorityCount,
  fanDropPending, coinsSpent, coinsHeld, overlayUrl, onEndStream, addToast,
}: StudioTopBarProps) {
  const [qrOpen, setQrOpen] = useState(false);
  const [endConfirmOpen, setEndConfirmOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedOverlay, setCopiedOverlay] = useState(false);
  const navigate = useNavigate();

  const cfg = statusConfig[status];
  const roomUrl = `${window.location.origin}/room/${roomCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard?.writeText(roomUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      addToast({ message: 'Viewer link copied!', type: 'success' });
    } catch {
      addToast({ message: 'Failed to copy link', type: 'error' });
    }
  };

  const copyOverlay = async () => {
    try {
      await navigator.clipboard?.writeText(overlayUrl);
      setCopiedOverlay(true);
      setTimeout(() => setCopiedOverlay(false), 2000);
      addToast({ message: 'Overlay URL copied!', type: 'success' });
    } catch {
      addToast({ message: 'Failed to copy overlay URL', type: 'error' });
    }
  };

  const openOverlayPreview = () => {
    window.open(overlayUrl, '_blank', 'noopener,noreferrer');
    addToast({ message: 'Opening overlay preview...', type: 'info' });
  };

  const broadcastShowQR = useCallback(() => {
    try {
      const ch = new BroadcastChannel(`streamarena-${roomCode}`);
      ch.postMessage({ type: 'show_qr', roomCode, roomUrl, roomName });
      ch.close();
      addToast({ message: 'QR & link sent to stream and chat!', type: 'success' });
    } catch { addToast({ message: 'Broadcast failed', type: 'error' }); }
  }, [roomCode, roomUrl, roomName, addToast]);

  const StatsBadge = ({ icon: Icon, value, label, color }: { icon: React.ComponentType<{ className?: string }>; value: number | string; label: string; color?: string }) => (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] group hover:border-white/[0.12] transition-all">
      <Icon className={`w-3.5 h-3.5 ${color || 'text-neutral-400'}`} />
      <span className="text-xs font-bold text-text-primary tabular-nums">{value}</span>
      <span className="text-[10px] text-text-muted hidden sm:inline">{label}</span>
    </div>
  );

  const ActionButton = ({ icon: Icon, label, onClick, destructive, copied: isCopied }: { icon: ComponentType<{ className?: string }>; label: string; onClick: () => void; destructive?: boolean; copied?: boolean }) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-label={isCopied ? `Copied ${label}` : label}
      className={`min-h-[44px] sm:min-h-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.97] touch-manipulation ${
        destructive
          ? 'bg-gradient-to-r from-red-600/20 to-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-600/30'
          : isCopied
            ? 'bg-arcade-green/15 border border-arcade-green/30 text-arcade-green'
            : 'bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-text-primary hover:border-white/[0.15]'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{isCopied ? 'Copied!' : label}</span>
    </motion.button>
  );

  return (
    <>
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-arcade-pink/10">
        <div className="flex items-center gap-3 px-4 py-2.5 max-w-[1600px] mx-auto overflow-x-auto no-scrollbar">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0 mr-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-arcade-pink to-arcade-blue flex items-center justify-center">
              <span className="text-xs font-black text-white">SA</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-text-primary leading-tight">StreamArena</p>
              <p className="text-[10px] text-text-muted leading-tight">Studio</p>
            </div>
          </div>

          <div className="w-px h-8 bg-white/[0.06] shrink-0" />

          {/* Room Name */}
          <div className="shrink-0">
            <p className="text-sm font-semibold text-text-primary whitespace-nowrap">{roomName}</p>
            <p className="text-[10px] text-text-muted font-mono">{roomCode}</p>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${cfg.bg} ${cfg.border} border shrink-0`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'live' ? 'animate-pulse' : ''}`} />
            <span className={`text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
          </div>

          <div className="w-px h-8 bg-white/[0.06] shrink-0" />

          {/* Viewers */}
          <div className="flex items-center gap-1.5 shrink-0">
            <StatsBadge icon={Eye} value={viewerCount} label="viewers" color="text-arcade-blue" />
          </div>

          <div className="w-px h-8 bg-white/[0.06] shrink-0" />

          {/* Coins */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-arcade-blue/10 border border-arcade-blue/20">
              <Coins className="w-3.5 h-3.5 text-arcade-blue" />
              <span className="text-xs font-bold text-arcade-blue tabular-nums">{coinsSpent}</span>
              <span className="text-[10px] text-arcade-blue/70 hidden sm:inline">spent</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-arcade-blue/10 border border-arcade-blue/20">
              <Coins className="w-3.5 h-3.5 text-arcade-blue" />
              <span className="text-xs font-bold text-arcade-blue tabular-nums">{coinsHeld}</span>
              <span className="text-[10px] text-arcade-blue/70 hidden sm:inline">held</span>
            </div>
          </div>

          <div className="flex-1 min-w-[8px]" />

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ActionButton icon={copiedLink ? Check : Link} label="Copy Viewer Link" onClick={copyLink} copied={copiedLink} />
            <ActionButton icon={Eye} label="View Room" onClick={() => navigate(`/room/${roomCode}`)} />
            <ActionButton icon={QrCode} label="QR Code" onClick={() => { setQrOpen(true); broadcastShowQR(); }} />
            <ActionButton icon={Smartphone} label="Show on Stream" onClick={broadcastShowQR} />
            <ActionButton icon={copiedOverlay ? Check : Monitor} label="Copy Overlay URL" onClick={copyOverlay} copied={copiedOverlay} />
            <ActionButton icon={ExternalLink} label="Test Overlay" onClick={openOverlayPreview} />
            <ActionButton icon={Power} label="End Stream" onClick={() => setEndConfirmOpen(true)} destructive />
          </div>
        </div>
      </div>

      {/* End Stream Confirmation Modal */}
      <AnimatePresence>
        {endConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setEndConfirmOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-bg-primary border border-arcade-pink/20 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary">End Stream?</h3>
                <button
                  onClick={() => setEndConfirmOpen(false)}
                  aria-label="Close confirmation"
                  className="min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto p-1.5 rounded-lg text-neutral-400 hover:text-text-primary hover:bg-white/[0.04] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                This will close queues, stop games, close Fan Drop, return all held coins, and end the stream.
              </p>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setEndConfirmOpen(false)}
                  className="min-h-[44px] sm:min-h-auto px-5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-text-primary hover:border-white/[0.15] transition-all active:scale-[0.97] touch-manipulation"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setEndConfirmOpen(false); onEndStream(); }}
                  className="min-h-[44px] sm:min-h-auto px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90 transition-opacity active:scale-[0.97] touch-manipulation"
                >
                  End Stream
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setQrOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-bg-primary border border-arcade-blue/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary">Share QR Code</h3>
                <button
                  onClick={() => setQrOpen(false)}
                  aria-label="Close QR code"
                  className="min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto p-1.5 rounded-lg text-neutral-400 hover:text-text-primary hover:bg-white/[0.04] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-center mb-3">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(roomUrl)}`}
                  alt="QR Code"
                  className="w-48 h-48 rounded-2xl bg-white p-2"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <p className="text-xs text-neutral-500">Scan with phone camera to join</p>
                <span className="text-[10px] font-mono text-arcade-blue bg-arcade-blue/10 px-2 py-0.5 rounded">@{roomCode}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={copyLink}
                  className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-arcade-blue/20 to-arcade-blue/5 border border-arcade-blue/30 text-arcade-blue text-xs font-bold hover:opacity-90 transition-all active:scale-[0.97] touch-manipulation"
                ><Copy className="w-4 h-4" /> Copy Link</button>
                <button onClick={async () => { if (navigator.share) { try { await navigator.share({ title: 'Join my stream!', text: `Join ${roomName} on StreamArena!`, url: roomUrl }); } catch { console.warn('Share cancelled'); } } else { navigator.clipboard?.writeText(roomUrl); addToast({ message: 'Link copied!', type: 'success' }); } }}
                  className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-arcade-purple/20 to-arcade-blue/20 border border-arcade-purple/30 text-arcade-purple text-xs font-bold hover:opacity-90 transition-all active:scale-[0.97] touch-manipulation"
                ><Users className="w-4 h-4" /> Share</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

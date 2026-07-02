import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, X, Flag } from 'lucide-react';

export default function FloatingAssistant({ role }: { role: 'streamer' | 'viewer' }) {
  const [open, setOpen] = useState(false);

  const action = role === 'viewer'
    ? { label: 'Join a Room', to: '/join', icon: ArrowRight, gradient: 'from-arcade-pink to-arcade-yellow' }
    : { label: 'Start Your Room', to: '/create-room', icon: Play, gradient: 'from-arcade-orange to-arcade-yellow' };

  return (
    <div className="fixed z-[999] flex flex-col items-end gap-3" style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))', right: 'calc(1.5rem + env(safe-area-inset-right))' }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Link
              to={action.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 min-h-[44px] sm:min-h-auto px-5 py-2.5 rounded-full bg-zinc-950/90 backdrop-blur-md border border-arcade-pink/20 text-white text-sm font-semibold shadow-xl shadow-black/40 hover:bg-zinc-900 transition-all hover:scale-105"
            >
              <span>{action.label}</span>
              <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${action.gradient} flex items-center justify-center`}>
                <action.icon className="w-3.5 h-3.5 text-white" />
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        drag
        dragMomentum={false}
        whileDrag={{ scale: 1.1 }}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close assistant menu' : 'Open assistant menu'}
        className="relative w-12 h-12 rounded-full bg-zinc-950/90 backdrop-blur-md border border-arcade-pink/30 shadow-xl shadow-black/40 flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-arcade-pink/20 to-arcade-yellow/20 animate-pulse" />
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {open ? (
            <X className="w-5 h-5 text-arcade-yellow relative z-10" />
          ) : (
            <Flag className="w-5 h-5 text-red-400 relative z-10 drop-shadow-[0_0_6px_rgba(255,80,80,0.6)]" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}

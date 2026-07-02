import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheckBig, CircleX, Info, TriangleAlert, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const icons = { success: CircleCheckBig, error: CircleX, info: Info, warning: TriangleAlert };
const colors = {
  success: 'border-arcade-green text-arcade-green',
  error: 'border-arcade-pink text-arcade-pink',
  info: 'border-arcade-blue text-arcade-blue',
  warning: 'border-arcade-yellow text-arcade-yellow',
};

export default function Toast() {
  const { toasts, removeToast } = useApp();
  return (
    <div className="fixed z-[100] flex flex-col gap-2 pointer-events-none" style={{ top: 'calc(1rem + env(safe-area-inset-top))', right: 'calc(1rem + env(safe-area-inset-right))' }}>
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = icons[toast.type] || Info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`pointer-events-auto glass-strong rounded-2xl px-4 py-3 border-l-4 ${colors[toast.type]} min-w-[280px] max-w-[400px] flex items-start gap-3`}
            >
              <Icon className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm text-text-primary flex-1 break-words">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} aria-label="Dismiss notification" className="min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto text-text-muted hover:text-text-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

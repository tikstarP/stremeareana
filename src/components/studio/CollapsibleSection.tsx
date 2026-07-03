import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon?: typeof Settings;
  iconColor?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  badge?: string;
}

export default function CollapsibleSection({
  title, icon: Icon = Settings, iconColor = 'text-arcade-pink',
  defaultOpen = false, children, badge,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white/[0.03] rounded-2xl border border-arcade-pink/10 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{title}</span>
          {badge && (
            <span className="px-1.5 py-0.5 rounded-full bg-arcade-pink/20 text-arcade-pink text-[9px] font-bold">{badge}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-neutral-500" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

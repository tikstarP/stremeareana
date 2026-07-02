import { motion } from 'framer-motion';

const tabs = [
  { id: 'stream', label: 'Stream', icon: '📺' },
  { id: 'games', label: 'Play', icon: '🎮' },
  { id: 'queue', label: 'Queue', icon: '⏳' },
  { id: 'rank', label: 'Rank', icon: '🏆' },
  { id: 'art', label: 'Art', icon: '🎨' },
];

export default function MobileNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (t: string) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-arcade-pink/10" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around px-1 py-1">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              className="relative flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-colors min-w-[52px]"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavBg3"
                  className="absolute inset-0 bg-arcade-pink/10 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className={`text-[9px] font-medium transition-colors ${isActive ? 'text-arcade-pink' : 'text-text-muted'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

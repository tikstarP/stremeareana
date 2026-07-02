import { motion } from 'framer-motion';

export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      className={`rounded-xl bg-white/[0.04] ${className}`}
      style={style}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export function LineSkeleton({ width = '100%' }: { width?: string }) {
  return <Skeleton className="h-3" style={{ width }} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function RoomCardSkeleton() {
  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-2.5 w-1/3" />
        </div>
        <Skeleton className="h-6 w-16 rounded-lg" />
      </div>
      <Skeleton className="h-2.5 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-14 rounded-lg" />
        <Skeleton className="h-5 w-14 rounded-lg" />
      </div>
    </div>
  );
}

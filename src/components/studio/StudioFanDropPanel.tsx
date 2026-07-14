import { Lock, Unlock, Check, X, Trash2, Eye, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

interface FanDropSubmission {
  id: number; username: string; avatar_url: string; type: string;
  preview: string; submitted_at: string; status: 'pending' | 'approved' | 'rejected';
}

interface StudioFanDropPanelProps {
  fanDropStatus: 'locked' | 'open' | 'closed';
  pendingSubmissions: FanDropSubmission[];
  roomCode?: string;
  onSetStatus: (s: 'locked' | 'open' | 'closed') => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
  onShowOnOverlay: (id: number) => void;
}

export default function StudioFanDropPanel({
  fanDropStatus, pendingSubmissions, roomCode, onSetStatus,
  onApprove, onReject, onDelete, onShowOnOverlay,
}: StudioFanDropPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {(['locked', 'open', 'closed'] as const).map(s => (
          <button key={s} onClick={() => onSetStatus(s)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
              fanDropStatus === s
                ? s === 'open' ? 'bg-arcade-green/15 border-arcade-green/40 text-arcade-green'
                  : s === 'locked' ? 'bg-arcade-blue/15 border-arcade-blue/40 text-arcade-blue'
                  : 'bg-arcade-pink/15 border-arcade-pink/40 text-arcade-pink'
                : 'bg-white/[0.03] border-white/[0.06] text-neutral-400 hover:text-text-primary'
            }`}
          >{s === 'open' ? <Unlock className="w-3 h-3 mx-auto" /> : <Lock className="w-3 h-3 mx-auto" />}<span className="block mt-0.5">{s}</span></button>
        ))}
      </div>
      {roomCode && (
        <a href={`/fan-gallery/${roomCode}`}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-gradient-to-r from-arcade-purple/20 to-arcade-pink/20 border border-arcade-purple/30 text-arcade-purple hover:opacity-90 text-[10px] font-bold transition-all"
        ><LayoutGrid className="w-3 h-3" /> Open Full Gallery</a>
      )}

      {pendingSubmissions.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-[10px] text-neutral-500">No submissions yet</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
          {pendingSubmissions.filter(s => s.status === 'pending').map(sub => (
            <motion.div key={sub.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-white/[0.03] rounded-lg p-2 border border-white/[0.06]"
            >
              <div className="w-6 h-6 rounded-full bg-arcade-purple/20 flex items-center justify-center text-[9px] font-bold text-arcade-purple shrink-0">
                {sub.username[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-medium text-text-primary truncate">{sub.username}</p>
                <p className="text-[8px] text-text-muted truncate">{sub.preview}</p>
              </div>
              <div className="flex gap-0.5 shrink-0">
                <button onClick={() => onApprove(sub.id)} className="p-1 rounded hover:bg-arcade-green/20 text-arcade-green focus-visible:ring-2 focus-visible:ring-arcade-green/50"><Check className="w-3 h-3" /></button>
                <button onClick={() => onReject(sub.id)} className="p-1 rounded hover:bg-red-500/20 text-red-400 focus-visible:ring-2 focus-visible:ring-red-500/50"><X className="w-3 h-3" /></button>
                <button onClick={() => onShowOnOverlay(sub.id)} className="p-1 rounded hover:bg-arcade-blue/20 text-arcade-blue focus-visible:ring-2 focus-visible:ring-arcade-blue/50"><Eye className="w-3 h-3" /></button>
                <button onClick={() => onDelete(sub.id)} className="p-1 rounded hover:bg-red-500/20 text-red-400 focus-visible:ring-2 focus-visible:ring-red-500/50"><Trash2 className="w-3 h-3" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

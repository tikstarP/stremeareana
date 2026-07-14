import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Trash2, Eye, Heart, Sparkles, Trophy, Medal, Award, Zap } from 'lucide-react';
import MoltenBackground from '../components/MoltenBackground';
import Toast from '../components/Toast';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { getRoomByCode, getArtSubmissions, updateArtSubmission, deleteArtSubmission, createOverlayEvent, likeSubmission, unlikeSubmission } from '../lib/api';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import type { ArtSubmission } from '../types';

const rankStyles = [
  { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400/40', label: '#1' },
  { icon: Medal, color: 'text-gray-300', bg: 'bg-gray-300/20', border: 'border-gray-300/40', label: '#2' },
  { icon: Award, color: 'text-amber-600', bg: 'bg-amber-600/20', border: 'border-amber-600/40', label: '#3' },
];

export default function FanGalleryPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<ArtSubmission[]>([]);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [likedSet, setLikedSet] = useState<Set<number>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!roomCode) return;
    getRoomByCode(roomCode).then(data => {
      if (data?.id) {
        setRoomId(data.id);
        getArtSubmissions(data.id).then(subs => {
          setSubmissions(subs);
          subs.forEach(s => setLikeCounts(p => ({ ...p, [s.id]: s.likes || 0 })));
        }).catch(() => {});
      }
    }).catch(() => addToast({ message: 'Room not found', type: 'error' }));
  }, [roomCode]);

  useRealtimeSubscription<ArtSubmission>('art_submissions', roomId ? { column: 'room_id', value: roomId } : undefined,
    (newArt) => {
      setSubmissions(prev => [newArt, ...prev]);
      setLikeCounts(p => ({ ...p, [newArt.id]: newArt.likes || 0 }));
    },
    (updatedArt) => setSubmissions(prev => prev.map(a => a.id === updatedArt.id ? updatedArt : a)),
    (deletedArt) => setSubmissions(prev => prev.filter(a => a.id !== deletedArt.id)),
  );

  const handleApprove = async (id: number) => {
    try { await updateArtSubmission(id, { status: 'approved' }); addToast({ message: 'Approved ✅', type: 'success' }); }
    catch { addToast({ message: 'Failed', type: 'error' }); }
  };

  const handleReject = async (id: number) => {
    try { await updateArtSubmission(id, { status: 'rejected' }); addToast({ message: 'Rejected ❌', type: 'error' }); }
    catch { addToast({ message: 'Failed', type: 'error' }); }
  };

  const handleDelete = async (id: number) => {
    try { await deleteArtSubmission(id); addToast({ message: 'Deleted', type: 'info' }); }
    catch { addToast({ message: 'Failed', type: 'error' }); }
  };

  const handleShowOnOverlay = async (id: number) => {
    try {
      await updateArtSubmission(id, { status: 'showing' });
      if (roomId) await createOverlayEvent({ room_id: roomId, event_type: 'fan_drop_show', event_data: { submission_id: id } });
      addToast({ message: 'Showing on overlay ✨', type: 'info' });
    } catch { addToast({ message: 'Failed', type: 'error' }); }
  };

  const toggleLike = async (id: number) => {
    if (!user) return;
    const already = likedSet.has(id);
    setLikedSet(p => { const n = new Set(p); already ? n.delete(id) : n.add(id); return n; });
    setLikeCounts(p => ({ ...p, [id]: (p[id] || 0) + (already ? -1 : 1) }));
    try { if (already) await unlikeSubmission(id, user.id); else await likeSubmission(id, user.id); }
    catch { /* revert */ }
  };

  const ranked = [...submissions].sort((a, b) => (likeCounts[b.id] || 0) - (likeCounts[a.id] || 0));

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <Toast />

      <div className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(`/studio/${roomCode}`)}
            className="min-h-[44px] flex items-center gap-1.5 text-xs text-neutral-400 hover:text-text-primary transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Studio
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-arcade-pink animate-pulse" />
            <span className="text-sm font-bold gradient-text">Fan Gallery</span>
            <span className="text-[10px] text-neutral-500 font-mono">@{roomCode}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-arcade-yellow" />
            <span className="text-xs font-bold text-arcade-yellow">{submissions.length}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-20 pb-8 px-4 max-w-6xl mx-auto">
        {ranked.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-[60vh] gap-3"
          >
            <Zap className="w-12 h-12 text-neutral-600" />
            <p className="text-sm text-neutral-500">No submissions yet</p>
            <p className="text-[10px] text-neutral-600">Waiting for viewers to drop their art...</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <AnimatePresence>
              {ranked.map((sub, idx) => {
                const isTop3 = idx < 3;
                const RankIcon = isTop3 ? rankStyles[idx].icon : null;
                return (
                  <motion.div key={sub.id} layout
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3) }}
                    className={`bg-white/[0.03] rounded-xl border ${isTop3 ? rankStyles[idx].border : 'border-white/[0.06]'} overflow-hidden hover:bg-white/[0.06] transition-all group`}
                  >
                    <div className="relative aspect-video bg-black/40 flex items-center justify-center p-3 overflow-hidden">
                      {isTop3 && (
                        <div className={`absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full ${rankStyles[idx].bg} ${rankStyles[idx].border} border backdrop-blur-md`}>
                          {RankIcon && <RankIcon className={`w-3 h-3 ${rankStyles[idx].color}`} />}
                          <span className={`text-[9px] font-black ${rankStyles[idx].color}`}>{rankStyles[idx].label}</span>
                        </div>
                      )}
                      {sub.image_url ? (
                        <img src={sub.image_url} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
                      ) : sub.message ? (
                        <p className="text-xs text-text-primary text-center italic line-clamp-3">"{sub.message}"</p>
                      ) : sub.emoji ? (
                        <span className="text-5xl">{sub.emoji}</span>
                      ) : (
                        <span className="text-[10px] text-neutral-500">No preview</span>
                      )}
                    </div>
                    <div className="p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-text-primary truncate">{sub.username}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${
                          sub.status === 'approved' ? 'bg-arcade-green/15 text-arcade-green' :
                          sub.status === 'rejected' ? 'bg-red-500/15 text-red-400' : 'bg-arcade-yellow/15 text-arcade-yellow'
                        }`}>{sub.status}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <button onClick={() => toggleLike(sub.id)}
                          className="flex items-center gap-1 min-h-[40px] min-w-[40px] px-1.5 rounded-lg hover:bg-white/[0.04] transition-all touch-manipulation"
                        >
                          <Heart className={`w-4 h-4 transition-all ${likedSet.has(sub.id) ? 'fill-red-400 text-red-400 scale-110' : 'text-neutral-500 group-hover:text-red-400'}`} />
                          <span className="text-[10px] font-semibold text-neutral-400">{likeCounts[sub.id] || 0}</span>
                        </button>
                        <div className="flex gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleApprove(sub.id)} className="p-1.5 rounded-lg hover:bg-arcade-green/20 text-arcade-green transition-all" title="Approve"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleReject(sub.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all" title="Reject"><X className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleShowOnOverlay(sub.id)} className="p-1.5 rounded-lg hover:bg-arcade-blue/20 text-arcade-blue transition-all" title="Show on Overlay"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

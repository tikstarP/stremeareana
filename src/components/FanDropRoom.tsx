import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { getArtSubmissions, createArtSubmission, uploadFile, likeSubmission, unlikeSubmission } from '../lib/api';
import type { ArtSubmission } from '../types';
import { Send, Plus, Heart, Image, FileText, Smile } from 'lucide-react';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function FanDropRoom({ roomId }: { roomId?: number }) {
  const { user } = useAuth();
  const { profile, addToast } = useApp();
  const [submissions, setSubmissions] = useState<ArtSubmission[]>([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [likedSet, setLikedSet] = useState<Set<number>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastTap = useRef(0);

  useEffect(() => {
    if (!roomId) return;
    getArtSubmissions(roomId).then(data => {
      setSubmissions(data);
      data.forEach(s => setLikeCounts(p => ({ ...p, [s.id]: s.likes || 0 })));
    }).catch(() => addToast({ message: 'Failed to load submissions', type: 'error' }));
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [submissions.length]);

  useRealtimeSubscription<ArtSubmission>('art_submissions', roomId ? { column: 'room_id', value: roomId } : undefined,
    (newArt) => {
      setSubmissions(prev => [...prev, newArt]);
      setLikeCounts(p => ({ ...p, [newArt.id]: newArt.likes || 0 }));
    },
    (updatedArt) => setSubmissions(prev => prev.map(a => a.id === updatedArt.id ? updatedArt : a)),
    (deletedArt) => setSubmissions(prev => prev.filter(a => a.id !== deletedArt.id)),
  );

  const handleSend = async () => {
    if (!user || !roomId) { addToast({ message: 'Sign in to submit', type: 'warning' }); return; }
    if (!text.trim() && !file) { addToast({ message: 'Type a message or attach a file', type: 'warning' }); return; }
    setUploading(true);
    try {
      let imageUrl: string | undefined;
      if (file) {
        const base64 = await fileToBase64(file);
        const fileName = `${roomId}/${Date.now()}_${file.name}`;
        imageUrl = await uploadFile(fileName, base64, file.type);
      }
      await createArtSubmission({
        room_id: roomId, user_id: user.id, username: profile?.username || user.email?.split('@')[0] || 'Anonymous',
        content_type: file ? (file.type.startsWith('video') ? 'video' : file.type === 'image/gif' ? 'gif' : 'image') : 'text',
        message: text.trim() || undefined,
        image_url: imageUrl,
      });
      setText('');
      setFile(null);
    } catch { addToast({ message: 'Failed to send', type: 'error' }); }
    finally { setUploading(false); }
  };

  const handleDoubleTap = (id: number) => {
    if (!user) return;
    const now = Date.now();
    if (now - lastTap.current < 400) toggleLike(id);
    lastTap.current = now;
  };

  const toggleLike = async (id: number) => {
    if (!user) return;
    const already = likedSet.has(id);
    setLikedSet(p => { const n = new Set(p); already ? n.delete(id) : n.add(id); return n; });
    setLikeCounts(p => ({ ...p, [id]: (p[id] || 0) + (already ? -1 : 1) }));
    try { if (already) await unlikeSubmission(id, user.id); else await likeSubmission(id, user.id); }
    catch {
      setLikedSet(p => { const n = new Set(p); already ? n.add(id) : n.delete(id); return n; });
      setLikeCounts(p => ({ ...p, [id]: (p[id] || 0) + (already ? 1 : -1) }));
      addToast({ message: 'Failed to update like', type: 'error' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-xs text-neutral-500 mb-1">No submissions yet</p>
            <p className="text-[9px] text-neutral-600">Be the first to send a message or image</p>
          </div>
        ) : (
          [...submissions].reverse().map(sub => (
            <div key={sub.id} onClick={() => handleDoubleTap(sub.id)}
              className={`flex ${sub.user_id === user?.id ? 'justify-end' : 'justify-start'} select-none`}
            >
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs relative ${
                sub.user_id === user?.id
                  ? 'bg-arcade-purple/20 rounded-br-md'
                  : 'bg-white/[0.05] rounded-bl-md'
              }`}>
                {sub.user_id !== user?.id && (
                  <p className="text-[9px] text-arcade-purple font-semibold mb-0.5">{sub.username}</p>
                )}
                {sub.image_url && (
                  <img src={sub.image_url} alt="" className="max-w-full rounded-lg mb-1 max-h-48 object-contain bg-black/20" />
                )}
                {sub.message && <p className="text-text-primary">{sub.message}</p>}
                {sub.emoji && <p className="text-2xl" role="img" aria-label="Emoji reaction">{sub.emoji}</p>}
                {!sub.image_url && !sub.message && !sub.emoji && sub.content_type === 'image' && (
                  <p className="text-neutral-500 italic text-[10px]"><Image className="w-3 h-3 inline mr-0.5" />Image</p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <button onClick={(e) => { e.stopPropagation(); toggleLike(sub.id); }}
                    className="flex items-center gap-0.5 min-h-[36px] min-w-[36px] px-1 touch-manipulation"
                  >
                    <Heart className={`w-3 h-3 ${likedSet.has(sub.id) ? 'fill-red-400 text-red-400' : 'text-neutral-500'}`} />
                    <span className="text-[9px] text-neutral-400">{likeCounts[sub.id] || 0}</span>
                  </button>
                  <span className="text-[8px] text-neutral-500">{sub.status === 'approved' ? '✅' : sub.status === 'rejected' ? '❌' : ''}</span>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-2 border-t border-white/[0.06] flex items-center gap-2 bg-bg-primary/90">
        <label aria-label="Attach file" className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.08] cursor-pointer border border-white/[0.06]">
          <Plus className="w-5 h-5 text-neutral-400" aria-hidden="true" />
          <input type="file" accept="image/*,video/*,.gif" className="hidden"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
        </label>
        {file && (
          <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg px-2 py-1 max-w-[100px]">
            {file.type.startsWith('image') ? <Image className="w-3 h-3 text-arcade-blue shrink-0" /> : <FileText className="w-3 h-3 text-arcade-yellow shrink-0" />}
            <span className="text-[9px] text-neutral-400 truncate">{file.name}</span>
          </div>
        )}
        <input type="text" value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !uploading && handleSend()}
          placeholder={file ? 'Add caption...' : 'Type a message...'}
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-purple/30"
        />
        <button onClick={handleSend} disabled={uploading || (!text.trim() && !file)} aria-label="Send submission"
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-arcade-purple/20 text-arcade-purple hover:bg-arcade-purple/30 disabled:opacity-30 transition-all"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

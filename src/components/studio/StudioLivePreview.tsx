import { useState } from 'react';
import { Volume2, VolumeX, ExternalLink, Monitor } from 'lucide-react';

interface StudioLivePreviewProps {
  videoId: string;
  isMuted: boolean;
  viewerCount: number;
  onToggleMute: () => void;
  onSetVideoId: (id: string) => void;
  addToast: (t: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

function extractVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
      if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2]?.split('?')[0] || null;
      if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2]?.split('?')[0] || null;
      if (url.pathname.startsWith('/live/')) return url.pathname.split('/')[2]?.split('?')[0] || null;
      if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('?')[0] || null;
      return url.searchParams.get('v');
    }
  } catch { console.warn('Failed to extract video ID'); }
  return null;
}

export default function StudioLivePreview({
  videoId,
  isMuted,
  viewerCount,
  onToggleMute,
  onSetVideoId,
  addToast,
}: StudioLivePreviewProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSetUrl = () => {
    const id = extractVideoId(inputValue);
    if (id) {
      onSetVideoId(id);
      setInputValue('');
      addToast({ message: 'YouTube video set successfully', type: 'success' });
    } else {
      addToast({ message: 'Invalid YouTube URL or ID', type: 'error' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSetUrl();
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.10] shadow-2xl"
      style={{ background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(16px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[11px] font-bold text-white tracking-wider">LIVE</span>
          <span className="text-[10px] text-neutral-400 ml-0.5">{viewerCount.toLocaleString()} watching</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onToggleMute}
            className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >{isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}</button>
          {videoId && (
            <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer"
              className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors" title="Open in YouTube"
            ><ExternalLink className="w-3.5 h-3.5" /></a>
          )}
        </div>
      </div>

      {/* Video or URL input */}
      {videoId ? (
        <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2">
          <Monitor className="w-4 h-4 text-neutral-500 shrink-0" />
          <input
            type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="YouTube URL or ID..."
            className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[10px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arcade-pink/30"
          />
          <button onClick={handleSetUrl}
            className="px-2.5 py-1.5 rounded-lg bg-arcade-pink/20 border border-arcade-pink/30 text-arcade-pink text-[10px] font-semibold hover:bg-arcade-pink/30 whitespace-nowrap"
          >Set</button>
        </div>
      )}
    </div>
  );
}

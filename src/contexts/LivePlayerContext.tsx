import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface LivePlayerState {
  videoId: string | null;
  streamerName: string;
  isPlaying: boolean;
  isMuted: boolean;
  isPiP: boolean;
  roomCode: string | null;
}

interface LivePlayerContextType extends LivePlayerState {
  startWatching: (roomCode: string, videoId: string, streamerName: string) => void;
  stopWatching: () => void;
  toggleMute: () => void;
  togglePiP: () => void;
  expandPlayer: () => void;
}

const LivePlayerContext = createContext<LivePlayerContextType | null>(null);

export function LivePlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LivePlayerState>({
    videoId: null,
    streamerName: '',
    isPlaying: false,
    isMuted: true,
    isPiP: false,
    roomCode: null,
  });

  const startWatching = useCallback((roomCode: string, videoId: string, streamerName: string) => {
    setState({
      videoId,
      streamerName,
      isPlaying: true,
      isMuted: true,
      isPiP: false,
      roomCode,
    });
  }, []);

  const stopWatching = useCallback(() => {
    setState({
      videoId: null,
      streamerName: '',
      isPlaying: false,
      isMuted: true,
      isPiP: false,
      roomCode: null,
    });
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const togglePiP = useCallback(() => {
    setState(prev => ({ ...prev, isPiP: !prev.isPiP }));
  }, []);

  const expandPlayer = useCallback(() => {
    setState(prev => ({ ...prev, isPiP: false }));
  }, []);

  return (
    <LivePlayerContext.Provider value={{ ...state, startWatching, stopWatching, toggleMute, togglePiP, expandPlayer }}>
      {children}
    </LivePlayerContext.Provider>
  );
}

export function useLivePlayer() {
  const ctx = useContext(LivePlayerContext);
  if (!ctx) throw new Error('useLivePlayer must be used within LivePlayerProvider');
  return ctx;
}

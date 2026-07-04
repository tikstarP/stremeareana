import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Profile } from '../types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  language: string;
  setLanguage: (l: string) => void;
  toasts: Toast[];
  addToast: (t: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [language, setLanguage] = useState('en');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const refreshProfile = useCallback(async () => {
    if (!user) { setProfile(null); return; }
    try {
      const res = await fetch(`/api/profiles?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) { console.error('Profile fetch error:', err); }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshProfile();
      // Ensure profile exists in DB
      fetch('/api/auth-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, email: user.email }),
      }).then(() => refreshProfile());
    } else {
      setProfile(null);
    }
  }, [user, refreshProfile]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      language, setLanguage, toasts, addToast, removeToast, profile, refreshProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

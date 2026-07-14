import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, upsertProfile } from '../lib/api';
import { t as translate } from '../lib/translations';
import type { Profile } from '../types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  language: string;
  setLanguage: (l: string) => void;
  t: (key: string) => string;
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
      const data = await getProfile(user.id);
      setProfile(data);
    } catch (err) { console.error('Profile fetch error:', err); }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshProfile();
      upsertProfile(user.id, user.email).then(() => refreshProfile()).catch(() => addToast({ message: 'Profile setup failed', type: 'error' }));
    } else {
      setProfile(null);
    }
  }, [user, refreshProfile]);

  const t = useCallback((key: string) => translate(key, language), [language]);

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
      language, setLanguage, t, toasts, addToast, removeToast, profile, refreshProfile,
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

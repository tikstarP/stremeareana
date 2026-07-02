import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import supabase from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, session: null, loading: true, signOut: async () => {} });

function getDemoUser(): User | null {
  try {
    const raw = localStorage.getItem('fdemo_user');
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch { return null; }
}

function setDemoUser() {
  const demo: User = {
    id: 'demo-user-001',
    email: 'demo@streamarena.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };
  localStorage.setItem('fdemo_user', JSON.stringify(demo));
  return demo;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getDemoUser);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) localStorage.removeItem('fdemo_user');
      })
      .catch(() => {
        const demo = getDemoUser();
        if (demo) setUser(demo);
      })
      .finally(() => setLoading(false));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription?.unsubscribe();
  }, []);

  const signOut = async () => {
    try { await supabase.auth.signOut(); } catch { console.warn('Sign out error'); }
    localStorage.removeItem('fdemo_user');
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const enableDemoLogin = () => { setDemoUser(); localStorage.setItem('fdemo_user', JSON.stringify(setDemoUser())); return getDemoUser(); };

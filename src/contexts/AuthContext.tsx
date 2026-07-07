import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import supabase from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  loginAsDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, session: null, loading: true, signOut: async () => {}, loginAsDemo: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getSavedDemoUser());
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
        const demo = getSavedDemoUser();
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

  const loginAsDemo = async () => {
    const email = 'demo@streamarena.com';
    const password = 'demo123456';

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data?.user) {
        localStorage.removeItem('fdemo_user');
        return;
      }
    } catch { /* fall through */ }

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (!error && data?.user) {
        localStorage.removeItem('fdemo_user');
        return;
      }
    } catch { /* fall through */ }

    const demo: User = {
      id: 'demo-user-001',
      email,
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('fdemo_user', JSON.stringify(demo));
    setUser(demo);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

function getSavedDemoUser(): User | null {
  try {
    const raw = localStorage.getItem('fdemo_user');
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch { return null; }
}

export const useAuth = () => useContext(AuthContext);

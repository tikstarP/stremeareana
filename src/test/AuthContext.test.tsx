import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

vi.mock('../lib/supabase', () => ({
  default: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null }, error: new Error('No user') })),
      signUp: vi.fn(() => Promise.resolve({ data: { user: null }, error: new Error('No user') })),
    },
  },
}));

function TestConsumer() {
  const { user, loading, signOut, loginAsDemo } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="user">{user?.id || 'null'}</div>
      <button data-testid="signout" onClick={signOut}>Sign Out</button>
      <button data-testid="demo" onClick={loginAsDemo}>Demo Login</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts with loading=true and user=null', async () => {
    renderWithProvider();
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });

  it('creates demo user when loginAsDemo is called', async () => {
    renderWithProvider();
    await act(async () => {
      screen.getByTestId('demo').click();
    });
    expect(screen.getByTestId('user')).toHaveTextContent('demo-user-001');
    const saved = localStorage.getItem('fdemo_user');
    expect(saved).not.toBeNull();
  });

  it('clears user on signOut', async () => {
    localStorage.setItem('fdemo_user', JSON.stringify({ id: 'demo-user-001', email: 'demo@test.com' }));
    renderWithProvider();
    await act(async () => {
      screen.getByTestId('signout').click();
    });
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(localStorage.getItem('fdemo_user')).toBeNull();
  });
});

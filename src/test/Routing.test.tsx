import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import EntryPage from '../pages/EntryPage';
import LoginPage from '../pages/LoginPage';
import JoinRoomPage from '../pages/JoinRoomPage';
import { AuthProvider } from '../contexts/AuthContext';
import { AppProvider } from '../contexts/AppContext';

function renderAt(path: string) {
  const pageMap: Record<string, React.ReactNode> = {
    '/entry': <EntryPage />,
    '/login': <LoginPage />,
    '/join': <JoinRoomPage />,
  };
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {Object.entries(pageMap).map(([p, el]) => (
              <Route key={p} path={p} element={el} />
            ))}
          </Routes>
        </AppProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Routing', () => {
  it('renders EntryPage at /entry', () => {
    renderAt('/entry');
    expect(screen.getAllByText(/finalSTREAm/i).length).toBeGreaterThan(0);
  });

  it('renders LoginPage at /login', () => {
    renderAt('/login');
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  it('renders JoinRoomPage at /join', () => {
    renderAt('/join');
    expect(screen.getByPlaceholderText(/enter room code/i)).toBeInTheDocument();
  });

  it('has sign in links on entry page', () => {
    renderAt('/entry');
    expect(screen.getAllByText('Sign In').length).toBeGreaterThanOrEqual(2);
  });
});

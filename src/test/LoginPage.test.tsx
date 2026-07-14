import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import LoginPage from '../pages/LoginPage';
import { AuthProvider } from '../contexts/AuthContext';
import { AppProvider } from '../contexts/AppContext';

function renderWithProviders() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AppProvider>
          <LoginPage />
        </AppProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  it('renders sign in form by default', () => {
    renderWithProviders();
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('has email input with accessible label', () => {
    renderWithProviders();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
  });

  it('has password input with accessible label', () => {
    renderWithProviders();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('has a demo login button', () => {
    renderWithProviders();
    expect(screen.getByText('Demo Login')).toBeInTheDocument();
  });
});

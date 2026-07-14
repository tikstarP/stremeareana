import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ErrorBoundary from '../components/ErrorBoundary';

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders error fallback on uncaught error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const ThrowsError: React.ComponentType = () => { throw new Error('Test error'); };
    render(
      <ErrorBoundary>
        <ThrowsError />
      </ErrorBoundary>
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    spy.mockRestore();
  });
});

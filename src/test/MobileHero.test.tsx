import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import MobileHero from '../mobile/MobileHero';

function renderHero(role: 'viewer' | 'streamer') {
  return render(
    <MemoryRouter>
      <MobileHero role={role} />
    </MemoryRouter>
  );
}

describe('MobileHero', () => {
  it('renders viewer CTA for viewer role', () => {
    renderHero('viewer');
    expect(screen.getByText(/Join a Room/)).toBeInTheDocument();
  });

  it('renders streamer CTA for streamer role', () => {
    renderHero('streamer');
    expect(screen.getByText(/Create Your Room/)).toBeInTheDocument();
  });

  it('shows live badge with stream count', () => {
    renderHero('viewer');
    expect(screen.getByText(/Live Now/)).toBeInTheDocument();
  });
});

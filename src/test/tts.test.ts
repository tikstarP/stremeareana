import { describe, it, expect, vi } from 'vitest';
import { initTTS, getTTSStatus, kokoroVoices } from '../lib/tts';

describe('tts module', () => {
  it('exports voice list with expected entries', () => {
    expect(kokoroVoices.length).toBeGreaterThanOrEqual(3);
    expect(kokoroVoices[0]).toHaveProperty('id');
    expect(kokoroVoices[0]).toHaveProperty('label');
    expect(kokoroVoices[0]).toHaveProperty('lang');
  });

  it('starts with idle status', () => {
    expect(getTTSStatus()).toBe('idle');
  });

  it('handles missing speechSynthesis gracefully', async () => {
    Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
    await expect(initTTS()).rejects.toThrow('Speech synthesis not supported');
  });
});

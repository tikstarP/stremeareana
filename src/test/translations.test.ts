import { describe, it, expect } from 'vitest';
import { t, supportedLangs } from '../lib/translations';

describe('translations', () => {
  it('returns English key as fallback for missing key', () => {
    const result = t('nonexistent.key', 'en');
    expect(result).toBe('nonexistent.key');
  });

  it('returns English translation for nav.home', () => {
    expect(t('nav.home', 'en')).toBe('Home');
  });

  it('returns translated value for supported language', () => {
    const hiHome = t('nav.home', 'hi');
    expect(hiHome).toBeTruthy();
    expect(hiHome).not.toBe('Home');
  });

  it('has all supported languages with labels and flags', () => {
    expect(supportedLangs.length).toBeGreaterThanOrEqual(1);
    supportedLangs.forEach(lang => {
      expect(lang.code).toBeTruthy();
      expect(lang.label).toBeTruthy();
      expect(lang.flag).toBeTruthy();
    });
  });

  it('falls back to English when language is unsupported', () => {
    const result = t('nav.home', 'zz' as any);
    expect(result).toBe('Home');
  });
});

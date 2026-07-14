let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export async function speakProxy(text: string, lang = 'en', _style = 'default'): Promise<void> {
  const safe = text.slice(0, 500);
  const url = `/api/tts`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: safe, lang }),
  });
  if (!res.ok) throw new Error('TTS proxy failed');

  const blob = await res.blob();
  const dataUrl = URL.createObjectURL(blob);
  const el = new Audio(dataUrl);
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') await ctx.resume();
  await el.play();
  await new Promise<void>(done => {
    el.onended = () => { URL.revokeObjectURL(dataUrl); done(); };
    el.onerror = () => { URL.revokeObjectURL(dataUrl); done(); };
  });
}

export function speakBrowser(text: string, lang = 'en'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) { reject(new Error('No speech synthesis')); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith(lang));
    const maleVoice = voices.find(v => /male|david|mark|james|richard/i.test(v.name));
    if (maleVoice) u.voice = maleVoice;
    u.onend = () => resolve();
    u.onerror = () => reject(new Error('Speech synthesis failed'));
    window.speechSynthesis.speak(u);
  });
}

export const ttsLanguages = [
  { code: 'en', label: 'English', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'hi', label: 'Hindi', flag: '\u{1F1EE}\u{1F1F3}' },
  { code: 'es', label: 'Spanish', flag: '\u{1F1EA}\u{1F1F8}' },
  { code: 'pt', label: 'Portuguese', flag: '\u{1F1E7}\u{1F1F7}' },
  { code: 'id', label: 'Indonesian', flag: '\u{1F1EE}\u{1F1E9}' },
];

export const voiceStyles = [
  { id: 'normal', label: 'Female (Standard)', icon: '\u{1F3A4}' },
  { id: 'soft', label: 'Female (Soft)', icon: '\u{1F3A4}' },
  { id: 'energetic', label: 'Female (Energetic)', icon: '\u{1F3A4}' },
  { id: 'male', label: 'Male (Browser)', icon: '\u{1F399}\u{FE0F}' },
];

export function getSpeechText(username: string, message: string): string {
  return `Super Chat, ${username}: ${message}`;
}

export async function speakSuperChat(
  username: string,
  message: string,
  lang: string,
  style: string,
  addToast?: (t: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void,
): Promise<void> {
  const text = getSpeechText(username, message);
  try {
    if (style === 'male') {
      await speakBrowser(text, lang);
    } else {
      await speakProxy(text, lang, style);
    }
  } catch {
    try { await speakBrowser(text, lang); }
    catch {}
  }
}

export type TTSStatus = 'idle' | 'loading' | 'ready' | 'error';

let _status: TTSStatus = 'idle';
let _listeners: Array<(s: TTSStatus) => void> = [];
let _loadedVoices: string[] = [];
let _voiceMap: Record<string, SpeechSynthesisVoice> = {};

function notify(s: TTSStatus) {
  _status = s;
  _listeners.forEach(fn => fn(s));
}

export function onTTSStatus(cb: (s: TTSStatus) => void) {
  _listeners.push(cb);
  cb(_status);
  return () => { _listeners = _listeners.filter(fn => fn !== cb); };
}

export function getTTSStatus(): TTSStatus { return _status; }
export function getLoadedVoices(): string[] { return _loadedVoices; }

export async function initTTS(): Promise<void> {
  if (_status === 'ready' || _status === 'loading') return;
  notify('loading');
  if (!window.speechSynthesis) {
    notify('error');
    throw new Error('Speech synthesis not supported');
  }
  const check = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      _voiceMap = {};
      for (const v of voices) {
        const key = `${v.lang}_${v.name.replace(/\s+/g, '_').toLowerCase()}`;
        _voiceMap[key] = v;
        if (!_loadedVoices.includes(key)) _loadedVoices.push(key);
      }
      notify('ready');
    }
  };
  check();
  if (_loadedVoices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      check();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }
}

const queue: Array<() => Promise<void>> = [];
let playing = false;

async function tick(): Promise<void> {
  if (playing || queue.length === 0) return;
  playing = true;
  const task = queue.shift()!;
  try { await task(); } catch { /* silent */ }
  playing = false;
  tick();
}

export async function speak(text: string, voice: string = 'google_english'): Promise<void> {
  queue.push(async () => {
    await initTTS();
    const u = new SpeechSynthesisUtterance(text);
    const matched = _voiceMap[voice];
    if (matched) u.voice = matched;
    u.lang = matched ? matched.lang : 'en-US';
    u.rate = 1.1;
    u.pitch = 1;
    u.volume = 1;
    window.speechSynthesis.speak(u);
    await new Promise<void>(done => {
      u.onend = () => done();
      u.onerror = () => done();
    });
  });
  if (!playing) tick();
}

export const kokoroVoices: { id: string; label: string; lang: string }[] = [
  { id: 'google_english', label: 'English (Default)', lang: 'en' },
  { id: 'google_hindi', label: 'Hindi (Default)', lang: 'hi' },
  { id: 'google_spanish', label: 'Spanish (Default)', lang: 'es' },
  { id: 'en-US_Google_Us_English', label: 'English US (Female)', lang: 'en' },
  { id: 'hi-IN_Google_Hindi', label: 'Hindi (Female)', lang: 'hi' },
];

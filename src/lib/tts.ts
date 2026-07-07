import type { KokoroTTS } from 'kokoro-js';
import type { RawAudio } from '@huggingface/transformers';

let ttsInstance: KokoroTTS | null = null;
let loadingPromise: Promise<void> | null = null;

export type TTSStatus = 'idle' | 'loading' | 'ready' | 'error';

let _status: TTSStatus = 'idle';
let _listeners: Array<(s: TTSStatus) => void> = [];
let _loadedVoices: string[] = [];

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
  if (ttsInstance) return;
  if (loadingPromise) return loadingPromise;

  notify('loading');
  loadingPromise = (async () => {
    try {
      const { KokoroTTS } = await import('kokoro-js');
      ttsInstance = await KokoroTTS.from_pretrained(
        'onnx-community/Kokoro-82M-v1.0-ONNX',
        { dtype: 'q8', device: 'wasm' }
      );
      const v = ttsInstance.list_voices() as any;
      _loadedVoices = Object.keys(v);
      notify('ready');
    } catch (err) {
      console.error('TTS init failed:', err);
      notify('error');
      throw err;
    }
  })();

  return loadingPromise;
}

async function rawAudioToBlob(audio: RawAudio): Promise<Blob> {
  return audio.toBlob();
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

export async function speak(text: string, voice: string = 'af_heart'): Promise<void> {
  queue.push(async () => {
    await initTTS();
    if (!ttsInstance) throw new Error('TTS not initialized');
    const audio = await ttsInstance.generate(text, { voice: voice as any, speed: 1 });
    const blob = await rawAudioToBlob(audio);
    const url = URL.createObjectURL(blob);
    const el = new Audio(url);
    el.play();
    await new Promise<void>(done => {
      el.onended = () => { URL.revokeObjectURL(url); done(); };
      el.onerror = () => { URL.revokeObjectURL(url); done(); };
    });
  });
  if (!playing) tick();
}

export const kokoroVoices: { id: string; label: string; lang: string }[] = [
  { id: 'af_heart', label: 'English US (Female)', lang: 'en' },
  { id: 'am_michael', label: 'English US (Male)', lang: 'en' },
  { id: 'bf_emma', label: 'English UK (Female)', lang: 'en' },
  { id: 'bm_george', label: 'English UK (Male)', lang: 'en' },
  { id: 'hf_alpha', label: 'Hindi (Female)', lang: 'hi' },
  { id: 'hm_omega', label: 'Hindi (Male)', lang: 'hi' },
];

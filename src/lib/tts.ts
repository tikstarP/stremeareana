import { KokoroTTS } from 'kokoro-js';
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

async function initTTS(): Promise<void> {
  if (ttsInstance) return;
  if (loadingPromise) return loadingPromise;

  notify('loading');
  loadingPromise = (async () => {
    try {
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

let currentAudio: HTMLAudioElement | null = null;

export async function speak(text: string, voice: string = 'af_heart'): Promise<void> {
  try {
    await initTTS();
    if (!ttsInstance) throw new Error('TTS not initialized');

    const audio = await ttsInstance.generate(text, { voice: voice as any, speed: 1 });
    const blob = await rawAudioToBlob(audio);
    const url = URL.createObjectURL(blob);

    if (currentAudio) { currentAudio.pause(); currentAudio = null; }

    const el = new Audio(url);
    currentAudio = el;
    el.play();

    el.onended = () => { URL.revokeObjectURL(url); if (currentAudio === el) currentAudio = null; };
    el.onerror = () => { URL.revokeObjectURL(url); if (currentAudio === el) currentAudio = null; };
  } catch (err) {
    console.error('TTS speak failed:', err);
    throw err;
  }
}

export const kokoroVoices: { id: string; label: string; lang: string }[] = [
  { id: 'af_heart', label: 'English US (Female)', lang: 'en' },
  { id: 'am_michael', label: 'English US (Male)', lang: 'en' },
  { id: 'bf_emma', label: 'English UK (Female)', lang: 'en' },
  { id: 'bm_george', label: 'English UK (Male)', lang: 'en' },
  { id: 'ef_dora', label: 'Spanish (Female)', lang: 'es' },
  { id: 'em_alex', label: 'Spanish (Male)', lang: 'es' },
  { id: 'hf_alpha', label: 'Hindi (Female)', lang: 'hi' },
  { id: 'hm_omega', label: 'Hindi (Male)', lang: 'hi' },
  { id: 'ff_siwis', label: 'French (Female)', lang: 'fr' },
  { id: 'if_sara', label: 'Italian (Female)', lang: 'it' },
  { id: 'pf_dora', label: 'Portuguese (Female)', lang: 'pt' },
  { id: 'jf_alpha', label: 'Japanese (Female)', lang: 'ja' },
  { id: 'zf_xiaobei', label: 'Chinese (Female)', lang: 'zh' },
];

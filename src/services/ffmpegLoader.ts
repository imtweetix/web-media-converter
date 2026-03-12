import * as Sentry from '@sentry/react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export type FFmpegLoadState = 'idle' | 'loading' | 'ready' | 'error';

type StateChangeCallback = (state: FFmpegLoadState) => void;
type ProgressCallback = (progress: number) => void;

const CORE_VERSION = '0.12.10';
const CDN_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

let ffmpegInstance: FFmpeg | null = null;
let loadState: FFmpegLoadState = 'idle';
let permanentlyFailed = false;
let loadPromise: Promise<FFmpeg> | null = null;

const stateListeners = new Set<StateChangeCallback>();
const progressListeners = new Set<ProgressCallback>();

function setState(newState: FFmpegLoadState) {
  loadState = newState;
  stateListeners.forEach(cb => cb(newState));
}

function reportProgress(progress: number) {
  progressListeners.forEach(cb => cb(progress));
}

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  try {
    await navigator.serviceWorker.register('/sw-ffmpeg.js', {
      scope: '/',
    });
  } catch {
    // Service worker registration is optional — caching is a nice-to-have
  }
}

async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance && loadState === 'ready') {
    return ffmpegInstance;
  }

  if (permanentlyFailed) {
    throw new Error('FFmpeg WASM permanently failed to load');
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    setState('loading');
    reportProgress(0);

    try {
      // Register service worker for caching (fire and forget)
      registerServiceWorker();

      const ffmpeg = new FFmpeg();

      reportProgress(10);

      // Convert CDN URLs to blob URLs (avoids CORS issues with WASM)
      const coreURL = await toBlobURL(
        `${CDN_BASE}/ffmpeg-core.js`,
        'text/javascript'
      );
      reportProgress(40);

      const wasmURL = await toBlobURL(
        `${CDN_BASE}/ffmpeg-core.wasm`,
        'application/wasm'
      );
      reportProgress(80);

      await ffmpeg.load({
        coreURL,
        wasmURL,
      });

      reportProgress(100);

      ffmpegInstance = ffmpeg;
      setState('ready');
      return ffmpeg;
    } catch (error) {
      loadPromise = null;

      // Mark permanently failed for WebAssembly compile errors
      if (
        error instanceof Error &&
        (error.message.includes('WebAssembly') ||
          error.message.includes('CompileError') ||
          error.message.includes('wasm'))
      ) {
        permanentlyFailed = true;
      }

      Sentry.captureException(error, {
        tags: { category: 'ffmpeg' },
        extra: { permanentlyFailed },
      });

      setState('error');
      throw error;
    }
  })();

  return loadPromise;
}

export function getFFmpeg(): Promise<FFmpeg> {
  return loadFFmpeg();
}

export function getFFmpegLoadState(): FFmpegLoadState {
  return loadState;
}

export function isFFmpegPermanentlyFailed(): boolean {
  return permanentlyFailed;
}

export function onFFmpegStateChange(cb: StateChangeCallback): () => void {
  stateListeners.add(cb);
  return () => stateListeners.delete(cb);
}

export function onFFmpegLoadProgress(cb: ProgressCallback): () => void {
  progressListeners.add(cb);
  return () => progressListeners.delete(cb);
}

export function terminateFFmpeg(): void {
  if (ffmpegInstance) {
    ffmpegInstance.terminate();
    ffmpegInstance = null;
  }
  loadPromise = null;
  setState('idle');
}

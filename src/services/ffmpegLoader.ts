import * as Sentry from '@sentry/react';
import { FFmpeg } from '@ffmpeg/ffmpeg';

export type FFmpegLoadState = 'idle' | 'loading' | 'ready' | 'error';

type StateChangeCallback = (state: FFmpegLoadState) => void;
type ProgressCallback = (progress: number) => void;

const CORE_VERSION = '0.12.10';
const CDN_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

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

      // Use direct CDN URLs (Vite creates module workers which use
      // dynamic import() — blob URLs cause CSP connect-src issues)
      const coreURL = `${CDN_BASE}/ffmpeg-core.js`;
      reportProgress(20);

      const wasmURL = `${CDN_BASE}/ffmpeg-core.wasm`;
      reportProgress(60);

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
      console.error('FFmpeg load failed:', error);

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

/**
 * Preload FFmpeg WASM in the background so it's ready when the user
 * starts their first video conversion. Called on app startup.
 */
export function preloadFFmpeg(): void {
  // Don't preload if already loaded or permanently failed
  if (loadState === 'ready' || permanentlyFailed) return;

  loadFFmpeg().catch(() => {
    // Preload failure is non-fatal — conversion will retry on demand
  });
}

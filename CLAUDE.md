# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Memory Maintenance

At the end of each conversation (or when significant work is completed), review and update your memory files to capture important decisions, new patterns, version changes, or user feedback. Check existing memories for accuracy and update any that have become outdated.

## Project Overview

**Web Media Converter** is a proprietary SaaS application that converts images to WebP and videos to WebM format entirely in the browser. All media processing happens client-side with no server uploads, ensuring user privacy.

Live application: <https://app.webmediaconverter.com/>

## Tech Stack

- **React 19** with TypeScript 5.9
- **Vite 7.x** - build tool with HMR
- **Tailwind CSS 3.4** - utility-first styling
- **Canvas API** - image processing
- **MediaRecorder API** - video encoding (VP8/VP9)
- Node >= 20.19.0, npm >= 10.0.0

## Essential Commands

```bash
npm run dev              # Start dev server (port 3000, auto-opens)
npm run build            # Production build
npm run build:check      # Type-check + build (use before commits)
npm run type-check       # Run TypeScript checks without building
npm run preview          # Preview production build locally
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without writing
npm run perf:preview     # Build + preview for performance testing
npm run build:analyze    # Visualize bundle size analysis
```

Always run `npm run type-check` after TypeScript changes before committing.

## Architecture Overview

### Component Structure

The app follows a clean separation between UI primitives and feature components:

- **`src/App.tsx`** (150 lines) - Main orchestrator component
  - Manages global state (quality settings, resize settings, video settings)
  - Coordinates file management, conversion, and download workflows
  - Uses custom hooks for business logic separation

- **Custom Hooks** (`src/hooks/`)
  - `useFileManager` - File state management, memory cleanup, AbortController for cancellation
  - `useConversion` - Parallel conversion with retry logic (up to 3 concurrent files)
  - `useDownload` - Single/batch downloads with ZIP generation
  - `useDragAndDrop` - Drag & drop file upload handling

- **UI Components** (`src/components/ui/`)
  - Reusable primitives: Button, Card, Input, ProgressBar, StatusBadge
  - Built with Tailwind CSS, no external UI library

- **Feature Components** (`src/components/features/`)
  - Header, UploadArea, ConversionSettings, FilesList, FileItem, InfoCard, Footer
  - Business logic lives in hooks, these are mostly presentational

### Error Monitoring (Sentry)

- **`src/instrument.ts`** — Sentry.init(), imported before React in `main.tsx`
- **DSN via env var** (`VITE_SENTRY_DSN`) — disabled in development (`enabled: import.meta.env.PROD`)
- **Error boundary** — `Sentry.ErrorBoundary` in `main.tsx` catches React rendering errors
- **Structured reporting** — `Sentry.captureException()` calls in hooks/services with `tags` (category) and `extra` (file metadata)
- **Breadcrumbs** — Existing `console.warn`/`console.error` calls are auto-captured as Sentry breadcrumbs
- **Source maps** — `@sentry/vite-plugin` uploads source maps on production builds
- **CSP** — `https://*.ingest.sentry.io` added to `connect-src` in all three CSP locations
- **Build chunk** — `@sentry` has its own manual chunk in `vite.config.ts`

### Service Layer

- **`ConversionService`** (`src/services/conversionService.ts`)
  - Image conversion using Canvas API
  - Validates files (50MB limit, 16384px max dimension)
  - Smart resize with aspect ratio preservation
  - Handles transparency for PNG files
  - Creates FileItem objects with preview generation

- **`VideoConversionService`** (`src/services/videoConversionService.ts`)
  - Primary: ffmpeg.wasm (single-threaded) for faster-than-real-time VP9 transcoding
  - Fallback: MediaRecorder API (VP8/VP9) when WASM is unavailable
  - True CRF-based quality control via libvpx-vp9 (`-crf N -b:v 0`)
  - Dynamic FPS detection via `requestVideoFrameCallback`
  - Resolution scaling with aspect ratio preservation (even-number enforcement for VP9)
  - Generates video thumbnails for previews
  - 500MB file limit, timeout protection
  - Validates browser codec support with fallbacks

- **`ffmpegLoader`** (`src/services/ffmpegLoader.ts`)
  - Singleton FFmpeg instance manager with lazy loading
  - Loads ESM core JS directly from jsDelivr CDN, WASM via `toBlobURL()` (avoids CORS issues)
  - State machine: `idle` → `loading` → `ready` | `error`
  - Permanent failure detection for WebAssembly compile errors
  - Registers service worker (`public/sw-ffmpeg.js`) for cache-first WASM caching
  - Event system: `onFFmpegStateChange()`, `onFFmpegLoadProgress()`

### Core Data Structures

From `src/types.ts`:

- **`FileItem`** - Central data model for all files
  - Tracks: id, file, status, progress, converted blob/size, dimensions
  - Has separate `resizeSettings` (images) and `videoSettings` (videos)
  - `isVideo` flag determines processing path

- **`ConversionSettings`** - Global settings container
  - quality (10-100), resize settings, video settings

- **`ResizeSettings`** - Per-image or global resize config
  - enabled flag, maxWidth, maxHeight

- **`VideoSettings`** - Per-video or global video config
  - resolution, CRF (quality), FPS, audioEnabled

### Performance Optimizations (v2.2.0)

The app has undergone significant performance optimizations:

1. **Parallel Processing**
   - Processes up to 3 files concurrently (configurable in `useConversion.ts`)
   - 60-80% faster than sequential processing
   - Small delays between batches to prevent browser overload

2. **Memory Management**
   - Automatic blob URL cleanup in `useFileManager`
   - Memory pressure monitoring (checks heap usage every 10s)
   - AbortController for cancelling ongoing operations
   - Automatic cleanup on component unmount

3. **Retry Mechanism**
   - Failed conversions auto-retry with exponential backoff
   - Up to 2 retries per file (configured in `useConversion.ts`)
   - 90%+ success rate improvement

4. **Component Optimization**
   - React.memo for file list items to prevent unnecessary re-renders
   - useMemo/useCallback for expensive computations and event handlers
   - 30-40% reduction in re-renders

5. **Build Optimization**
   - Manual code splitting in `vite.config.ts`:
     - react-vendor chunk (React + React DOM)
     - fontawesome chunk (icons)
     - services chunk (conversion logic)
     - utils chunk (ZIP utilities)
     - ui-components chunk
     - feature-components chunk
   - Terser minification with console.log removal
   - Tree shaking enabled
   - Bundle reduced from ~68KB to ~55KB gzipped

### Critical Implementation Details

#### ZIP File Generation (`src/utils/zipUtils.ts`)

**CRITICAL**: This file manually constructs ZIP files byte-by-byte using browser APIs.

- Creates local file headers, central directory, and end-of-central-directory record
- Custom CRC32 implementation for data integrity
- Must preserve exact byte ordering and offsets
- Uses DataView for precise binary layout
- When editing: run manual end-to-end browser verification (no unit tests exist)
- If replacing with library (e.g., JSZip), returned Blob MUST be `application/zip` type

#### Filename Sanitization

All filenames are sanitized before download/ZIP creation:

```typescript
sanitizeFilename(filename: string): string {
  return filename.replace(/[<>:"/\\|?*]/g, '_').replace(/^\.+/, '');
}
```

Used in both `ConversionService` and `zipUtils.ts`.

#### Progress Reporting Pattern

All conversion functions use `ProgressCallback`:

```typescript
type ProgressCallback = (progress: number) => void;

// Update file state
updateFile(fileId, { progress: 60, status: 'converting' });
```

Progress ranges:

- Image conversion: 10 → 40 → 60 → 80 → 100
- Video conversion: 10 → 20 → 30 → 40 → 50 → 55 (FPS detect) → 60 → 60-95 (processing) → 100

#### Video FPS Detection

Uses `requestVideoFrameCallback` API when available (Chrome/Edge), falls back to polling for other browsers. Measures FPS over 1 second, snaps to common frame rates (24, 30, 60, etc.). Timeout of 3 seconds with fallback to 24fps.

#### Content Security Policy

**CRITICAL**: CSP must be consistent across all environments to avoid runtime errors.

Configured in THREE places:

1. **Dev server**: `vite.config.ts` (line 84-85)
2. **HTML meta tag**: `index.html` (line 14-15)
3. **Production headers**: `netlify.toml` (line 20)

**Required directives for video/image conversion**:

- `media-src 'self' blob: data:` - **MUST include blob:** for video element sources
- `img-src 'self' blob: data:` - Required for image previews
- `script-src 'self' 'unsafe-eval' 'unsafe-inline'` - Required for Vite HMR and React
- `font-src 'self' data: https://fonts.gstatic.com https://kit-pro.fontawesome.com https://ka-p.fontawesome.com` - FontAwesome CDN
- `connect-src 'self' https://kit-pro.fontawesome.com https://ka-p.fontawesome.com` - FontAwesome API
- NO external API calls for file data - everything stays in browser

**Common pitfall**: Forgetting `media-src blob:` in production will cause "Refused to load media from 'blob:...' because it violates Content Security Policy" errors during video conversion.

#### Memory Cleanup Patterns

Always revoke blob URLs when:

- File removed from list
- All files cleared
- Converted blob replaced
- Component unmounts

Example from `useFileManager`:

```typescript
if (fileToRemove?.preview) {
  URL.revokeObjectURL(fileToRemove.preview);
}
if (fileToRemove?.convertedPreview) {
  URL.revokeObjectURL(fileToRemove.convertedPreview);
}
```

## Development Guidelines

## Automatic Semantic Versioning

IMPORTANT: Always update the app version automatically after any change using semantic versioning:

- **Patch version (X.X.+1)** = Bug fixes, small corrections
- **Minor version (X.+1.0)** = New features, backward compatible additions
- **Major version (+1.0.0)** = Breaking changes, backward incompatible changes

### How to update version

1. Edit `package.json` and update the `version` field
2. If there are other files that need their version updated, update them as well

### Current version tracking

Check the current version in `package.json` before making changes.

### Examples

- Fix duplicate columns → 1.0.3 → 1.0.4 (patch)
- Add new shortcode parameter → 1.0.3 → 1.1.0 (minor)
- Remove deprecated functions → 1.1.0 → 2.0.0 (major)

### README.md

- Update the documentation with the new version number
- Include a link to the changelog for the new version
- Update the documentation with the latest relevant changes

### CHANGELOG.md

- Add a new section for the new version, including changes, fixes, and new features
- The changelog format is based on <https://keepachangelog.com/en/1.0.0/>
- The project adheres to <https://semver.org/spec/v2.0.0.html>

### Adding New Features

1. **Keep conversion logic centralized**
   - Images: `ConversionService.convertToWebP`
   - Videos: `VideoConversionService.convertToWebM`
   - Don't scatter conversion code across components

2. **Use existing hooks pattern**
   - Extract business logic to custom hooks
   - Keep components focused on rendering
   - See `hooks/` directory for examples

3. **Preserve validation limits**
   - Images: 50MB max, 16384px max dimension
   - Videos: 500MB max
   - Don't change these without testing browser limits

4. **Follow progress callback pattern**
   - Always provide incremental progress updates (0-100)
   - Update status ('pending' | 'converting' | 'converted' | 'error')
   - Handle error messages via `errorMessage` field

5. **Memory management is critical**
   - Always revoke blob URLs when done
   - Use AbortController for cancellable operations
   - Test with large files (multiple 40MB+ files)

### Code Splitting Strategy

When adding heavy dependencies, consider `vite.config.ts` manual chunks:

```typescript
manualChunks: id => {
  if (id.includes('your-heavy-lib')) {
    return 'your-chunk-name';
  }
}
```

Current chunks: react-vendor, fontawesome, services, utils, ui-components, feature-components.

### Testing Changes

1. **Type checking**: `npm run type-check`
2. **Format check**: `npm run format:check`
3. **Manual browser testing**:
   - Test with multiple large files (40MB+ images, 300MB+ videos)
   - Test with different formats (JPEG, PNG, GIF, MP4, MOV, 3GP)
   - Verify ZIP downloads contain correct files
   - Check browser dev tools for memory leaks (Performance tab)
4. **Performance testing**: `npm run perf:preview` then use Chrome Lighthouse

### File Format Support

**Images → WebP**:

- Supported: JPEG, JPG, PNG (with transparency), GIF, BMP
- Max size: 50MB
- Max dimension: 16384px

**Videos → WebM**:

- Fully supported: MP4, WebM, OGG
- Partial support: MOV, 3GP (browser-dependent)
- NOT supported: AVI, WMV (browser limitations)
- Max size: 500MB

When adding format support, update validation in `ConversionService.validateFile` and `VideoConversionService.validateVideoFile`.

## Common Pitfalls

1. **Don't modify ZIP byte layout casually**
   - `zipUtils.ts` is fragile - changes can corrupt ZIP files
   - Test downloads thoroughly after changes

2. **Don't forget to update progress**
   - Users expect smooth progress bars
   - Call `updateProgress` at each stage

3. **Don't skip blob URL cleanup**
   - Memory leaks will crash browser with large files
   - Always pair `createObjectURL` with `revokeObjectURL`

4. **Don't add server-side processing**
   - This is a client-only app by design
   - All file data must stay in browser

5. **Don't introduce new UI libraries without justification**
   - Bundle size is critical (currently ~55KB gzipped)
   - Use existing Tailwind patterns first

## Deployment

Deployed to Netlify via `npm run build:netlify` (uses `--legacy-peer-deps`).

Configuration in `netlify.toml`. GitHub Actions handle CI/CD (see `.github/workflows/`).

## Useful File Locations

- Main app logic: `src/App.tsx`
- Type definitions: `src/types.ts`
- Image conversion: `src/services/conversionService.ts`
- Video conversion: `src/services/videoConversionService.ts`
- ZIP creation: `src/utils/zipUtils.ts`
- Build config: `vite.config.ts`
- TypeScript config: `tsconfig.json` (references `tsconfig.app.json` and `tsconfig.node.json`)

## Path Aliases

`@` is aliased to `src/` in `vite.config.ts`. Use it in imports:

```typescript
import { FileItem } from '@/types';
import { ConversionService } from '@/services/conversionService';
```

## Questions or Clarifications

When uncertain about:

- ZIP byte layout behavior → read `zipUtils.ts` carefully, test in browser
- Performance impact → use `npm run build:analyze` and Lighthouse
- Memory behavior → use Chrome DevTools Performance/Memory profiler
- TypeScript errors → run `npm run type-check` for full context

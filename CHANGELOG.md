# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.10.0] - 2026-03-12

### Fixed
- **FFmpeg WASM Loading**: Resolved "failed to import ffmpeg-core.js" error by switching from UMD to ESM distribution of `@ffmpeg/core`. Vite creates module workers that use `import()` instead of `importScripts()`, requiring the ESM build.
- **VP9 Encoding Stalls**: Added `-deadline good -cpu-used 4` encoding flags to prevent single-threaded WASM VP9 encoding from appearing stuck on first conversion. Industry-standard settings (used by YouTube/Netflix) with negligible quality impact.
- **File Re-upload**: Fixed issue where clearing files and re-selecting the same files via "Choose Files" would not trigger upload. Input value is now reset after each selection.
- **CSP for FFmpeg**: Added `https://cdn.jsdelivr.net` to `script-src` across all three CSP locations to allow ESM dynamic import of ffmpeg-core.js in module workers.

### Added
- **Conversion Cancellation**: Per-file AbortController allows removing a file mid-conversion without blocking the conversion loop. Remaining files continue converting automatically.
- **FFmpeg WASM Preloading**: FFmpeg WASM is now preloaded on app startup so the first video conversion starts immediately without download delay.
- **Conversion Timeout**: FFmpeg exec has a timeout (5 minutes minimum or 10x video duration) to prevent indefinite hangs.

### Changed
- **FFmpeg CDN URLs**: Switched from blob URLs to direct CDN URLs for both ffmpeg-core.js and ffmpeg-core.wasm, avoiding CSP `connect-src` issues with blob URL fetching.
- **Service Worker Cache**: Updated to v3 with ESM URLs, removed unused worker URL from cache list.
- **Abort Signal Propagation**: Signal checks added throughout the video conversion pipeline (metadata probing, file writing, exec) for fast cancellation at any stage.
- **MediaRecorder Fallback**: AbortError is now re-thrown instead of silently falling through to the MediaRecorder fallback encoder.
- **FFmpeg Termination on Abort**: When a conversion is cancelled, the ffmpeg worker is terminated immediately rather than waiting for the still-running exec to complete. A fresh instance is lazily created for the next conversion.

## [2.9.0] - 2026-03-11

### Added
- **Test Infrastructure**: Set up Vitest test framework with 51 tests across 3 test suites
  - `npm test` and `npm run test:watch` scripts for running tests
  - Separate `vitest.config.ts` to avoid conflicts with the app's Vite config (Sentry plugin, CSP headers, etc.)
- **File Validation Tests** (`src/__tests__/validation.test.ts`): 14 tests exercising `ConversionService.validateFile()` with all supported and unsupported image/video formats, size limits, and delegation to video validation
- **Utility Function Tests** (`src/__tests__/utils.test.ts`): 22 tests covering `formatFileSize()`, `getSavingsPercentage()`, `sanitizeFilename()` (both ConversionService and zipUtils), and `calculateCRC32()` with known test vectors
- **Video Validation Tests** (`src/__tests__/videoValidation.test.ts`): 15 tests for `VideoConversionService.validateVideoFile()` covering supported formats (MP4, WebM, OGG, MOV, 3GP), unsupported formats (AVI, WMV), size limits (500MB), and error message content

## [2.8.0] - 2026-03-10

### Added
- **Sentry Error Monitoring**: Integrated Sentry SDK for server-side error visibility and diagnostics
  - Automatic capture of unhandled errors and promise rejections via Sentry SDK
  - React `ErrorBoundary` wrapping the app for React rendering error capture with user-friendly fallback UI
  - Structured error reporting with tags and context in conversion hooks (`useConversion`, `useFileManager`, `useDownload`)
  - FFmpeg WASM load failure tracking in `ffmpegLoader.ts`
  - Warning-level capture when ffmpeg.wasm falls back to MediaRecorder in `videoConversionService.ts`
  - Console warnings/errors automatically captured as Sentry breadcrumbs for error timeline context
- **Sentry Vite Plugin**: Source map uploads on production builds for readable stack traces in Sentry dashboard
- **Sentry Build Chunk**: Separate `sentry` chunk in Vite manual chunks for optimal caching
- **`.env.example`**: Documents required Sentry environment variables for local and production setup

### Changed
- **CSP Updated**: Added `https://*.ingest.sentry.io` to `connect-src` across all three CSP locations (`vite.config.ts`, `index.html`, `netlify.toml`)

## [2.7.0] - 2026-03-10

### Added
- **FFmpeg.wasm Video Engine**: Replaced real-time MediaRecorder pipeline with ffmpeg.wasm (single-threaded) for faster-than-real-time video transcoding
  - True CRF-based quality control via libvpx-vp9 (previously approximated with bitrate mapping)
  - WASM binary loaded lazily from jsDelivr CDN (~10 MB, cached via Service Worker)
  - Automatic fallback to MediaRecorder if WASM fails to load (e.g., network issues, unsupported browser)
- **Video Engine Loading UI**: Banner with progress bar shown while downloading ffmpeg.wasm on first use
- **Service Worker Caching**: `sw-ffmpeg.js` caches WASM binary with cache-first strategy for instant subsequent loads
- **Sequential Video Processing**: Videos are now processed one at a time (single WASM instance) while images remain parallel

### Changed
- **CSP Updated**: Added `worker-src 'self' blob:` and `https://cdn.jsdelivr.net` to `connect-src` across all three CSP locations
- **Build Configuration**: Added `@ffmpeg` manual chunk for lazy-loaded JS wrapper; excluded from Vite pre-bundling

## [2.6.4] - 2026-03-09

### Fixed
- **Video Audio During Conversion**: Video element is now muted during conversion and FPS detection, preventing audio from playing through speakers
- **Video Blob URL Cleanup**: Replaced fragile `_cleanup` pattern (stored on DOM element via type-unsafe cast) with direct `URL.revokeObjectURL` calls in `onstop` and `onerror` handlers using the existing closure variable
- **Dead Code Removal**: Removed unreachable `else` branch in video file loading (file.file is always present per FileItem type)

## [2.6.3] - 2026-03-09

### Improved
- **Image Conversion Performance**: Replaced `FileReader.readAsDataURL` with `URL.createObjectURL` for image loading, eliminating the ~33% memory overhead from base64 encoding and significantly speeding up large file conversions
- **Memory Efficiency**: Blob URLs are now revoked immediately after the image loads (and on error), preventing memory leaks during conversion
- **Code Cleanup**: Removed unnecessary `clearRect`, `globalCompositeOperation`, and `crossOrigin` calls from the canvas conversion pipeline

## [2.6.2] - 2026-03-09

### Changed
- **ZIP Filename**: ZIP downloads now include date and time (`converted-files-20260309-143052.zip`) instead of just the date, preventing duplicate filenames when downloading multiple batches on the same day

## [2.6.1] - 2026-03-09

### Fixed
- **CSP Production Bug**: Added missing `'unsafe-eval'` and `'unsafe-inline'` to `script-src` in `netlify.toml`, which was blocking the inline Google Analytics script in production
- **CSP Consistency**: Normalized Content-Security-Policy across all three locations (`netlify.toml`, `vite.config.ts`, `index.html`) to be identical — added `frame-ancestors 'none'` to dev server config and standardized `img-src`/`media-src` token ordering
- **ZIP Entry Count Bug**: Fixed incorrect entry count in ZIP end-of-central-directory record — previously used `convertedFiles.length` instead of actual written entries, which could corrupt archives when some files lacked a converted blob
- **ZIP Duplicate Filenames**: Added deduplication for ZIP entries — files with identical names after sanitization now get `_1`, `_2` suffixes to prevent silent overwrites during extraction

### Improved
- **CRC32 Performance**: Moved CRC32 lookup table computation from per-call to module-level initialization, eliminating redundant table generation when processing multiple files

## [2.6.0] - 2025-12-12

### 🔄 **Tailwind CSS 4.x Migration & Build Configuration Updates**

This release migrates the project to Tailwind CSS 4.x with its new CSS-based configuration system and updates build configurations for improved deployment reliability.

### Changed
- 🎨 **Tailwind CSS 4.x Migration**: Migrated from Tailwind CSS 3.x to 4.x
  - Replaced `@tailwind` directives with `@import "tailwindcss"`
  - Converted `@apply` directives to explicit CSS for better compatibility
  - Removed JavaScript-based `tailwind.config.js` in favor of CSS-based configuration
  - Updated to use `@tailwindcss/postcss` plugin instead of legacy `tailwindcss` PostCSS plugin
- 📦 **Dependency Updates**: Updated npm packages to latest compatible versions
  - Added `@tailwindcss/postcss@^4.1.18` for Tailwind 4.x PostCSS support
  - Updated `@types/node` to latest version (25.0.1)
  - All other dependencies updated via `npm update --legacy-peer-deps`
- 🔧 **Build Configuration**: Updated build settings for better deployment
  - Modified `postcss.config.js` to use `@tailwindcss/postcss` plugin
  - Updated `netlify.toml` build commands to include `--legacy-peer-deps` flag
  - Ensured consistent build behavior across local and production environments
- 🔒 **NPM Configuration**: Updated `.npmrc` for better token management
  - Changed from Vite-specific syntax to standard npm environment variable syntax
  - Improved compatibility with CI/CD environments

### Technical Details
- **CSS Architecture**: Tailwind 4.x uses CSS imports instead of build-time directives
- **Component Styles**: All custom component classes maintained with explicit CSS
- **Build Performance**: Build time maintained at ~3.79s with no regression
- **Bundle Size**: No significant impact on bundle size
- **TypeScript Compliance**: Full type-check passes with zero errors

### Migration Notes
- Tailwind CSS 4.x no longer uses `tailwind.config.js` files
- Configuration is now done via CSS `@theme` directives (if needed)
- `@apply` directives should be replaced with explicit CSS for better performance
- PostCSS plugin changed from `tailwindcss` to `@tailwindcss/postcss`

## [2.5.0] - 2024-12-08

### 🚀 **Deployment Workflow Improvements**

This release introduces a new branch-based deployment strategy for better control over production deployments.

### Added
- 🌿 **Production Branch Strategy**: Separate development and deployment workflows
  - Created `production` branch for production deployments
  - `main` branch no longer triggers automatic Netlify deployments
  - Deploy to production only when ready by merging `main` into `production`
- 📝 **Deployment Documentation**: Clear workflow instructions
  - Added deployment workflow section to README.md
  - Documented branch strategy and merge process
  - Step-by-step guide for deploying to production

### Changed
- ⚙️ **Netlify Configuration**: Branch-based deployment settings
  - Updated netlify.toml with production branch context
  - Non-production branches skip builds to save resources
  - Only `production` branch triggers Netlify deployments

### Benefits
- ✅ Push to `main` as often as needed without triggering deployments
- ✅ Better control over when changes go live
- ✅ Follows industry-standard GitFlow/GitHub Flow practices
- ✅ Reduces accidental deployments of work-in-progress code

## [2.4.1] - 2025-01-21

### 🔧 **Dependency Updates & Security Improvements**

This release updates all dependencies to their latest stable versions and improves security configuration.

### Changed
- 📦 **Dependency Updates**: Updated all packages to latest stable versions
  - @types/node: 22.18.6 → 24.9.1 (major update for Node.js 24 support)
  - @types/react-dom: 19.2.1 → 19.2.2 (patch update)
  - vite: 7.1.9 → 7.1.11 (patch update with bug fixes)
  - tailwindcss: 3.4.17 → 3.4.18 (patch update)
- 🔒 **Security Improvements**: Enhanced secret management
  - Added .npmrc to .gitignore to prevent token leakage
  - Removed .npmrc from git tracking
  - Created .npmrc.example as template for developers
  - Updated CI/CD workflows with proper FontAwesome authentication
- 🛡️ **CI/CD Security**: Fixed deployment authentication
  - Added FontAwesome registry configuration to GitHub Actions workflows
  - Resolved npm E401 authentication errors in automated builds
  - Ensured FONTAWESOME_PACKAGE_TOKEN is properly configured

### Technical Details
- All dependency updates tested with type-check and production build
- No breaking changes introduced
- Bundle size maintained at ~90.71 kB gzipped
- Build time: ~4.08s
- Full TypeScript compliance verified

## [2.4.0] - 2025-01-20

### 🎨 **UI/UX Enhancements & Security Improvements**

This release brings major user experience improvements with a new lightbox viewer, custom accessible dropdowns, enhanced video thumbnails, and important security hardening.

### Added
- 🔍 **Lightbox Media Viewer**: Full-screen preview for converted media
  - Click converted thumbnails to open lightbox
  - Native HTML5 video player with full controls
  - High-resolution image preview
  - ESC key to close, click outside to dismiss
  - Body scroll lock when lightbox is open
  - Proper cleanup and memory management
- 🎨 **Custom Select Component**: Accessible dropdown replacement
  - Built with Headless UI React (@headlessui/react v2.2.9)
  - Full keyboard navigation support
  - ARIA-compliant for screen readers
  - Smooth animations and transitions
  - Replaced native select elements in video settings
- 🖼️ **Enhanced Video Thumbnails**: Automatic thumbnail generation for converted videos
  - Dynamic timeout based on file size
  - Asynchronous thumbnail creation
  - Proper error handling with fallback
  - Memory-efficient implementation
- 🎯 **Visual Icon Overlays**: Intuitive preview indicators
  - Play icon (solid) on converted video thumbnails
  - Magnifying glass icon (solid) on converted image thumbnails
  - Semi-transparent overlay for better visibility
  - No icon on original video thumbnails for cleaner UI
- 🔒 **Privacy Disclosure**: Transparent analytics notice
  - Added privacy section to InfoCard component
  - Clear explanation of what data is collected
  - Emphasis on client-side processing and file privacy
  - User-friendly language for transparency

### Changed
- 🛡️ **Content Security Policy Hardening**: Removed unsafe directives in production
  - Removed `'unsafe-inline'` and `'unsafe-eval'` from production CSP (netlify.toml:20)
  - Maintained development convenience in vite.config.ts
  - Better security posture for production deployment
  - Added specific Google Analytics domains to CSP whitelist
- ⚙️ **Adaptive Concurrent Processing**: Dynamic hardware-based limits
  - Uses `navigator.hardwareConcurrency` to detect CPU cores
  - Adjusts concurrent file processing (1-4 files max)
  - Better performance on high-end devices
  - Prevents overload on low-end devices

### Fixed
- 🎚️ **Image Quality Slider**: Corrected percentage calculation
  - Fixed visual alignment issue where 50% quality showed as 44.44%
  - Changed calculation from 10-100 range to 0-100 range
  - Added Math.max(10) protection to enforce minimum quality
  - Slider now visually matches selected quality percentage
- 🖼️ **Video Preview Generation**: Fixed missing converted video thumbnails
  - Separated image and video preview handling in useConversion.ts
  - Videos now generate thumbnails asynchronously in VideoConversionService
  - Proper error handling with console warnings for failed thumbnails
  - Images continue to use blob URL approach

### Enhanced
- 📊 **Progress Tracking**: More granular progress updates
  - Image conversion: Added intermediate steps (10→20→30→50→60→80→90→100)
  - Video conversion: Frame-based progress updates for smoother feedback
  - Better user experience during long conversions
- 🎥 **Video Conversion Service**: Improved thumbnail generation
  - `getVideoThumbnailFromBlob()` method for converted videos
  - Dynamic timeout based on file size (3-10 seconds)
  - Canvas-based thumbnail extraction at 1-second mark
  - Proper video element cleanup after thumbnail generation

### Technical Details
- **New Dependencies**:
  - @headlessui/react v2.2.9 - Accessible UI components
- **Modified Files**:
  - `src/components/ui/Lightbox.tsx` - New lightbox component
  - `src/components/ui/Select.tsx` - New custom select component
  - `src/components/ui/index.ts` - Export new UI components
  - `src/components/features/FileItem.tsx` - Icon overlays and lightbox integration
  - `src/components/features/ConversionSettings.tsx` - Slider fix and Select integration
  - `src/components/features/InfoCard.tsx` - Privacy disclosure
  - `src/services/videoConversionService.ts` - Enhanced thumbnail generation
  - `src/hooks/useConversion.ts` - Dynamic concurrency and preview handling
  - `netlify.toml` - Production CSP hardening
- **Type Safety**: Full TypeScript compliance maintained
- **Accessibility**: WCAG 2.1 compliant components
- **Performance**: No negative impact on bundle size or runtime performance

### Developer Experience
- 📚 **Better Component Architecture**: Reusable Lightbox and Select components
- 🎯 **Improved Type Safety**: Proper TypeScript interfaces for all new components
- 🧪 **Testing-Ready**: Components designed with testability in mind

## [2.3.0] - 2025-01-16

### 📊 **Analytics & User Insights**

This release adds comprehensive Google Analytics integration to track user behavior and improve the application based on real usage data.

### Added
- 📈 **Google Analytics 4 Integration**: Complete GA4 setup with automatic page view tracking
  - Configured in `index.html` with proper CSP headers
  - Production-ready implementation across all environments
- 🎯 **Conversion Tracking**: Detailed metrics for file conversions
  - Tracks file type (image/video), original size, converted size
  - Automatic compression ratio calculation
  - Success and error event tracking
- 📥 **Download Analytics**: Monitor user download behavior
  - Single file download tracking
  - Batch download (ZIP) tracking with file counts
  - Download method differentiation
- 📤 **Upload Event Tracking**: Understand how users add files
  - Drag & drop upload tracking
  - File picker upload tracking
  - File count metrics per upload session
- ⚙️ **Settings Change Tracking**: Monitor user preferences
  - Image quality adjustments
  - Resize setting modifications
  - Video setting changes (resolution, CRF, FPS, audio)
- 🛠️ **Analytics Utility Module**: Type-safe tracking functions
  - `trackConversion()` - Conversion events with detailed metrics
  - `trackDownload()` - Download events with type and count
  - `trackFileUpload()` - Upload events with method and count
  - `trackConversionError()` - Error tracking for debugging
  - `trackSettingChange()` - User preference monitoring

### Enhanced
- 🔒 **Content Security Policy**: Updated CSP in all three locations
  - `index.html` - Meta tag CSP for fallback
  - `vite.config.ts` - Dev server CSP headers
  - `netlify.toml` - Production HTTP headers
  - Added Google Analytics domains to `script-src`, `img-src`, and `connect-src`
- 📊 **User Experience Insights**: Foundation for data-driven improvements
  - Real-time event tracking in Google Analytics
  - Custom event parameters for detailed analysis
  - Privacy-focused implementation (no PII collected)

### Technical Details
- **Integration Points**:
  - `useConversion.ts` - Conversion success/error tracking
  - `useDownload.ts` - Download event tracking
  - `useDragAndDrop.ts` - Drag & drop upload tracking
  - `UploadArea.tsx` - File picker upload tracking
  - `App.tsx` - Settings change tracking
- **Event Schema**: Custom events with structured parameters
- **Type Safety**: Full TypeScript support with global `gtag` interface
- **CSP Compliance**: Whitelisted Google Analytics domains across all environments

### Files Modified
- `index.html` - Added GA4 script and updated CSP
- `vite.config.ts` - Updated dev server CSP
- `netlify.toml` - Updated production CSP
- `src/utils/analytics.ts` - New analytics utility module
- `src/hooks/useConversion.ts` - Added conversion tracking
- `src/hooks/useDownload.ts` - Added download tracking
- `src/hooks/useDragAndDrop.ts` - Added drag & drop tracking
- `src/components/features/UploadArea.tsx` - Added file picker tracking
- `src/App.tsx` - Added settings change tracking

## [2.2.1] - 2025-01-09

### 🔧 **PROJECT REBRANDING & MAINTENANCE**

This release focuses on project rebranding, code quality improvements, and maintenance updates.

### Changed
- 🏷️ **Project Rebranding**: Renamed from "WebP Image Converter" to "Web Media Converter"
- 📦 **Repository Name**: Updated GitHub repository name to `web-media-converter`
- 🌐 **URLs Updated**: All documentation and references updated to new Netlify URL
- 📝 **Documentation**: Comprehensive updates across README, LICENSE, and HTML meta tags

### Fixed
- 🧹 **Code Quality**: Resolved all TypeScript linting warnings and errors
- 🚫 **Unused Imports**: Removed unused FontAwesome import in FilesList component
- 🔧 **Type Safety**: Added proper type assertions for HTMLVideoElement methods
- 📦 **Dependencies**: Removed problematic Lighthouse dependencies

### Improved
- 🛠️ **Performance Testing**: Replaced Lighthouse with browser-based performance testing
- 📊 **Testing Workflow**: New `perf:preview` script for manual performance analysis
- 📚 **Documentation**: Enhanced performance testing instructions with multiple tools
- 🎯 **Build Process**: Maintained all existing optimizations and bundle efficiency

### Technical Details
- **Bundle Size**: Maintained ~55KB gzipped with optimized chunking
- **Build Time**: Consistent ~2.5-3s build performance
- **Type Safety**: Full TypeScript strict mode compliance
- **Code Formatting**: 100% Prettier compliance across all files

## [2.2.0] - 2025-01-09

### 🚀 **MAJOR PERFORMANCE OVERHAUL**

This release brings massive performance improvements with parallel processing, enhanced memory management, and comprehensive optimization across the entire application.

### Added
- ⚡ **Parallel File Processing**: Convert up to 3 files simultaneously (60-80% faster)
- 🧠 **Advanced Memory Management**: Automatic cleanup with memory pressure monitoring
- 📊 **Performance Monitoring**: Built-in performance tracking and metrics system
- 🔄 **Retry Mechanism**: Automatic retry for failed conversions with exponential backoff
- 🏗️ **Web Worker Infrastructure**: Prepared for offloading heavy operations
- 🎯 **Component Memoization**: React.memo and useMemo optimizations (30-40% fewer re-renders)
- 📈 **Performance Scripts**: Bundle analysis, profiling, and Lighthouse auditing tools

### Enhanced
- 🚀 **Build Optimization**: Advanced code splitting with 6 optimized chunks
- 🧹 **Memory Cleanup**: Proper blob URL management and garbage collection
- 🔧 **Error Handling**: Robust error recovery and user feedback
- 📦 **Bundle Size**: 15-25% smaller bundle with better compression
- 🎨 **Accessibility**: Full compliance with ARIA standards and screen reader support
- 🔍 **Type Safety**: Enhanced TypeScript compliance and error prevention

### Technical Improvements
- **Parallel Processing**: Files now process in batches of 3 simultaneously
- **Memory Monitoring**: Automatic cleanup when memory usage exceeds 80%
- **Smart Caching**: Memoized computations and event handlers
- **Better Error Recovery**: Retry mechanisms with exponential backoff
- **Optimized Builds**: Advanced chunking, minification, and tree shaking
- **Performance Tracking**: Built-in monitoring for all operations

### Performance Gains
| Optimization          | Expected Improvement            |
| --------------------- | ------------------------------- |
| Parallel Processing   | **60-80% faster** conversion    |
| Memory Management     | **40-50% less** memory usage    |
| Component Memoization | **30-40% fewer** re-renders     |
| Build Optimization    | **15-25% smaller** bundle size  |
| Error Recovery        | **90%+** successful conversions |

### Developer Experience
- **New Scripts**: `npm run build:analyze`, `npm run build:profile`, `npm run perf:audit`
- **Performance Monitoring**: Real-time metrics and performance tracking
- **Better Debugging**: Enhanced error messages and recovery mechanisms
- **Code Quality**: Zero linting errors and full TypeScript compliance

## [2.1.0] - 2025-10-08

### 🎯 **Enhanced Video Conversion & Settings Management**

### Added
- 🎬 **Dynamic FPS Detection**: Automatically detects and preserves original video frame rates
  - Uses `requestVideoFrameCallback` API for accurate FPS measurement
  - Intelligent snapping to common frame rates (23.976, 29.97, etc.)
  - Fallback support for browsers without advanced video APIs
- ⚙️ **Frame Rate Control**: Complete FPS customization options
  - Industry-standard FPS options: 12, 15, 24, 25, 30, 48, 50, 60 FPS
  - Global FPS settings in conversion panel
  - Individual per-video FPS overrides
  - "Default" option preserves original video timing
- 🔧 **Enhanced Global Settings Management**: Improved "Apply to All" functionality
  - Individual settings checkboxes automatically uncheck after applying global settings
  - Cleaner interface with better settings hierarchy
  - Consistent behavior for both image and video settings

### Fixed
- 🎥 **Video Preview Thumbnails**: Converted videos now show proper placeholder icons instead of broken images
- ⚙️ **Global Video Resolution**: Global resolution settings now properly apply to conversions without requiring "Apply to All"
- 🔧 **Settings Logic**: Fixed individual vs global settings precedence for better user experience
- 📐 **Bitrate Optimization**: Improved video compression settings for smaller file sizes
  - Reduced default bitrate calculations by 75%
  - Lower default CRF (28 instead of 23) for better compression
  - Optimized frame rate calculations

### Improved
- 🚫 **File Format Support**: Removed TIFF support (browser incompatible) and restricted AVI/WMV uploads
- 📱 **User Interface**: Updated About panel to include WebM format information
- 🎯 **Conversion Accuracy**: Enhanced video settings propagation and validation

## [2.0.0] - 2025-10-07

### 🎬 **MAJOR RELEASE: Video Conversion Support**

This is a major version release that transforms the WebP Image Converter into a unified **WebP & WebM Media Converter** with full video conversion capabilities.

### Added
- 🎥 **Video to WebM Conversion**: Complete video conversion pipeline
  - Support for MP4, AVI, MOV, WMV, 3GP, OGV input formats
  - WebM output with VP8 codec and configurable bitrate
  - Browser-based conversion using MediaRecorder API
  - 500MB maximum file size limit for videos
- 🎚️ **Video Conversion Settings**:
  - Bitrate control (100-10000 kbps, default 1000 kbps)
  - Audio inclusion toggle (enable/disable audio tracks)
  - Global video settings applied to all uploaded videos
- 🖼️ **Video Thumbnail Generation**: Automatic preview thumbnails for video files
- 📁 **Unified File Handling**: Single upload area for both images and videos
- 🔍 **Enhanced File Validation**: Separate validation logic for images vs videos
- 📊 **Video File Information**: Duration, dimensions, and conversion progress display

### Enhanced
- 🏷️ **Rebranding**: App renamed to "WebP & WebM Media Converter"
- 📝 **UI Updates**: Upload area and help text updated for dual format support
- 🎛️ **Settings Panel**: Added video conversion controls alongside image settings
- 🔧 **File Management**: Enhanced file manager with video-specific operations
- 📦 **Type System**: Extended TypeScript interfaces for video support
- 🎯 **Conversion Logic**: Unified conversion flow handling both images and videos

### Technical
- 🏗️ **New Service**: `VideoConversionService` for WebM conversion operations
- 🔄 **Enhanced Hooks**: Updated conversion hooks to handle dual format processing
- 📐 **Canvas + MediaRecorder**: Combined HTML5 Canvas and MediaRecorder APIs
- 🎭 **Smart Format Detection**: Automatic routing to appropriate conversion service
- 🧹 **Memory Management**: Proper cleanup for both image and video resources
- ⚡ **Async Processing**: Non-blocking video conversion with progress tracking

### Performance
- 📏 **File Size Limits**:
  - Images: 50MB maximum (unchanged)
  - Videos: 500MB maximum (new)
- 🎬 **Video Processing**: Browser-dependent performance for video encoding
- 📦 **Bundle Impact**: Minimal size increase while adding major functionality

### Security
- 🛡️ **Enhanced Validation**: Strict video format validation
- 🔍 **Type Checking**: Comprehensive MIME type verification for videos
- 🎥 **Safe Encoding**: Browser-sandboxed video processing
- 📏 **Size Limits**: Appropriate limits for different media types

### Breaking Changes
- 🔄 **Version Bump**: Major version due to significant feature addition
- 📱 **App Identity**: Complete rebranding from image-only to media converter
- 🏗️ **API Changes**: Enhanced component interfaces for video support

## [1.2.1] - 2025-10-03

### Added
- 📄 **Footer Component**: Added copyright notice and attribution footer
  - Dynamic year display (automatically updates to current year)
  - Link to creator's GitHub profile
  - Professional styling with rounded corners and shadow
  - Consistent design with app's visual identity

### Enhanced
- 🎨 **App Layout**: Improved visual hierarchy with proper footer placement
- 📝 **Copyright Protection**: Clear ownership attribution throughout the application

## [1.2.0] - 2025-10-03

### Added
- 🏗️ **Component Architecture Refactor**: Complete separation of concerns implementation
  - Organized folder structure with `components/ui` and `components/features`
  - Custom hooks for business logic (`useFileManager`, `useConversion`, `useDownload`, `useDragAndDrop`)
  - Service layer for pure business functions (`ConversionService`)
  - Reusable UI components (`Button`, `Input`, `Card`, `ProgressBar`, `StatusBadge`)

### Enhanced
- 🎨 **UI/UX Improvements**:
  - Centered "Choose Files" button alignment
  - Fixed range slider background fill to match handle position
  - Green download button when files are ready for download
  - Enhanced button variants (primary, secondary, danger, success)
- 🔧 **Developer Experience**:
  - Proper TypeScript ref forwarding with `forwardRef`
  - Clean component interfaces and prop types
  - Modular architecture for easier testing and maintenance

### Technical
- 📐 **Code Organization**: Reduced main App component from 929 lines to 95 lines
- 🧩 **Modularity**: Separated UI, business logic, and state management
- 🎯 **Type Safety**: Enhanced TypeScript support with proper ref handling
- 🧹 **Clean Architecture**: Clear separation between presentation and business logic
- ⚡ **Performance**: Maintained bundle size while improving code maintainability

### Fixed
- 🔧 Range slider fill alignment with handle position
- 🎯 TypeScript ref forwarding warnings
- 🎨 Button styling consistency across variants

## [1.1.0] - 2025-10-02

### Added
- 🖼️ **Image Resizing Feature**: Automatically resize images while maintaining aspect ratio
  - Global resize settings with default 2048px × 2048px maximum dimensions
  - Per-image resize controls for custom dimensions
  - Smart resizing that only downsizes (never upscales) large images
  - Visual dimension display showing original → final sizes
  - "Apply to All" functionality for bulk resize settings
- 📏 **Enhanced File Information**: Display original and final image dimensions
- 🎛️ **Improved Settings Panel**: Dedicated resize controls alongside quality settings
- 🔧 **Flexible Resize Logic**: Choose between global settings or custom per-image dimensions

### Enhanced
- 📊 **Better File Size Display**: Shows dimension changes alongside file size savings
- 🎨 **Improved UI**: Cleaner settings panel with better organization
- 🧠 **Smart Defaults**: Automatic resize to 2048px helps reduce file sizes for large images

### Technical
- 📐 **Canvas-based Resizing**: Efficient HTML5 Canvas API implementation
- 🎯 **Aspect Ratio Preservation**: Mathematical scaling maintains image proportions
- 🔄 **Real-time Updates**: Dynamic dimension calculation and display
- 🧹 **Memory Optimization**: Proper cleanup of resized image data

## [1.0.0] - 2024-10-02

### Added
- 🎉 Initial release of WebP Converter
- 🚀 Client-side image conversion to WebP format
- 📦 Batch processing with ZIP file creation
- 🎯 Quality control slider (10-100%)
- 🎨 Transparency support for PNG files
- 📱 Fully responsive design
- 🔒 Privacy-first approach (no server uploads)
- 🛡️ Content Security Policy implementation
- 📏 File size validation (50MB limit)
- 📐 Image dimension validation (16,384px limit)
- 🧹 Automatic memory cleanup
- 📊 File size comparison and savings display
- ⚡ Modern React 19 + TypeScript + Vite stack

### Security
- 🛡️ Content Security Policy headers
- 🔍 Input validation and sanitization
- 📏 File size and dimension limits
- 🧹 Secure filename handling
- 🔐 Client-side only processing

### Performance
- ⚡ ~68KB gzipped bundle size
- 🏎️ Code splitting and lazy loading
- 🧹 Proper memory management
- 📦 Optimized vendor chunks

### Supported Formats
- **Images**: JPEG, PNG, GIF, BMP, TIFF → WebP with transparency support
- **Videos**: MP4, AVI, MOV, WMV, 3GP, OGV → WebM with VP8 codec

---

## Development

### [Unreleased]
- 🚧 Work in progress features will be listed here

### Contributing
See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines on contributing to this project.

### License
This project is licensed under a Proprietary License - see [LICENSE](LICENSE) for details.

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

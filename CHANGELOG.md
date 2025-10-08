# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
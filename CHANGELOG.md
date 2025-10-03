# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- **Input**: JPEG, PNG, GIF, BMP, TIFF
- **Output**: WebP with transparency support

---

## Development

### [Unreleased]
- 🚧 Work in progress features will be listed here

### Contributing
See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines on contributing to this project.

### License
This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.
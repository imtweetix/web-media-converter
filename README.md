# 🖼️ WebP Image Converter

> A modern, fast, and secure SaaS image converter that transforms your images into the WebP format directly in your browser.

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](#license)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

![WebP Image Converter Screenshot](./public/screenshots/app-demo.webp)

## 🌐 Try It Now

**Use the live application:** [https://image-2-webp.netlify.app/](https://image-2-webp.netlify.app/)

> **Note:** This is a proprietary SaaS application. The source code is available for viewing and contributing only. Please use the official web application above for all conversions.

## ✨ Features

- 🚀 **Lightning Fast**: Client-side processing with HTML5 Canvas API
- 🖼️ **Smart Resizing**: Automatically resize images while maintaining aspect ratio
- 🎨 **Transparency Support**: Preserves alpha channels for PNG files
- 📦 **Batch Processing**: Convert multiple images simultaneously
- 💾 **Smart Downloads**: Auto-generates ZIP files for multiple conversions
- 🎯 **Quality Control**: Adjustable compression (10-100%)
- 📏 **Dimension Control**: Global and per-image resize settings with 2048px defaults
- 🔒 **Privacy First**: No server uploads - everything stays in your browser
- 📱 **Responsive Design**: Works seamlessly on all devices
- ⚡ **Modern Stack**: Built with React 19, TypeScript, and Vite
- 🛡️ **Security Focused**: Content Security Policy and input validation
- 📊 **File Insights**: Shows original vs compressed file sizes and dimension changes

## 🎯 Supported Formats

| Input Formats | Output Format            |
| ------------- | ------------------------ |
| JPEG, JPG     | WebP                     |
| PNG           | WebP (with transparency) |
| GIF           | WebP                     |
| BMP           | WebP                     |
| TIFF          | WebP                     |

## 🚀 Using the Application

### For Users
Simply visit [https://image-2-webp.netlify.app/](https://image-2-webp.netlify.app/) to start converting your images to WebP format instantly.

### For Contributors
This repository is open for contributions. You can:
- Report bugs and issues
- Suggest new features
- Submit pull requests for improvements
- Provide feedback and ideas

**Note:** This source code is for contribution purposes only. Please do not attempt to deploy or host this application yourself.

## 🖼️ Image Resizing

The converter includes intelligent image resizing to help reduce file sizes while maintaining quality:

### **Global Resize Settings**
- **Default**: 2048px × 2048px maximum dimensions
- **Behavior**: Applied to all images automatically
- **Smart Scaling**: Only downsizes large images (never upscales)
- **Aspect Ratio**: Always preserved during resizing

### **Per-Image Control**
- **Individual Override**: Check the resize box for any image to use custom dimensions
- **Flexible Settings**: Each image can have different resize settings
- **Visual Feedback**: See original → final dimensions before conversion

### **How It Works**
1. **Upload images** → Automatically resized to global settings (2048px default)
2. **Adjust global settings** → Changes apply to all images without individual overrides
3. **Enable individual resize** → Check the box to set custom dimensions for specific images
4. **Apply to All** → Reset all images to use current global settings


## 📦 Development Commands (Contributors Only)

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Start development server     |
| `npm run build`        | Build for production         |
| `npm run build:check`  | Type check + build           |
| `npm run preview`      | Preview production build     |
| `npm run type-check`   | Run TypeScript type checking |
| `npm run format`       | Format code with Prettier    |
| `npm run format:check` | Check code formatting        |

> **Important:** These commands are for development and contribution purposes only. Do not use them to deploy or host this application.

## 🛡️ Security Features

- **Content Security Policy**: Prevents XSS attacks
- **File Size Validation**: 50MB maximum file size
- **Dimension Limits**: 16,384px maximum width/height for input images
- **Resize Validation**: Smart bounds checking for custom resize dimensions
- **Input Sanitization**: Secure filename handling
- **Client-Side Only**: No data ever leaves your browser

## 🏗️ Project Structure

```
webp-image-converter/
├── public/
│   ├── favicon.png
│   └── ...
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   │   ├── Button.tsx  # Button component with variants
│   │   │   ├── Input.tsx   # Input component with ref forwarding
│   │   │   ├── Card.tsx    # Card layout components
│   │   │   ├── ProgressBar.tsx # Progress indicator
│   │   │   ├── StatusBadge.tsx # Status display
│   │   │   └── index.ts    # UI components exports
│   │   └── features/       # Feature-specific components
│   │       ├── Header.tsx  # App header
│   │       ├── UploadArea.tsx # File upload interface
│   │       ├── ConversionSettings.tsx # Quality & resize controls
│   │       ├── FilesList.tsx # Files management
│   │       ├── FileItem.tsx # Individual file display
│   │       ├── InfoCard.tsx # WebP information
│   │       └── index.ts    # Feature components exports
│   ├── hooks/              # Custom React hooks
│   │   ├── useFileManager.ts # File state management
│   │   ├── useConversion.ts # Conversion logic
│   │   ├── useDownload.ts  # Download functionality
│   │   ├── useDragAndDrop.ts # Drag & drop handling
│   │   └── index.ts        # Hooks exports
│   ├── services/           # Business logic services
│   │   └── conversionService.ts # Pure conversion functions
│   ├── utils/              # Utility functions
│   │   └── zipUtils.ts     # ZIP file creation
│   ├── types.ts            # TypeScript definitions
│   ├── App.tsx             # Main application (95 lines)
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── dist/                   # Production build output
├── netlify.toml           # Netlify configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── vite.config.ts         # Vite configuration
```

## 🔧 Tech Stack

### Core Technologies
- **[React 19](https://reactjs.org/)** - UI framework with latest features
- **[TypeScript 5.6](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite 6.x](https://vitejs.dev/)** - Lightning-fast build tool

### Styling & UI
- **[Tailwind CSS 3.4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[FontAwesome](https://fontawesome.com/)** - Professional icon library
- **CSS Grid & Flexbox** - Modern layouts
- **Component Architecture** - Modular UI with separation of concerns

### Development Tools
- **[Prettier](https://prettier.io/)** - Code formatting
- **[PostCSS](https://postcss.org/)** - CSS processing
- **[Autoprefixer](https://autoprefixer.github.io/)** - CSS vendor prefixes

## 🤝 Contributing

We welcome contributions to improve this SaaS application! You can help by:

### 🐛 Reporting Issues
- [Open an issue](https://github.com/yourusername/webp-image-converter/issues/new) for bugs
- Provide detailed steps to reproduce
- Include screenshots if applicable

### 💡 Suggesting Features
- [Request a feature](https://github.com/yourusername/webp-image-converter/issues/new) with a clear use case
- Explain the problem it solves
- Describe your proposed solution

### 🔧 Code Contributions
1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and formatting**
   ```bash
   npm run type-check
   npm run format
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### 📋 Contribution Guidelines
- Follow the existing code style
- Write clear commit messages
- Test your changes thoroughly
- Update documentation if needed
- All contributions become part of the proprietary codebase

> **Note:** By contributing, you agree that your contributions will be subject to the same proprietary license as the rest of the project.

## 📝 License

This project is licensed under a **Proprietary License** - see the [LICENSE](LICENSE) file for details.

**Key Points:**
- ✅ View source code for educational purposes
- ✅ Contribute improvements and suggestions
- ✅ Use the official web app at [https://image-2-webp.netlify.app/](https://image-2-webp.netlify.app/)
- ❌ Deploy, host, or distribute this software
- ❌ Use for commercial purposes without permission
- ❌ Create derivative works

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature idea? Please [open an issue](https://github.com/yourusername/webp-image-converter/issues) with:

- **Bug Reports**: Steps to reproduce, expected behavior, screenshots
- **Feature Requests**: Use case, proposed solution, mockups (if applicable)

**For Support:** Use the [GitHub Issues](https://github.com/yourusername/webp-image-converter/issues) for all bug reports, feature requests, and general inquiries.

## 📊 Performance

- **Bundle Size**: ~68KB gzipped
- **Load Time**: < 1 second on fast 3G
- **Processing Speed**: Depends on image size and device capabilities
- **Memory Usage**: Optimized with proper cleanup

## 🌟 Why WebP + Resizing?

**WebP Format Benefits:**
- **25-50% smaller** file sizes compared to JPEG/PNG
- **Better compression** with similar quality
- **Transparency support** like PNG
- **Wide browser support** (96%+ global coverage)

**Smart Resizing Benefits:**
- **Automatic optimization** for web use with 2048px defaults
- **Significant file size reduction** for large photos (4K+ images)
- **Maintained quality** through aspect ratio preservation
- **Flexible control** with global and per-image settings
- **Faster loading** websites and applications

## ❤️ Acknowledgments

- [React Team](https://reactjs.org/community/team.html) for the amazing framework
- [Vite Team](https://vitejs.dev/team/) for the incredible build tool
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [FontAwesome](https://fontawesome.com/) for the professional icons

---

<p align="center">
  Made with ❤️ by [Marc Joseph](https://github.com/imtweetix)
</p>

<p align="center">
  <a href="#top">⬆️ Back to Top</a>
</p>

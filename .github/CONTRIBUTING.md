# Contributing to Web Media Converter

Thank you for your interest in contributing to Web Media Converter! 🎉

## 🌟 Ways to Contribute

- 🐛 **Report bugs** - Found something that doesn't work? Let us know!
- ✨ **Suggest features** - Have an idea to make the app better?
- 📝 **Improve documentation** - Help others understand the project
- 💻 **Submit code** - Fix bugs or implement new features
- 🎨 **Design improvements** - Enhance the user interface
- 🧪 **Testing** - Help ensure everything works correctly

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.19.0
- npm >= 10.0.0
- Git

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/web-media-converter.git
   cd web-media-converter
   ```
3. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```
5. **Open your browser** to `http://localhost:3000`

> **Note:** FontAwesome Pro icons require a `FONTAWESOME_PACKAGE_TOKEN` environment variable. See `.npmrc` for the registry configuration.

## 🔧 Development Guidelines

### Code Style

- We use **Prettier** for code formatting
- **TypeScript** is required for all new code
- Follow **React** best practices and hooks patterns
- Use **Tailwind CSS** for styling (v4.x with CSS-based configuration)
- Use the `@` path alias for imports (e.g., `import { FileItem } from '@/types'`)

### Architecture

- **Conversion logic** must stay centralized in `src/services/`
  - Images: `ConversionService.convertToWebP`
  - Videos: `VideoConversionService.convertToWebM` (ffmpeg.wasm primary, MediaRecorder fallback)
- **Business logic** belongs in custom hooks (`src/hooks/`)
- **Components** should be presentational — keep them in `src/components/`
- **Memory management** is critical — always revoke blob URLs when done

### Before Submitting

Run these commands to ensure your code meets our standards:

```bash
# Type checking
npm run type-check

# Run tests
npm test

# Code formatting
npm run format

# Build test
npm run build
```

### Git Workflow

1. **Create a feature branch from `main`**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** with clear, focused commits
3. **Write descriptive commit messages**:
   ```bash
   git commit -m "feat: add image resize feature"
   git commit -m "fix: resolve memory leak in conversion"
   git commit -m "docs: update installation instructions"
   ```
4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** to the `main` branch

### Commit Message Format

We follow conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding tests
- `chore:` - Build process or tooling changes

### Deployment

- **`main`** branch is for development (does NOT auto-deploy)
- **`production`** branch auto-deploys to Netlify
- Only maintainers merge `main` into `production` for releases

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected vs actual behavior**
4. **Browser and OS information**
5. **Screenshots** if applicable
6. **Console errors** if any

Use our [bug report template](ISSUE_TEMPLATE/bug_report.md) for consistency.

## 💡 Suggesting Features

For feature requests, please:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Explain your proposed solution**
4. **Consider alternatives** you've thought of
5. **Provide use cases** and examples

Use our [feature request template](ISSUE_TEMPLATE/feature_request.md).

## 📋 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality (we use Vitest)
3. **Ensure all checks pass**:
   - TypeScript compilation (`npm run type-check`)
   - Tests (`npm test`)
   - Code formatting (`npm run format:check`)
   - Build process (`npm run build`)
4. **Link related issues** in your PR description
5. **Respond to review feedback** promptly

### Review Process

- All PRs require review before merging
- We aim to review PRs within 48 hours
- Address feedback and update your branch as needed
- Once approved, we'll merge your changes

## ⚠️ Important Notes

- **Client-side only** — do not add server-side processing
- **Bundle size matters** — currently ~55KB gzipped, avoid heavy dependencies
- **CSP must stay consistent** across `vite.config.ts`, `index.html`, and `netlify.toml`
- **ZIP utils (`zipUtils.ts`)** are fragile — test thoroughly after any changes
- **Validation limits** (50MB images, 500MB videos, 16384px dimensions) should not change without testing browser limits

## 🎯 Priority Areas

We're especially interested in contributions for:

- 🔧 **Performance optimizations**
- 🛡️ **Security improvements**
- 📱 **Mobile experience enhancements**
- ♿ **Accessibility improvements**
- 🌍 **Internationalization support**
- 🧪 **Test coverage**

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Documentation](https://vitest.dev/)

## 💬 Questions?

- 📧 Open an issue for technical questions
- 💬 Join discussions in existing issues
- 📖 Check the documentation first

## 🙏 Recognition

Contributors will be:
- **Listed in our README** acknowledgments
- **Mentioned in release notes** for significant contributions
- **Given credit** in relevant documentation

## 📄 License

By contributing, you agree that your contributions will be subject to the same [Proprietary License](../LICENSE) as the rest of the project.

---

Thank you for helping make Web Media Converter better! 🚀

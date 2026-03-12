<!--
Guidance for AI coding agents working on the WebP Image Converter repo.
Keep this file short and focused on patterns, hotspots, and commands an agent
needs to be productive immediately.
-->

# Copilot / AI Agent Instructions — WebP Image Converter

Purpose: help automated coding agents quickly make safe, correct changes.

- Project type: Single-page React app (React 19 + TypeScript) using Vite. See `package.json`, `vite.config.ts`.
- Entry points: `src/main.tsx` (app bootstrap) and `src/App.tsx` (single top-level component).

Key architecture & patterns

- UI-centric client-only app: all processing happens in the browser (no server). Conversion logic lives in `src/App.tsx` (canvas + FileReader + toBlob flow).
- ZIP creation is implemented manually using browser APIs in `src/utils/zipUtils.ts` (custom CRC32, local file headers, central directory). Be careful when editing — this file builds ZIPs byte-for-byte and must preserve byte ordering and offsets.
- Types: `src/types.ts` defines `FileItem`, `ProgressCallback`, and `ConversionSettings`. Use these when adding helpers or refactors.

Developer workflows & commands (verified from `package.json` / README)

- Start dev server: npm run dev (Vite on port 3000). Hot reload enabled via React plugin.
- Typecheck only: npm run type-check (tsc --noEmit). Run this after TypeScript changes.
- Build: npm run build. Preview: npm run preview. Netlify build helper: npm run build:netlify.
- Formatting: npm run format and npm run format:check (Prettier).

Project-specific conventions

- Keep conversion logic in `src/App.tsx` rather than extracting small chunks unless adding clear testable helpers. `convertToWebP` uses a canvas and FileReader and enforces dimension (16384px) and size (50MB) limits — preserve these checks.
- Filenames are sanitized using the helper in `src/utils/zipUtils.ts` (`sanitizeFilename`) before downloads or ZIP entries.
- ZIP creation uses manual binary layout (local headers, central directory, end record). If replacing with a library (e.g., JSZip), preserve the public behavior: returned Blob must be of type `application/zip` and contain the same file names and sizes.
- Progress reporting: UI expects incremental updates via `ProgressCallback` which sets `file.progress` (0–100) and `file.status` ('pending'|'converting'|'converted'|'error'). Use that shape when modifying conversion flows.

Integration points & external deps

- UI libs: `lucide-react` for icons. Don't introduce heavy new UI deps without checking bundle split in `vite.config.ts` (manualChunks present).
- Vite build config: `vite.config.ts` aliases `@` -> `src`. Use it in imports when appropriate.

Quick code examples (use these patterns exactly)

- Updating progress from conversion:
  - call the `ProgressCallback` with numbers: setFiles(prev => prev.map(f => f.id===id?{...f,progress,status:'converting'}:f))
- Sanitize download filename before calling `downloadBlob` (see `src/App.tsx` and `src/utils/zipUtils.ts`).

When editing/tests/PRs

- Always run `npm run type-check` after TypeScript changes.
- Keep runtime behavior identical for ZIP and download features unless explicitly changing UX. When changing `zipUtils.ts`, run manual end-to-end verification in browser because there are no unit tests in the repo.
- Preserve CSP and client-only constraints—avoid adding server-side code or network calls that send files off the client.

Files to inspect when diagnosing issues

- `src/App.tsx` — conversion flow, drag/drop, upload, progress, download UI
- `src/utils/zipUtils.ts` — ZIP implementation and filename sanitization
- `src/types.ts` — data shapes
- `vite.config.ts` & `package.json` — build, dev server, and dependency info
- `public/` — static assets and screenshots

If unsure what to change

- Prefer minimal, well-scoped edits. Example safe tasks: small bugfix in progress state updates, small UX text changes, refactor `createZipWithBrowserAPIs` into smaller functions but keep tests/manual verification.

End — ask for clarification if a required behavior (e.g., ZIP byte layout) isn't obvious.

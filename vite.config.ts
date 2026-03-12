import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: id => {
          // Sentry chunk
          if (id.includes('@sentry')) {
            return 'sentry';
          }
          // React vendor chunk
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          // FontAwesome chunk
          if (id.includes('@fortawesome') || id.includes('@awesome.me')) {
            return 'fontawesome';
          }
          // FFmpeg wrapper chunk (lazy-loaded)
          if (id.includes('@ffmpeg')) {
            return 'ffmpeg';
          }
          // Services chunk (conversion logic)
          if (id.includes('src/services/')) {
            return 'services';
          }
          // Utils chunk
          if (id.includes('src/utils/')) {
            return 'utils';
          }
          // UI components chunk
          if (id.includes('src/components/ui/')) {
            return 'ui-components';
          }
          // Feature components chunk
          if (id.includes('src/components/features/')) {
            return 'feature-components';
          }
        },
        // Optimize chunk names for better caching
        chunkFileNames: chunkInfo => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId
                .split('/')
                .pop()
                ?.replace('.tsx', '')
                .replace('.ts', '')
            : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      // Tree shaking optimization
      treeshake: {
        moduleSideEffects: (id: string) => {
          // Sentry instrument file must run for its side effects
          if (id.includes('instrument')) return true;
          return false;
        },
      },
    },
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com https://kit-pro.fontawesome.com https://ka-p.fontawesome.com; img-src 'self' blob: data: https://www.google-analytics.com; media-src 'self' blob: data:; connect-src 'self' https://kit-pro.fontawesome.com https://ka-p.fontawesome.com https://www.google-analytics.com https://analytics.google.com https://cdn.jsdelivr.net https://*.ingest.sentry.io; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
    },
  },
  preview: {
    port: 3000,
    open: true,
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', '@fortawesome/react-fontawesome'],
    exclude: ['@awesome.me/kit-c9f4d240a1', '@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  // CSS optimization
  css: {
    devSourcemap: true,
  },
});

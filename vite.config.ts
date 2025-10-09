import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
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
          // React vendor chunk
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          // FontAwesome chunk
          if (id.includes('@fortawesome') || id.includes('@awesome.me')) {
            return 'fontawesome';
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
        moduleSideEffects: false,
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
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com https://kit-pro.fontawesome.com https://ka-p.fontawesome.com; img-src 'self' data: blob:; media-src 'self' data: blob:; connect-src 'self' https://kit-pro.fontawesome.com https://ka-p.fontawesome.com; object-src 'none'; base-uri 'self';",
    },
  },
  preview: {
    port: 3000,
    open: true,
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', '@fortawesome/react-fontawesome'],
    exclude: ['@awesome.me/kit-26a4d59a75'],
  },
  // CSS optimization
  css: {
    devSourcemap: true,
  },
});

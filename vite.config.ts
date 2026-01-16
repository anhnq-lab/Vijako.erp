import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      // Optimize chunk sizes
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Manual chunks for better code splitting
          manualChunks: {
            // Vendor chunks
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-charts': ['recharts'],
            'vendor-query': ['@tanstack/react-query'],

            // Large libraries
            'vendor-xlsx': ['xlsx'],
            'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
            'vendor-web-ifc': ['web-ifc', 'web-ifc-three'],

            // UI components
            'ui-components': [
              './src/components/ui/Toast',
              './src/components/ui/LoadingComponents',
              './src/components/ErrorBoundary',
            ],
          },
          // Optimize naming
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        }
      },
      // Enable minification
      minify: 'terser',
      terserOptions: {
        compress: {
          // drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        }
      },
      // Source maps only for development
      sourcemap: mode === 'development',
    },
    // Optimize依存
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  };
});

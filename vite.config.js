import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// CSP & security headers diatur lewat HTTP header di vercel.json (lebih kuat
// dari <meta>, mendukung frame-ancestors penuh + HSTS).
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-pdf', 'pdfjs-dist'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'pdf-vendor': ['react-pdf', 'pdfjs-dist'],
          'flipbook-vendor': ['react-pageflip'],
        },
      },
    },
  },
});

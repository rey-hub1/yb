import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Pastikan PDF worker bisa diakses
  optimizeDeps: {
    include: ['react-pdf', 'pdfjs-dist'],
  },
});

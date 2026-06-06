import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fetchFolderFiles, FOLDER_ID_RE } from './api/drive-folder.js';

// Dev-only: tiru serverless /api/drive-folder di Vite dev server, karena Vite
// tidak menjalankan folder /api (itu cuma di Vercel). Tanpa ini galeri
// "Gagal memuat galeri" pas `npm run dev`. Logika dishare dgn fungsi serverless.
function devDriveFolderApi() {
  return {
    name: 'dev-drive-folder-api',
    configureServer(server) {
      server.middlewares.use('/api/drive-folder', async (req, res) => {
        const json = (status, data) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };
        const url = new URL(req.originalUrl || req.url, 'http://localhost');
        const id = (url.searchParams.get('id') || '').trim();
        if (!FOLDER_ID_RE.test(id)) return json(400, { error: 'id folder tidak valid' });
        try {
          const files = await fetchFolderFiles(id);
          json(200, { files });
        } catch {
          json(502, { error: 'Gagal mengambil folder dari Drive' });
        }
      });
    },
  };
}

// CSP & security headers diatur lewat HTTP header di vercel.json (lebih kuat
// dari <meta>, mendukung frame-ancestors penuh + HSTS).
export default defineConfig({
  plugins: [react(), devDriveFolderApi()],
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

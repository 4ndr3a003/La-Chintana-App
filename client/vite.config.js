import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/arpa': {
        target: 'https://www.arpa.piemonte.it',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/arpa/, '/export/xmlcap/allerta.xml'),
        secure: false,
      },
      '/api/arpa_widget': {
        target: 'https://www.arpa.piemonte.it',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/arpa_widget/, '/rischi_naturali/widget/comuni'),
        secure: false,
      },
    },
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1000, // Aumenta il limite a 1000kB
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('firebase')) {
              return 'firebase';
            }
            if (id.includes('lucide-react')) {
              return 'ui';
            }
          }
        }
      }
    }
  }
})

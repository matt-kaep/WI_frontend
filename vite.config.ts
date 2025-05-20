
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    // Configuration du proxy pour rediriger les requêtes API vers le backend
    proxy: {
      '/api': {
        //target: 'http://localhost:8000', // Remplacez par l'URL correcte de votre backend #
        target: 'https://wi-backend.onrender.com', // Remplacez par l'URL correcte de votre backend
        changeOrigin: true,
        secure: false,
        // Logs pour le débogage
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Erreur de proxy:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Requête proxy envoyée:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Réponse proxy reçue:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
})
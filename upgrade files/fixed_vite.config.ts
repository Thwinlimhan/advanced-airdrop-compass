import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Advanced Crypto Airdrop Compass',
          short_name: 'AirdropCompass',
          description: 'A comprehensive application to track, manage, and strategize for crypto airdrops',
          theme_color: '#4f46e5',
          background_color: '#1f2937',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL || 'http://localhost:3001/api/v1')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './components'),
        '@features': path.resolve(__dirname, './features'),
        '@hooks': path.resolve(__dirname, './hooks'),
        '@contexts': path.resolve(__dirname, './contexts'),
        '@utils': path.resolve(__dirname, './utils'),
        '@types': path.resolve(__dirname, './types')
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            charts: ['chart.js', 'react-chartjs-2'],
            icons: ['lucide-react']
          }
        }
      }
    },
    server: {
      port: 5173,
      host: true
    },
    preview: {
      port: 4173,
      host: true
    }
  };
});

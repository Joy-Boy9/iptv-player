import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api/m3u': {
        target: 'https://iptv-org.github.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/m3u/, ''),
      },
    },
  },
})

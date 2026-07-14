import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/lofidoro/',
  plugins: [react()],
  server: {
    // Spotify rejects `localhost` redirect URIs for new apps; dev via 127.0.0.1
    host: '127.0.0.1',
    port: 5173,
  },
})

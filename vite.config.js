import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['5173-i5e9we68c7b0mkh8rylyp-cc368318.manusvm.computer', '5174-i5e9we68c7b0mkh8rylyp-cc368318.manusvm.computer'],
  },
})


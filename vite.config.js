import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Match Supabase Auth Site URL / Google redirect (localhost:3000)
    port: 3000,
    strictPort: true,
  },
})

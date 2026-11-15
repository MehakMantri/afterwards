import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Built into the first app's output folder, so one deployment serves both: / and /turning-18/.
// The relative base keeps it working wherever that folder is hosted.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: '../afterwards/dist/turning-18', emptyOutDir: true },
})

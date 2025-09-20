import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  base: "",
  build: {
    outDir: 'build', // Output to a 'build' folder inside 'sidepanel'
    emptyOutDir: true, // Clear the output directory on each build
    
    // Crucial for extensions:
    // Ensure all assets are relative to the root, as extensions don't have a specific base URL
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
})

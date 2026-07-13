import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build-Variante für eine eigenständige Einzeldatei:
// klassisches IIFE-Script (kein ES-Modul), damit die gebündelte HTML-Datei
// auch per Doppelklick über file:// funktioniert.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-single',
    emptyOutDir: true,
    modulePreload: false,
    // Breite Browser-Kompatibilität (auch ältere Handys/Browser).
    target: 'es2015',
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: 'app.[ext]',
      },
    },
  },
})

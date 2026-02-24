import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // IMPORTANTE: impostare il nome del repository GitHub qui
  // Esempio: se il repo è https://github.com/utente/tbm-gestione-viteria
  // allora base deve essere '/tbm-gestione-viteria/'
  base: '/tbm-gestione-viteria/',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});

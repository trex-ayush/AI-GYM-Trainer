import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This ensures process.env compatibility if needed
    'process.env': {}
  },
  server: {
    port: 5173,
    open: true
  }
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        teller: fileURLToPath(new URL('./teller.html', import.meta.url)),
        manager: fileURLToPath(new URL('./manager.html', import.meta.url)),
        approver: fileURLToPath(new URL('./approver.html', import.meta.url)),
      },
    },
  },
});

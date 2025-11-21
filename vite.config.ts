import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This base is important for GitHub Pages. 
  // If your repo is 'geotag-app', this allows assets to load correctly.
  base: './', 
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base keeps asset paths valid under https://<user>.github.io/<repo>/
export default defineConfig({ base: './', plugins: [react()] });

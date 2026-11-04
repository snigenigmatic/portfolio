import { defineConfig } from 'vite';
export default defineConfig({ publicDir: 'static', server: { allowedHosts: ['terminal.local'] }, build: { outDir: 'dist' } });

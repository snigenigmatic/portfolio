import {defineConfig} from 'vite';
import writing from './scripts/vite-writing.mjs';
export default defineConfig(({isSsrBuild}) => ({
  publicDir: 'static',
  plugins: [writing()],
  server: {allowedHosts: ['terminal.local']},
  build: {
    outDir: isSsrBuild ? 'dist-ssr' : 'dist',
    copyPublicDir: !isSsrBuild,
    rollupOptions: {
      // Motion marks its modules "use client"; that's meaningless for the build-time prerender.
      onwarn(warning, warn) { if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return; warn(warning); }
    }
  }
}));

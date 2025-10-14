// FIX: To resolve "Cannot find type definition file for 'vitest'", removed the triple-slash directive
// and changed the import to 'vitest/config' to correctly load Vitest types for the 'test' configuration.
import { defineConfig, loadEnv } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tsconfigPaths()],
      define: {
        'process.env': env
      },
      css: {
        postcss: {
          plugins: [
            tailwindcss,
            autoprefixer,
          ],
        },
      },
      test: {
        globals: true,
        environment: 'jsdom',
      },
    };
});
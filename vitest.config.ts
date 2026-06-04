import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist'],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  define: {
    global: 'globalThis',
  },
})

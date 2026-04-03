import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    testTimeout: 30000,
    fileParallelism: false,
    include: ['__tests__/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
  },
});

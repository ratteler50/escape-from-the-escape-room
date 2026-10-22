import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative asset paths, so the build works at the GitHub Pages sub-path and at the root alike.
  base: './',
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // The whole-game searches (explore) take ~1 s here but have hit Vitest's 5 s default on GitHub's
    // slower runners (slices 18 and 20). Generous, but a real hang still fails.
    testTimeout: 30_000,
  },
});

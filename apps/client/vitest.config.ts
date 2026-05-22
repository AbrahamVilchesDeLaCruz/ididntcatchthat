import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vitest config — separada de vite.config.ts intencionalmente.
 * El bundler (Vite) y el test runner (Vitest) tienen responsabilidades distintas.
 *
 * Use:
 *   pnpm test          → vitest run (single pass)
 *   pnpm test:watch    → vitest (TDD loop)
 *   pnpm test:cov      → vitest run --coverage
 *   pnpm test:ui       → vitest --ui (browser UI)
 *   pnpm test:ci       → vitest run --coverage --reporter=verbose (CI)
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],

    // ─── Coverage ───────────────────────────────────────────────────────────
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'src/main.tsx',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },

    // ─── Include / Exclude ──────────────────────────────────────────────────
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'src/test/e2e/**'],
  },
});

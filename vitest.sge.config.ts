import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/sge-baseline/**/*.test.ts'],
    maxWorkers: 1,
    minWorkers: 1,
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: { experimentalDecorators: true },
    },
  },
});

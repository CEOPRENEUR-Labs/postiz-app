import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/sge-baseline/**/*.test.ts'],
    maxWorkers: 1,
  },
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'firestore-rules',
    environment: 'node',
    include: ['tests/firestore/**/*.test.js'],
    testTimeout: 30000,
  },
});

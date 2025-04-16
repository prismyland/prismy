import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['specs/**/*.ts'],
    exclude: ['node_modules', 'dist', 'examples', 'specs/types'],
    coverage: {
      include: ['src/**/*.ts'],
    },
  },
})

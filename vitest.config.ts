import { defineConfig } from 'vitest/config'

export default defineConfig({
  css: {
    postcss: {
      plugins: []
    }
  },
  test: {
    environment: 'node',
    testTimeout: 60000,
    hookTimeout: 60000,
    setupFiles: ['tests/setup/vitest.setup.ts'],
    reporters: 'default'
  }
})

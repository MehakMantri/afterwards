import { defineConfig } from 'vitest/config'

export default defineConfig({ test: { include: ['engine/**/*.test.ts', 'apps/**/*.test.ts'] } })

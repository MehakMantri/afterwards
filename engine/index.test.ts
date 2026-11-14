import { expect, test } from 'vitest'
import { ENGINE_NAME } from './index'

test('engine is importable', () => {
  expect(ENGINE_NAME).toBe('afterwards-engine')
})

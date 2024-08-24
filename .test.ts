import { describe, test, expect } from 'bun:test'
import { getFreq, readTextFile } from './utils'

describe('frequency', async () => {
  const text = await readTextFile('/samples/_input.txt')
  const freq = getFreq(await text.text())
  // There are 333 occurrences of ‘X’ and 223000 of ‘t’.
  test('333 occurrences of X', () => {
    expect(freq['X']).toBe(333)
  })

  test('223000 occurrences of t', () => {
    expect(freq['t']).toBe(223000)
  })
})

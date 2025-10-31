import { describe, expect, test } from 'vitest'
import {
  computeTokenOverlapScore,
  createTitleSignature,
  enforceFirstPersonTitle
} from './canonical'

describe('solution title normalisation', () => {
  test('enforces first-person titles for generic medication descriptors', () => {
    const input = 'Prescription antidepressants (Sertraline/Zoloft)'
    const expected = 'Sertraline (Zoloft)'

    expect(enforceFirstPersonTitle(input)).toBe(expected)
  })

  test('drops generic practice wrapper and preserves specific modality', () => {
    const input = 'Yoga practice (Hatha yoga)'
    const expected = 'Hatha yoga'

    expect(enforceFirstPersonTitle(input)).toBe(expected)
  })

  test('canonical signature matches for generic vs specific medication titles', () => {
    const canonical = createTitleSignature('Sertraline (Zoloft)')
    const generated = createTitleSignature('Prescription antidepressants (Sertraline/Zoloft)')

    expect(generated.canonical).toBe(canonical.canonical)
    expect(computeTokenOverlapScore(generated.tokens, canonical.tokens)).toBeCloseTo(1, 5)
  })

  test('canonical signature matches for acupuncture variants', () => {
    const canonical = createTitleSignature('Acupuncture')
    const generated = createTitleSignature('Weekly acupuncture sessions')

    expect(generated.canonical).toBe(canonical.canonical)
    expect(computeTokenOverlapScore(generated.tokens, canonical.tokens)).toBeCloseTo(1, 5)
  })

  test('distinct pharmacological solutions remain unpaired', () => {
    const sertraline = createTitleSignature('Sertraline (Zoloft)')
    const lexapro = createTitleSignature('Escitalopram (Lexapro)')

    expect(computeTokenOverlapScore(sertraline.tokens, lexapro.tokens)).toBe(0)
  })

  test('leaves branded titles untouched when no rewrite required', () => {
    const title = 'Calm app'
    expect(enforceFirstPersonTitle(title)).toBe(title)
  })
})

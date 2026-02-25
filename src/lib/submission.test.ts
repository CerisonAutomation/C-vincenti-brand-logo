import { describe, it, expect } from 'vitest'
import { computeTier, computePlan, INITIAL_WIZARD_DATA, WizardData } from './submission'

describe('submission utilities', () => {
  it('computeTier returns A for urgent hands-off requests', () => {
    const data: WizardData = { ...INITIAL_WIZARD_DATA, timeline: 'asap', handsOff: true }
    expect(computeTier(data)).toBe('A')
  })

  it('computeTier returns C for exploring timeline', () => {
    const data: WizardData = { ...INITIAL_WIZARD_DATA, timeline: 'exploring' }
    expect(computeTier(data)).toBe('C')
  })

  it('computeTier returns B for other cases', () => {
    const data: WizardData = { ...INITIAL_WIZARD_DATA, timeline: 'soon', handsOff: false }
    expect(computeTier(data)).toBe('B')
  })

  it('computePlan returns Complete for hands-off', () => {
    const data: WizardData = { ...INITIAL_WIZARD_DATA, handsOff: true }
    expect(computePlan(data)).toBe('Complete')
  })

  it('computePlan returns Essentials for assisted', () => {
    const data: WizardData = { ...INITIAL_WIZARD_DATA, handsOff: false }
    expect(computePlan(data)).toBe('Essentials')
  })
})

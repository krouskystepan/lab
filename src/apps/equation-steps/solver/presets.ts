export type EqPreset = {
  id:
    | 'twoStep'
    | 'distribute'
    | 'fractions'
    | 'bothSides'
    | 'quadratic'
    | 'circle'
  input: string
}

export const PRESETS: EqPreset[] = [
  { id: 'twoStep', input: '2x + 5 = 13' },
  { id: 'distribute', input: '3(x - 2) = 9' },
  { id: 'fractions', input: 'x/2 + 1 = 5' },
  { id: 'bothSides', input: '5x - 3 = 2x + 9' },
  { id: 'quadratic', input: 'x^2 - 5x + 6 = 0' },
  { id: 'circle', input: '|x + √(1-x^2)| = √2(2x^2 - 1)' }
]

export const DEFAULT_INPUT = PRESETS[0]!.input

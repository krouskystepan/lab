export const equationStepsEn = {
  'equationSteps.appName': 'Equation Steps',
  'equationSteps.stageAria': 'Equation walkthrough',

  'equationSteps.input.label': 'Equation',
  'equationSteps.input.placeholder': '2x + 5 = 13',
  'equationSteps.input.helpTitle': 'How to type it',
  'equationSteps.input.helpBody':
    'One unknown (x, y, t…). Linear and quadratic, |abs|, √, and sin/cos (including x = cos α when you have √(1 − x²)).',
  'equationSteps.chars.intro':
    'Type the middle column. Fancy symbols in the last column are optional — they mean the same thing.',
  'equationSteps.chars.mean': 'Means',
  'equationSteps.chars.type': 'Type',
  'equationSteps.chars.also': 'Also',
  'equationSteps.chars.plus': 'plus',
  'equationSteps.chars.minus': 'minus',
  'equationSteps.chars.times': 'times',
  'equationSteps.chars.div': 'divide',
  'equationSteps.chars.pow': 'power',
  'equationSteps.chars.eq': 'equals',
  'equationSteps.chars.paren': 'brackets',
  'equationSteps.chars.dec': 'decimal',
  'equationSteps.chars.unk': 'unknown',
  'equationSteps.chars.abs': 'absolute value',
  'equationSteps.chars.sqrt': 'square root',
  'equationSteps.chars.sin': 'sine',
  'equationSteps.chars.cos': 'cosine',
  'equationSteps.chars.pi': 'pi',

  'equationSteps.tools.solve': 'Solve',
  'equationSteps.tools.solveTitle': 'Walk the steps (S / Enter)',

  'equationSteps.pad.x': 'Unknown x',
  'equationSteps.pad.plus': 'Plus',
  'equationSteps.pad.minus': 'Minus',
  'equationSteps.pad.times': 'Times',
  'equationSteps.pad.div': 'Divide',
  'equationSteps.pad.lparen': 'Open bracket',
  'equationSteps.pad.rparen': 'Close bracket',
  'equationSteps.pad.eq': 'Equals',
  'equationSteps.pad.pow': 'Power',
  'equationSteps.pad.abs': 'Absolute value',
  'equationSteps.pad.sqrt': 'Square root',
  'equationSteps.pad.sin': 'Sine',
  'equationSteps.pad.cos': 'Cosine',
  'equationSteps.pad.pi': 'Pi',
  'equationSteps.pad.back': 'Backspace',

  'equationSteps.setup.title': 'Examples',
  'equationSteps.preset.helpTitle': 'Examples',
  'equationSteps.preset.helpBody':
    'Loads a typical school equation and solves it. Two-step, brackets, fractions, unknowns on both sides, then a quadratic that factors.',
  'equationSteps.preset.twoStep': 'Two-step',
  'equationSteps.preset.distribute': 'Brackets',
  'equationSteps.preset.fractions': 'Fractions',
  'equationSteps.preset.bothSides': 'Both sides',
  'equationSteps.preset.quadratic': 'Quadratic',
  'equationSteps.preset.circle': '|x+√|',

  'equationSteps.help.title': 'Equation Steps',
  'equationSteps.help.body':
    'Type an equation and press Solve. The list is the whole walk — expand, clear fractions, move terms, divide. Tap a row, or N / P, to highlight a rewrite.',
  'equationSteps.help.steps':
    'The list is the short recap. Click a row for the longer why on the side — what the move is, and why it keeps both sides equal.',

  'equationSteps.toast.solved': 'Solved',
  'equationSteps.result.idle': 'Type an equation, then Solve.',
  'equationSteps.result.solved': 'Solved',
  'equationSteps.result.identity': 'True for every number.',
  'equationSteps.result.none': 'No solution.',
  'equationSteps.result.empty': 'Type an equation first.',
  'equationSteps.result.parse': 'I could not read that. Check brackets and the equals sign.',
  'equationSteps.result.multiVar': 'One unknown at a time — I saw more than one letter.',
  'equationSteps.result.varInDenom':
    'The unknown is in a denominator. Try multiplying through by hand, or rewrite it as ax + b = c.',
  'equationSteps.result.highDegree': 'I only walk linear and quadratic after the roots are gone.',
  'equationSteps.result.badPower': 'Powers have to be small whole numbers (x², (x+1)²).',
  'equationSteps.result.radical':
    'That mix of roots is more than I can isolate. Try one square root at a time, or |A| = B.',

  'equationSteps.steps.item': 'Step {n}: {label}',

  'equationSteps.reason.start': 'Starting from what you typed.',
  'equationSteps.reason.expand': 'Expand brackets and collect like terms.',
  'equationSteps.reason.simplify': 'Arithmetic, following order of operations.',
  'equationSteps.reason.swap': 'Put the unknown on the left.',
  'equationSteps.reason.clearDenom': 'Multiply both sides by {n} to clear denominators.',
  'equationSteps.reason.subBoth': 'Subtract {term} from both sides.',
  'equationSteps.reason.addBoth': 'Add {term} to both sides.',
  'equationSteps.reason.divBoth': 'Divide both sides by {n}.',
  'equationSteps.reason.mulBoth': 'Multiply both sides by {n}.',
  'equationSteps.reason.factor': 'Factor the quadratic into a product of linear terms.',
  'equationSteps.reason.zeroProduct':
    'A product is zero only if a factor is zero. Solve each factor.',
  'equationSteps.reason.sqrt': 'Take square roots of both sides (and keep ±). √{n} simplified.',
  'equationSteps.reason.quadratic':
    'Quadratic formula. Discriminant Δ = {disc}.',
  'equationSteps.reason.identity': 'Both sides are the same. Every real number works.',
  'equationSteps.reason.none': 'The two sides cannot be equal. No solution.',
  'equationSteps.reason.absSplit':
    '|A| = B means A = B or A = −B, and B cannot be negative.',
  'equationSteps.reason.isolate': 'Move the leftover terms so the root (or abs) sits alone.',
  'equationSteps.reason.square':
    'Square both sides. Keep only values where the root is defined and the other side is ≥ 0.',
  'equationSteps.reason.check':
    'Squaring (and splitting abs) can add extras. Plug back into the original and drop the fakes.',
  'equationSteps.reason.subst':
    'Replace the unknown with a cosine so the leftover square root becomes a sine.',
  'equationSteps.reason.trigId':
    'A standard identity: 2cos²θ − 1 = cos 2θ, and cos θ + sin θ = √2 sin(θ + π/4).',
  'equationSteps.reason.backSub':
    'Undo the extra angle, then take cosine to get back to the original unknown.',

  'equationSteps.depth.aria': 'Why this step',
  'equationSteps.depth.title': 'Step {n}',
  'equationSteps.depth.from': 'From',
  'equationSteps.depth.start':
    'This is the equation as written. Nothing has been rewritten yet.\nThe plan is to isolate the unknown on one side and a number on the other, using only moves that keep both sides equal.',
  'equationSteps.depth.expand':
    'Brackets mean multiply: a(b + c) becomes ab + ac. Then like terms are collected — all the x-pieces together, all the numbers together.\nThe value of each side is unchanged, so the equals sign still holds.',
  'equationSteps.depth.simplify':
    'Only arithmetic, in the usual order: powers first, then × and ÷, then + and −.\nNo terms have moved across the equals sign yet.',
  'equationSteps.depth.swap':
    'Equals is symmetric: if A = B then B = A. Flipping the two sides does not change the solutions.\nPutting the unknown on the left is just so the later lines read left-to-right.',
  'equationSteps.depth.clearDenom':
    'Every term on both sides is multiplied by {n}. Any fraction whose denominator divides {n} becomes an integer.\nThe same multiplier on both sides keeps the equality: if a = b then {n}a = {n}b.',
  'equationSteps.depth.subBoth':
    'Subtract {term} from the left and from the right. If a = b, then a − {term} = b − {term}.\nThat cancels {term} wherever it sat, without changing which numbers work.',
  'equationSteps.depth.addBoth':
    'Add {term} to both sides. If a = b, then a + {term} = b + {term}.\nThat cancels a matching opposite term (a minus that was in the way).',
  'equationSteps.depth.divBoth':
    'Divide both sides by {n}. If a = b and {n} is not zero, then a/{n} = b/{n}.\nThe coefficient of the unknown becomes 1 — that is the isolated answer.',
  'equationSteps.depth.mulBoth':
    'Multiply both sides by {n}. Same factor on both sides keeps equals.\nTypical uses: flip a leading minus (× −1), or undo a remaining fraction.',
  'equationSteps.depth.factor':
    'The quadratic is rewritten as a product of two linear pieces that multiply back to the original.\nSame equation, different shape — ready for the zero-product rule.',
  'equationSteps.depth.zeroProduct':
    'A product is zero only if at least one factor is zero. That is the only way two numbers multiply to 0.\nSo each linear factor is set to 0 and solved. Those values are all the roots.',
  'equationSteps.depth.sqrt':
    'If x² = {n} and {n} is positive, there are two real answers: the principal square root and its opposite.\nWriting ± keeps the negative one; dropping it would lose a solution.',
  'equationSteps.depth.quadratic':
    'The quadratic formula solves ax² + bx + c = 0 for any a ≠ 0: x = (−b ± √Δ) / (2a).\nΔ = {disc} is b² − 4ac. Two real roots if Δ > 0, one if Δ = 0, none if Δ < 0.',
  'equationSteps.depth.identity':
    'After cancelling, both sides are the same true number sentence (0 = 0).\nEvery real value of the unknown works — the original equation was an identity.',
  'equationSteps.depth.none':
    'After cancelling, you get a false number sentence (something like 0 = 1).\nNo value of the unknown can make that true, so there is no solution.',
  'equationSteps.depth.absSplit':
    'Absolute value is distance from zero: |A| = B only if B ≥ 0, and then A is B or −B.\nThose two ordinary equations are solved separately; later we throw away anything that fails the original.',
  'equationSteps.depth.isolate':
    'Same as moving terms across equals: subtract whatever is not the root, from both sides.\nOnce √u sits alone, the next move (squaring) is legal only when both sides are ≥ 0.',
  'equationSteps.depth.square':
    'If √u = v and v ≥ 0, then u = v². Squaring is not reversible, so extra roots can appear.\nThe inside u must also stay ≥ 0 — that is the domain of the original root.',
  'equationSteps.depth.check':
    'Every surviving candidate is substituted into the equation you typed, including abs and roots.\nIf a side is undefined (negative inside a square root) or the two sides differ, that candidate is discarded.',
  'equationSteps.depth.subst':
    'On [0, π], cosine covers every x in [−1, 1] once, and sine stays ≥ 0, so it matches √(1 − x²).\nThe original equation is the same statement, written in α.',
  'equationSteps.depth.trigId':
    'cos 2θ = 2cos²θ − 1 is the double-angle formula. cos θ + sin θ is √2 times sin(θ + π/4), because sin(θ+π/4) = (sin θ + cos θ)/√2.\nDividing both sides by √2 does not change the solutions (√2 ≠ 0). Then cos(2α) = sin(2β) after the shift β = α + π/4.',
  'equationSteps.depth.backSub':
    'α = β − π/4, then x = cos α. Standard values: cos(π/12) = (√6 + √2)/4, cos(3π/4) = −√2/2.\nThose still have to pass the original equation (absolute value and the sign of the right-hand side).',

  'equationSteps.graph.aria': 'Graph of both sides',
  'equationSteps.graph.title': 'Graph',
  'equationSteps.graph.zoomIn': 'Zoom in',
  'equationSteps.graph.zoomOut': 'Zoom out',
  'equationSteps.graph.zoomReset': 'Reset zoom',
  'equationSteps.hotkeys.title': 'Controls',
  'equationSteps.hotkeys.solve': 'solve',
  'equationSteps.hotkeys.next': 'next step',
  'equationSteps.hotkeys.prev': 'previous step',
  'equationSteps.hotkeys.chip.solve': 'S',
  'equationSteps.hotkeys.chip.next': 'N',
  'equationSteps.hotkeys.chip.prev': 'P'
} as const

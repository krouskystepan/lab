import type { MessageKey } from '../../../i18n'
import type { Why } from '../solver/types'

type T = (key: MessageKey, vars?: Record<string, string | number>) => string

export function whyText(why: Why, t: T): string {
  switch (why.k) {
    case 'start':
      return t('equationSteps.reason.start')
    case 'expand':
      return t('equationSteps.reason.expand')
    case 'simplify':
      return t('equationSteps.reason.simplify')
    case 'swap':
      return t('equationSteps.reason.swap')
    case 'clearDenom':
      return t('equationSteps.reason.clearDenom', { n: why.n })
    case 'subBoth':
      return t('equationSteps.reason.subBoth', { term: why.term })
    case 'addBoth':
      return t('equationSteps.reason.addBoth', { term: why.term })
    case 'divBoth':
      return t('equationSteps.reason.divBoth', { n: why.n })
    case 'mulBoth':
      return t('equationSteps.reason.mulBoth', { n: why.n })
    case 'factor':
      return t('equationSteps.reason.factor')
    case 'zeroProduct':
      return t('equationSteps.reason.zeroProduct')
    case 'sqrt':
      return t('equationSteps.reason.sqrt', { n: why.n })
    case 'quadratic':
      return t('equationSteps.reason.quadratic', { disc: why.disc })
    case 'identity':
      return t('equationSteps.reason.identity')
    case 'none':
      return t('equationSteps.reason.none')
    case 'absSplit':
      return t('equationSteps.reason.absSplit')
    case 'isolate':
      return t('equationSteps.reason.isolate')
    case 'square':
      return t('equationSteps.reason.square')
    case 'check':
      return t('equationSteps.reason.check')
    case 'subst':
      return t('equationSteps.reason.subst')
    case 'trigId':
      return t('equationSteps.reason.trigId')
    case 'backSub':
      return t('equationSteps.reason.backSub')
  }
}

export function whyDeep(why: Why, t: T): string {
  switch (why.k) {
    case 'start':
      return t('equationSteps.depth.start')
    case 'expand':
      return t('equationSteps.depth.expand')
    case 'simplify':
      return t('equationSteps.depth.simplify')
    case 'swap':
      return t('equationSteps.depth.swap')
    case 'clearDenom':
      return t('equationSteps.depth.clearDenom', { n: why.n })
    case 'subBoth':
      return t('equationSteps.depth.subBoth', { term: why.term })
    case 'addBoth':
      return t('equationSteps.depth.addBoth', { term: why.term })
    case 'divBoth':
      return t('equationSteps.depth.divBoth', { n: why.n })
    case 'mulBoth':
      return t('equationSteps.depth.mulBoth', { n: why.n })
    case 'factor':
      return t('equationSteps.depth.factor')
    case 'zeroProduct':
      return t('equationSteps.depth.zeroProduct')
    case 'sqrt':
      return t('equationSteps.depth.sqrt', { n: why.n })
    case 'quadratic':
      return t('equationSteps.depth.quadratic', { disc: why.disc })
    case 'identity':
      return t('equationSteps.depth.identity')
    case 'none':
      return t('equationSteps.depth.none')
    case 'absSplit':
      return t('equationSteps.depth.absSplit')
    case 'isolate':
      return t('equationSteps.depth.isolate')
    case 'square':
      return t('equationSteps.depth.square')
    case 'check':
      return t('equationSteps.depth.check')
    case 'subst':
      return t('equationSteps.depth.subst')
    case 'trigId':
      return t('equationSteps.depth.trigId')
    case 'backSub':
      return t('equationSteps.depth.backSub')
  }
}

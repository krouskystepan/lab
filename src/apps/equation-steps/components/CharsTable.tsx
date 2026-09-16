import { useI18n } from '../../../i18n'

const ROWS: {
  type: string
  also: string
  mean:
    | 'equationSteps.chars.plus'
    | 'equationSteps.chars.minus'
    | 'equationSteps.chars.times'
    | 'equationSteps.chars.div'
    | 'equationSteps.chars.pow'
    | 'equationSteps.chars.eq'
    | 'equationSteps.chars.paren'
    | 'equationSteps.chars.dec'
    | 'equationSteps.chars.unk'
    | 'equationSteps.chars.abs'
    | 'equationSteps.chars.sqrt'
    | 'equationSteps.chars.sin'
    | 'equationSteps.chars.cos'
    | 'equationSteps.chars.pi'
}[] = [
  { mean: 'equationSteps.chars.plus', type: '+', also: '' },
  { mean: 'equationSteps.chars.minus', type: '-', also: '−' },
  { mean: 'equationSteps.chars.times', type: '*  or  2x', also: '×  ·' },
  { mean: 'equationSteps.chars.div', type: '/', also: '÷' },
  { mean: 'equationSteps.chars.pow', type: '^2  ^3', also: '²  ³' },
  { mean: 'equationSteps.chars.eq', type: '=', also: '' },
  { mean: 'equationSteps.chars.paren', type: '( )', also: '' },
  { mean: 'equationSteps.chars.abs', type: 'abs()', also: '| |' },
  { mean: 'equationSteps.chars.sqrt', type: 'sqrt()', also: '√()' },
  { mean: 'equationSteps.chars.sin', type: 'sin', also: '' },
  { mean: 'equationSteps.chars.cos', type: 'cos', also: '' },
  { mean: 'equationSteps.chars.pi', type: 'pi', also: 'π' },
  { mean: 'equationSteps.chars.dec', type: '.', also: ',' },
  { mean: 'equationSteps.chars.unk', type: 'x', also: 'y  t' }
]

export function CharsTable() {
  const { t } = useI18n()
  return (
    <table className="w-full min-w-0 border-collapse text-left">
      <caption className="mb-1.5 caption-top text-left text-[0.72rem] font-medium leading-[1.4] text-muted">
        {t('equationSteps.chars.intro')}
      </caption>
      <thead>
        <tr className="text-[0.62rem] font-semibold tracking-[0.06em] text-muted uppercase">
          <th className="border-b border-line py-1 pr-2 font-semibold">
            {t('equationSteps.chars.mean')}
          </th>
          <th className="border-b border-line py-1 pr-2 font-semibold">
            {t('equationSteps.chars.type')}
          </th>
          <th className="border-b border-line py-1 font-semibold">
            {t('equationSteps.chars.also')}
          </th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((row) => (
          <tr key={row.mean}>
            <td className="border-b border-line/70 py-1 pr-2 text-[0.72rem] text-ink">
              {t(row.mean)}
            </td>
            <td className="border-b border-line/70 py-1 pr-2 font-mono text-[0.72rem] text-ink">
              {row.type}
            </td>
            <td className="border-b border-line/70 py-1 font-mono text-[0.72rem] text-muted">
              {row.also || '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

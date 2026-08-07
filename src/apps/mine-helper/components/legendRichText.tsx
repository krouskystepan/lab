import { Fragment, type ReactNode } from 'react'

/** Replace `{sure}`, `{best}`, `{entropy}`, … placeholders with inline nodes. */
export function legendRichText(
  template: string,
  marks: Partial<Record<string, ReactNode>>
): ReactNode {
  const parts = template.split(/\{(\w+)\}/g)
  return (
    <Fragment>
      {parts.map((part, i) => {
        if (i % 2 === 0) return part
        const node = marks[part]
        return <Fragment key={i}>{node ?? `{${part}}`}</Fragment>
      })}
    </Fragment>
  )
}

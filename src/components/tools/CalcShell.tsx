import type { ReactNode } from 'react'
import { Breadcrumbs, type Crumb } from './Breadcrumbs.tsx'

type CalcShellProps = {
  title: string
  kicker: string
  lede: string
  warning: string
  warningKind: 'warn' | 'irreversible'
  crumbs: Crumb[]
  calculator: ReactNode
  meaning: ReactNode
  formula: ReactNode
  example: ReactNode
  assumptions: ReactNode
  notes: ReactNode
  faqs: ReactNode
  related: ReactNode
  sources: ReactNode
  disclaimer: ReactNode
}

export function CalcShell({
  title,
  kicker,
  lede,
  warning,
  warningKind,
  crumbs,
  calculator,
  meaning,
  formula,
  example,
  assumptions,
  notes,
  faqs,
  related,
  sources,
  disclaimer,
}: CalcShellProps) {
  const warningClass = warningKind === 'irreversible' ? 'safety safety-irreversible' : 'safety safety-warn'

  return (
    <article className="tool-page tool-col">
      <Breadcrumbs items={crumbs} />
      <p className="kicker">{kicker}</p>
      <h1>{title}</h1>
      <p className="lede">{lede}</p>
      <p className={warningClass}>{warning}</p>
      {calculator}
      {meaning}
      {formula}
      {example}
      {assumptions}
      {notes}
      {faqs}
      {related}
      {sources}
      {disclaimer}
    </article>
  )
}

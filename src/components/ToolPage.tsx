import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

export function useCanonicalSlash(): string | null {
  const { pathname, search, hash } = useLocation()
  if (pathname !== '/' && !pathname.endsWith('/')) return `${pathname}/${search}${hash}`
  return null
}
import Breadcrumbs, { type Crumb } from './Breadcrumbs.tsx'
import { SITE_NAME } from '../site.ts'

type WarningKind = 'warn' | 'irreversible'

type ToolPageProps = {
  title: string
  description: string
  kicker: string
  lede: string
  warning: string
  warningKind: WarningKind
  crumbs: Crumb[]
  fretPrint?: boolean
  children?: ReactNode
}

/**
 * Locked tool-page order: title, lede, safety, calculator (inputs + result + copy),
 * then meaning, formula, example, assumptions, notes, FAQs, related, sources, disclaimer.
 * Children are the sections after the safety line, already in that order.
 */
export default function ToolPage({
  title,
  description,
  kicker,
  lede,
  warning,
  warningKind,
  crumbs,
  fretPrint = false,
  children,
}: ToolPageProps) {
  const slash = useCanonicalSlash()
  const pageTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`

  useEffect(() => {
    const prevTitle = document.title
    document.title = pageTitle
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute('content') ?? ''
    if (meta) meta.setAttribute('content', description)
    if (fretPrint) document.body.classList.add('is-fret-page')
    return () => {
      document.title = prevTitle
      if (meta) meta.setAttribute('content', prevDesc)
      document.body.classList.remove('is-fret-page')
    }
  }, [pageTitle, description, fretPrint])

  if (slash) return <Navigate to={slash} replace />

  const warningClass = warningKind === 'irreversible' ? 'safety safety-irreversible' : 'safety safety-warn'

  return (
    <article className="tool-col">
      <Breadcrumbs items={crumbs} />
      <p className="kicker">{kicker}</p>
      <h1>{title}</h1>
      <p className="lede">{lede}</p>
      <p className={warningClass}>{warning}</p>
      {children}
    </article>
  )
}

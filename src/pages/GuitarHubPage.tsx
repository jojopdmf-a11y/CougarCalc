import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs.tsx'
import ToolIndex from '../components/ToolIndex.tsx'
import { useCanonicalSlash } from '../components/ToolPage.tsx'
import { GUITAR_CATEGORY, GUITAR_TOOLS, liveCount } from '../data/catalog.ts'
import { SITE_NAME } from '../site.ts'

const GUITAR_HUB_DESCRIPTION =
  'Guitar-building calculators for CougarCalc Phase 2. Twelve tools live in this category.'

export function GuitarHubPage() {
  const slash = useCanonicalSlash()
  useEffect(() => {
    const prevTitle = document.title
    document.title = `${GUITAR_CATEGORY.title} calculators — ${SITE_NAME}`
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute('content') ?? ''
    if (meta) meta.setAttribute('content', GUITAR_HUB_DESCRIPTION)
    return () => {
      document.title = prevTitle
      if (meta) meta.setAttribute('content', prevDesc)
    }
  }, [])
  if (slash) return <Navigate to={slash} replace />
  const { live, total } = liveCount(GUITAR_TOOLS)
  return (
    <div className="tool-col">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { href: GUITAR_CATEGORY.href, label: GUITAR_CATEGORY.title },
        ]}
      />
      <p className="kicker">Category</p>
      <h1>{GUITAR_CATEGORY.title}</h1>
      <p className="lede">{GUITAR_CATEGORY.summary}</p>
      <p className="prose">
        {live} / {total} tools · {live} live in this prototype.
      </p>
      <ToolIndex tools={GUITAR_TOOLS} />
      <p className="prose">
        <a href="/guitar-building/visualizer">3D guitar visualizer (spike)</a>
      </p>
    </div>
  )
}

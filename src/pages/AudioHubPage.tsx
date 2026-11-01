import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs.tsx'
import ToolIndex from '../components/ToolIndex.tsx'
import { useCanonicalSlash } from '../components/ToolPage.tsx'
import { AUDIO_CATEGORY, AUDIO_TOOLS, liveCount } from '../data/catalog.ts'
import { DELAY_CATEGORY_ONELINER, SITE_NAME } from '../site.ts'

export function AudioHubPage() {
  const slash = useCanonicalSlash()
  useEffect(() => {
    const prevTitle = document.title
    document.title = `${AUDIO_CATEGORY.title} calculators — ${SITE_NAME}`
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute('content') ?? ''
    if (meta) meta.setAttribute('content', DELAY_CATEGORY_ONELINER)
    return () => {
      document.title = prevTitle
      if (meta) meta.setAttribute('content', prevDesc)
    }
  }, [])
  if (slash) return <Navigate to={slash} replace />
  const { live, total } = liveCount(AUDIO_TOOLS)
  return (
    <div className="tool-col">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { href: AUDIO_CATEGORY.href, label: AUDIO_CATEGORY.title },
        ]}
      />
      <p className="kicker">Category</p>
      <h1>{AUDIO_CATEGORY.title}</h1>
      <p className="lede">{AUDIO_CATEGORY.summary}</p>
      <p className="prose">
        {live} / {total} tools · {live} live in this prototype.
      </p>
      <ToolIndex tools={AUDIO_TOOLS} />
    </div>
  )
}

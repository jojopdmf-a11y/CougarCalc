import { Link } from 'react-router-dom'
import { AUDIO_CATEGORY, AUDIO_TOOLS, GUITAR_CATEGORY, GUITAR_TOOLS } from '../data/catalog.ts'
import { ToolIndex } from '../components/tools/ToolIndex.tsx'

const live = [...AUDIO_TOOLS, ...GUITAR_TOOLS].filter((t) => t.built)

export function ToolsIndexPage() {
  return (
    <div className="tool-page tool-col">
      <p className="kicker">Free tools</p>
      <h1>Free tools</h1>
      <p className="lede">Two live calculators in this prototype. Remaining catalog names stay muted until they are ported.</p>
      <div className="category-grid">
        <Link className="home-card" to={AUDIO_CATEGORY.href}>
          <h2>{AUDIO_CATEGORY.title}</h2>
          <p>{AUDIO_CATEGORY.summary}</p>
          <span className="live-tool">Speaker delay is live</span>
          <span className="count">1 / 12 live</span>
        </Link>
        <Link className="home-card" to={GUITAR_CATEGORY.href}>
          <h2>{GUITAR_CATEGORY.title}</h2>
          <p>{GUITAR_CATEGORY.summary}</p>
          <span className="live-tool">Fret position is live</span>
          <span className="count">1 / 12 live</span>
        </Link>
      </div>
      <h2>Live now</h2>
      <ToolIndex tools={live} />
    </div>
  )
}

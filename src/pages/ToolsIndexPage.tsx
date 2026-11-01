import { AUDIO_CATEGORY, AUDIO_TOOLS, GUITAR_CATEGORY, GUITAR_TOOLS, liveCount } from '../data/catalog.ts'

export function ToolsIndexPage() {
  const audio = liveCount(AUDIO_TOOLS)
  const guitar = liveCount(GUITAR_TOOLS)
  return (
    <div className="tool-col">
      <p className="kicker">Free tools</p>
      <h1>Free tools</h1>
      <p className="lede">Indexes for audio / live sound and guitar building.</p>
      <ul className="tool-index">
        <li>
          <a href={AUDIO_CATEGORY.href}>
            <span className="title">{AUDIO_CATEGORY.title}</span>
            <p className="one-liner">{AUDIO_CATEGORY.summary}</p>
            <span className="muted-status">
              {audio.live} / {audio.total} live
            </span>
          </a>
        </li>
        <li>
          <a href={GUITAR_CATEGORY.href}>
            <span className="title">{GUITAR_CATEGORY.title}</span>
            <p className="one-liner">{GUITAR_CATEGORY.summary}</p>
            <span className="muted-status">
              {guitar.live} / {guitar.total} live
            </span>
          </a>
        </li>
        <li>
          <a href="/guitar-building/visualizer">
            <span className="title">3D guitar visualizer (spike)</span>
            <p className="one-liner">Existing viewer. Not one of the 24 calculators.</p>
          </a>
        </li>
      </ul>
    </div>
  )
}

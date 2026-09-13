import { Link } from 'react-router-dom'
import { AppPreviewCard } from '../components/AppPreviewCard'
import { APP_PREVIEWS } from '../data/apps.ts'
import { StubPage } from '../components/StubPage'

export function HomePage() {
  return (
    <StubPage title="Podcast stems → polish → loudness">
      <p>
        Scaffold ready. Design pack is in <code>docs/</code>; screenshots are in{' '}
        <code>public/apps/</code>. Full homepage follows <code>docs/CURSOR-KICKOFF.md</code>.
      </p>
      <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
        <Link className="btn btn-primary" to="/apps">
          See the apps →
        </Link>
        <Link className="btn btn-ghost" to="/tools">
          Browse free tools
        </Link>
      </p>
      <div className="app-preview-grid">
        {APP_PREVIEWS.map((app) => (
          <AppPreviewCard key={app.path} {...app} />
        ))}
      </div>
    </StubPage>
  )
}

import { Link } from 'react-router-dom'
import { StubPage } from '../components/StubPage'

const apps = [
  {
    name: 'Podcast Stripper',
    path: '/apps/podcast-stripper',
    blurb: 'Stereo mix → speaker tracks + music.',
    image: '/apps/podcast-stripper.png',
  },
  {
    name: 'Fixer Mixer',
    path: '/apps/fixer-mixer',
    blurb: 'Stems → polish → bounce.',
    image: '/apps/fixer-mixer.png',
  },
  {
    name: 'Lil Leveler',
    path: '/apps/lil-leveler',
    blurb: 'Final mix → platform loudness.',
    image: '/apps/lil-leveler.png',
  },
]

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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginTop: 36,
        }}
      >
        {apps.map((app) => (
          <Link
            key={app.path}
            to={app.path}
            style={{
              display: 'block',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 12,
              textDecoration: 'none',
              color: 'inherit',
              boxShadow: 'var(--glow-cyan)',
            }}
          >
            <img
              src={app.image}
              alt=""
              style={{
                width: '100%',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                aspectRatio: '16 / 10',
                objectFit: 'cover',
                objectPosition: 'top',
                background: '#000',
              }}
            />
            <h2 style={{ margin: '12px 0 4px', fontSize: '1.05rem', color: 'var(--text)' }}>
              {app.name}
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}>{app.blurb}</p>
          </Link>
        ))}
      </div>
    </StubPage>
  )
}

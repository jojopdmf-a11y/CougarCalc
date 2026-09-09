import { Link } from 'react-router-dom'
import { StubPage } from '../components/StubPage'

export function AppsIndexPage() {
  return (
    <StubPage title="Apps">
      <p>Pipeline order: Stripper → Mixer → Leveler.</p>
      <ul>
        <li>
          <Link to="/apps/podcast-stripper">Podcast Stripper</Link>
        </li>
        <li>
          <Link to="/apps/fixer-mixer">Fixer Mixer</Link>
        </li>
        <li>
          <Link to="/apps/lil-leveler">Lil Leveler</Link>
        </li>
      </ul>
    </StubPage>
  )
}

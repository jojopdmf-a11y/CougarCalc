import { Link } from 'react-router-dom'
import { StubPage } from '../components/StubPage'

type ToolsStubPageProps = {
  title: string
  note: string
  links?: { to: string; label: string }[]
}

export function ToolsStubPage({ title, note, links }: ToolsStubPageProps) {
  return (
    <StubPage title={title}>
      <p>{note}</p>
      {links && links.length > 0 && (
        <ul>
          {links.map((link) => (
            <li key={link.to}>
              <Link to={link.to}>{link.label}</Link>
            </li>
          ))}
        </ul>
      )}
      <p>
        Free-tool formulas will be connected from Grokbot’s Calc work. See{' '}
        <code>docs/FREE-TOOLS.md</code>.
      </p>
    </StubPage>
  )
}

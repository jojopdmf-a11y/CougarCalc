import { StubPage } from '../components/StubPage'

type ToolsStubPageProps = {
  title: string
  note: string
}

export function ToolsStubPage({ title, note }: ToolsStubPageProps) {
  return (
    <StubPage title={title}>
      <p>{note}</p>
      <p>
        Free-tool formulas will be connected from Grokbot’s Calc work. See{' '}
        <code>docs/FREE-TOOLS.md</code>.
      </p>
    </StubPage>
  )
}

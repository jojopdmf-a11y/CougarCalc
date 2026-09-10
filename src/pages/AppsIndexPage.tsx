import { AppPreviewCard } from '../components/AppPreviewCard'
import { APP_PREVIEWS } from '../data/apps.ts'
import { StubPage } from '../components/StubPage'

export function AppsIndexPage() {
  return (
    <StubPage title="Apps">
      <p>Pipeline order: Stripper → Mixer → Leveler.</p>
      <div className="app-preview-grid">
        {APP_PREVIEWS.map((app) => (
          <AppPreviewCard key={app.path} {...app} />
        ))}
      </div>
    </StubPage>
  )
}

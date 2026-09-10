import { AUDIO_CATEGORY, AUDIO_TOOLS, GUITAR_CATEGORY, GUITAR_TOOLS } from '../data/catalog.ts'
import { Breadcrumbs } from '../components/tools/Breadcrumbs.tsx'
import { ToolIndex } from '../components/tools/ToolIndex.tsx'

type ToolCategoryPageProps = {
  kind: 'audio' | 'guitar'
}

export function ToolCategoryPage({ kind }: ToolCategoryPageProps) {
  const category = kind === 'audio' ? AUDIO_CATEGORY : GUITAR_CATEGORY
  const tools = kind === 'audio' ? AUDIO_TOOLS : GUITAR_TOOLS
  const live = tools.filter((t) => t.built).length

  return (
    <div className="tool-page tool-col">
      <Breadcrumbs
        items={[
          { to: '/', label: 'Home' },
          { to: category.href, label: category.title },
        ]}
      />
      <p className="kicker">Category</p>
      <h1>{category.title}</h1>
      <p className="lede">{category.summary}</p>
      <p className="prose">
        {tools.length} / {tools.length} tools · {live} live in this prototype.
      </p>
      <ToolIndex tools={tools} />
    </div>
  )
}

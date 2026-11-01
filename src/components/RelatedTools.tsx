import type { ToolEntry } from '../data/catalog.ts'

type Props = {
  tools: ToolEntry[]
  intro: string
}

export default function RelatedTools({ tools, intro }: Props) {
  return (
    <section id="related-tools" className="prose">
      <h2>Related tools</h2>
      <p>{intro}</p>
      <ul className="related">
        {tools.map((tool) => (
          <li key={tool.href}>
            {tool.built ? (
              <a href={tool.href}>
                <strong>{tool.title}</strong>
                <span className="one-liner">{tool.summary}</span>
                <span className="muted-status">Live in this prototype</span>
              </a>
            ) : (
              <>
                <strong>{tool.title}</strong>
                <p className="one-liner">{tool.summary}</p>
                <span className="muted-status">not in this prototype</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

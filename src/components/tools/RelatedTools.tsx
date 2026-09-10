import { Link } from 'react-router-dom'
import type { ToolEntry } from '../../data/catalog.ts'

export function RelatedTools({ tools, intro }: { tools: ToolEntry[]; intro: string }) {
  return (
    <section id="related-tools">
      <h2>Related tools</h2>
      <p className="prose">{intro}</p>
      <ul className="related">
        {tools.map((tool) => (
          <li key={tool.slug}>
            <Link to={tool.href}>
              <strong>{tool.title}</strong>
              {tool.summary}
              <span className="muted-status">
                {tool.built ? 'Built in this prototype' : 'Not built yet — opens the category page'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

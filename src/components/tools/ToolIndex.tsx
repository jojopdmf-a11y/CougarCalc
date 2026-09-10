import { Link } from 'react-router-dom'
import type { ToolEntry } from '../../data/catalog.ts'

export function ToolIndex({ tools }: { tools: ToolEntry[] }) {
  return (
    <ul className="tool-index">
      {tools.map((tool) => (
        <li key={tool.slug}>
          {tool.built ? (
            <Link to={tool.href}>
              <span className="title">{tool.title}</span>
              <p className="one-liner">{tool.summary}</p>
              <span className="muted-status">Live</span>
            </Link>
          ) : (
            <>
              <span className="title">{tool.title}</span>
              <p className="one-liner">{tool.summary}</p>
              <span className="muted-status">not in this prototype</span>
            </>
          )}
        </li>
      ))}
    </ul>
  )
}

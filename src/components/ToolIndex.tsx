import type { ToolEntry } from '../data/catalog.ts'

export default function ToolIndex({ tools }: { tools: ToolEntry[] }) {
  return (
    <ul className="tool-index">
      {tools.map((tool) => (
        <li key={tool.href}>
          {tool.built ? (
            <a href={tool.href}>
              <span className="title">{tool.title}</span>
              <p className="one-liner">{tool.summary}</p>
              <span className="muted-status">Live in this prototype</span>
            </a>
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

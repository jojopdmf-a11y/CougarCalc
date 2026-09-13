import { Link } from 'react-router-dom'

export type Crumb = { to: string; label: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="crumbs">
        {items.map((item, i) => (
          <li key={`${item.to}-${item.label}`}>
            {i < items.length - 1 ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
            {i < items.length - 1 ? <span aria-hidden="true"> / </span> : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}

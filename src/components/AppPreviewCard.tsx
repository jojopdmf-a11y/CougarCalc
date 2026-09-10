import { Link } from 'react-router-dom'
import type { AppPreview } from '../data/apps.ts'

export function AppPreviewCard({ name, path, blurb, image }: AppPreview) {
  return (
    <Link to={path} className="app-preview-card">
      <img src={image} alt={`${name} app window`} />
      <h2>{name}</h2>
      <p>{blurb}</p>
    </Link>
  )
}

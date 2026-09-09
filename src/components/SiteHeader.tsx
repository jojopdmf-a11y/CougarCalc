import { NavLink } from 'react-router-dom'

const links = [
  { to: '/apps', label: 'Apps' },
  { to: '/tools', label: 'Free Tools' },
  { to: '/guitar-building', label: 'Guitar' },
  { to: '/audio-live-sound', label: 'Audio' },
  { to: '/about', label: 'About' },
]

export function SiteHeader() {
  return (
    <header className="site-header">
      <NavLink to="/" className="logo" end>
        Cougar<span>Calc</span>.com
      </NavLink>
      <nav className="site-nav" aria-label="Primary">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({ color: isActive ? 'var(--text)' : undefined })}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <NavLink to="/buy" className="btn btn-outline">
        Buy apps
      </NavLink>
    </header>
  )
}

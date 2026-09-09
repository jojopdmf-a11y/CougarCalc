import { StubPage } from '../components/StubPage'

type AppProductPageProps = {
  name: string
  blurb: string
  image: string
}

export function AppProductPage({ name, blurb, image }: AppProductPageProps) {
  return (
    <StubPage title={name}>
      <p>{blurb}</p>
      <p>Buy CTA placeholder — Paddle sandbox catalog already exists.</p>
      <img
        src={image}
        alt={`${name} screenshot`}
        style={{
          width: 'min(100%, 720px)',
          marginTop: 20,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--glow-cyan)',
        }}
      />
    </StubPage>
  )
}

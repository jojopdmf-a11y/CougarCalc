import { BuyButton } from '../components/BuyButton'
import { StubPage } from '../components/StubPage'
import { getByKey } from '../lib/catalog'

type AppProductPageProps = {
  name: string
  blurb: string
  image: string
  catalogKey: 'stripper' | 'mixer' | 'leveler'
}

export function AppProductPage({ name, blurb, image, catalogKey }: AppProductPageProps) {
  const item = getByKey(catalogKey)

  return (
    <StubPage title={name}>
      <p>{blurb}</p>
      {item ? (
        <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginTop: 16 }}>
          <BuyButton priceId={item.priceId} label={`Buy $${item.usd}`} />
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sandbox · one-time license</span>
        </p>
      ) : (
        <p>Catalog item missing for {catalogKey}.</p>
      )}
      <img
        className="app-preview-full"
        src={image}
        alt={`${name} app window`}
      />
    </StubPage>
  )
}

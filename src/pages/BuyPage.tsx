import { BuyButton } from '../components/BuyButton'
import { StubPage } from '../components/StubPage'
import { CATALOG } from '../lib/catalog'

function ProductRow({
  name,
  usd,
  priceId,
  note,
}: {
  name: string
  usd: number
  priceId: string
  note?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        padding: '14px 16px',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface)',
        boxShadow: 'var(--glow-cyan)',
      }}
    >
      <div>
        <div style={{ fontWeight: 700 }}>{name}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          ${usd.toFixed(2)} USD · one-time
          {note ? ` · ${note}` : ''}
        </div>
      </div>
      <BuyButton priceId={priceId} label={`Buy $${usd}`} />
    </div>
  )
}

export function BuyPage() {
  const order = ['stripper', 'mixer', 'leveler', 'suite']
  const products = order
    .map((key) => CATALOG.find((p) => p.key === key))
    .filter(Boolean)

  return (
    <StubPage title="Buy apps">
      <p>
        Sandbox checkout (no real charges). Opens Paddle overlay. After payment you land on the
        success page — license delivery via webhook comes next.
      </p>

      <div style={{ display: 'grid', gap: 12, marginTop: 28 }}>
        {products.map((item) => (
          <ProductRow
            key={item!.key}
            name={item!.name}
            usd={item!.usd}
            priceId={item!.priceId}
            note={item!.key === 'suite' ? 'all three apps' : undefined}
          />
        ))}
      </div>
    </StubPage>
  )
}

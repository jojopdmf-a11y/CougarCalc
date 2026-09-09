import { BuyButton } from '../components/BuyButton'
import { StubPage } from '../components/StubPage'
import { COUGARCALC_PRODUCTS, MEMORYMAP_PRODUCTS } from '../lib/catalog'

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
  // Stable display order for CougarCalc
  const order = ['stripper', 'mixer', 'leveler', 'suite']
  const cougar = order
    .map((key) => COUGARCALC_PRODUCTS.find((p) => p.key === key))
    .filter(Boolean)

  return (
    <StubPage title="Buy apps">
      <p>
        Sandbox checkout (no real charges). Opens Paddle overlay. After payment you land on the
        success page — license delivery via webhook comes next.
      </p>

      <h2 style={{ marginTop: 28, marginBottom: 12, fontSize: '1.1rem' }}>CougarCalc</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {cougar.map((item) => (
          <ProductRow
            key={item!.key}
            name={item!.name}
            usd={item!.usd}
            priceId={item!.priceId}
            note={item!.key === 'suite' ? 'all three apps' : undefined}
          />
        ))}
      </div>

      <h2 style={{ marginTop: 36, marginBottom: 12, fontSize: '1.1rem' }}>MemoryMap credits</h2>
      <p style={{ marginTop: 0 }}>Same Paddle sandbox account — handy for testing both catalogs.</p>
      <div style={{ display: 'grid', gap: 12 }}>
        {MEMORYMAP_PRODUCTS.map((item) => (
          <ProductRow key={item.key} name={item.name} usd={item.usd} priceId={item.priceId} />
        ))}
      </div>
    </StubPage>
  )
}

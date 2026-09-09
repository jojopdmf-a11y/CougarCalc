import { Link } from 'react-router-dom'
import { StubPage } from '../components/StubPage'

export function BuySuccessPage() {
  return (
    <StubPage title="Thanks — payment received">
      <p>
        Sandbox checkout completed. This page is UX only; real license / credit fulfillment will
        come from a Paddle webhook next.
      </p>
      <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
        <Link className="btn btn-primary" to="/buy">
          Back to buy
        </Link>
        <Link className="btn btn-ghost" to="/apps">
          See the apps
        </Link>
      </p>
    </StubPage>
  )
}

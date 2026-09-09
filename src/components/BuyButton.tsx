import { openCheckout, usePaddle } from '../lib/paddle'

type BuyButtonProps = {
  priceId: string
  label?: string
  className?: string
}

export function BuyButton({ priceId, label = 'Buy now', className = 'btn btn-primary' }: BuyButtonProps) {
  const { paddle, ready, error } = usePaddle()

  return (
    <button
      type="button"
      className={className}
      disabled={!ready || !paddle}
      title={error ?? undefined}
      onClick={() => {
        if (!paddle) return
        openCheckout(paddle, priceId)
      }}
    >
      {ready ? label : 'Loading checkout…'}
    </button>
  )
}

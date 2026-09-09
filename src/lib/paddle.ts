import { initializePaddle, type Paddle } from '@paddle/paddle-js'
import { useEffect, useState } from 'react'

let paddleSingleton: Paddle | null = null
let paddlePromise: Promise<Paddle | null> | null = null

async function loadPaddle(): Promise<Paddle | null> {
  if (paddleSingleton) return paddleSingleton
  if (paddlePromise) return paddlePromise

  const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string | undefined
  const environment = (import.meta.env.VITE_PADDLE_ENV as 'sandbox' | 'production' | undefined) ?? 'sandbox'

  if (!token) {
    console.warn('VITE_PADDLE_CLIENT_TOKEN is missing')
    return null
  }

  paddlePromise = initializePaddle({
    token,
    environment,
  }).then((paddle) => {
    paddleSingleton = paddle ?? null
    return paddleSingleton
  })

  return paddlePromise
}

export function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle | null>(paddleSingleton)
  const [ready, setReady] = useState(Boolean(paddleSingleton))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadPaddle()
      .then((instance) => {
        if (cancelled) return
        setPaddle(instance)
        setReady(Boolean(instance))
        if (!instance) setError('Paddle failed to initialize (check client token / env).')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Paddle init error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { paddle, ready, error }
}

export function openCheckout(paddle: Paddle, priceId: string) {
  paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    settings: {
      displayMode: 'overlay',
      theme: 'dark',
      successUrl: `${window.location.origin}/buy/success`,
    },
  })
}

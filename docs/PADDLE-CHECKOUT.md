# Paddle sandbox checkout

Overlay checkout is wired on:

- `/buy` — all CougarCalc + MemoryMap products
- `/apps/podcast-stripper`, `/apps/fixer-mixer`, `/apps/lil-leveler` — per-app Buy buttons
- `/buy/success` — post-checkout thank-you page (UX only)

## Env

Copy `.env.example` → `.env.local`:

```bash
VITE_PADDLE_CLIENT_TOKEN=test_…
VITE_PADDLE_ENV=sandbox
```

Client token for this project: created as **CougarCalc site sandbox** in Paddle (`ctkn_…`). The `test_…` value lives in `.env.local` (gitignored).

## Local test checklist

1. `npm run dev`
2. In [Paddle sandbox](https://sandbox-vendors.paddle.com/):
   - **Checkout → Checkout settings → Default payment link** = `http://localhost:5173` (or your Vite URL)
   - Website approval: localhost is fine in sandbox
3. Open `/buy` → click **Buy** → complete with a [sandbox test card](https://developer.paddle.com/concepts/payment-methods/credit-debit-card#test-payment-credentials)
4. You should land on `/buy/success`

## Still TODO

- Webhooks to grant licenses / MemoryMap credits (do not trust the success page alone)
- Live catalog + live client token when taking real money

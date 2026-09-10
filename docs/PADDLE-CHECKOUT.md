# Paddle sandbox checkout

Overlay checkout is wired on:

- `/buy` — CougarCalc apps only
- `/apps/podcast-stripper`, `/apps/fixer-mixer`, `/apps/lil-leveler` — per-app Buy buttons
- `/buy/success` — post-checkout thank-you page (UX only)

CougarCalc and MemoryMap are separate sites. They share one CougarCorp Paddle seller account (catalog, webhooks, client tokens). MemoryMap credit products stay in that account; they are not sold on this site.

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

- Webhooks to grant CougarCalc licenses (do not trust the success page alone)
- Live catalog + live client token when taking real money

## MemoryMap (same Paddle account, different site)

Credit products already exist in this sandbox catalog. Sell them from the MemoryMap repo, not here:

| Product | USD | Price ID | Product ID |
| --- | --- | --- | --- |
| MemoryMap — 10 Credits | $10 | `pri_01m246sabkepwkqnnypmyger43` | `pro_01m246sa9x3xapjh1djp2qnpmt` |
| MemoryMap — 3 Credits | $5 | `pri_01m246sa48c91anzhcm7easdf3` | `pro_01m246sa2cdyqv0q68xc90gh05` |
| MemoryMap — 1 Credit | $2 | `pri_01m246s9w36dtncatd7y2hy98w` | `pro_01m246s9t9npapktyyzj5keb4j` |

Paddle’s “build your pricing page and checkout” step is frontend work on each site: initialize Paddle.js with a client-side token, pass those price IDs, open overlay checkout. Optionally create a second client token named for MemoryMap (Paddle allows many). Add MemoryMap domains under **Checkout → Website approval** when leaving localhost.

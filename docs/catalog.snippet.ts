/** CougarCalc sandbox Paddle catalog — price IDs verified via API. */

export type CatalogItem = {
  key: string
  name: string
  usd: number
  priceId: string
  productId: string
}

export const CATALOG: CatalogItem[] = [
  { key: 'suite', name: 'Podcast Suite', usd: 49, priceId: 'pri_01m246sbav8ry19brh1btsx57a', productId: 'pro_01m246sb93ah4twddghms9bh1s' },
  { key: 'leveler', name: 'Lil Leveler', usd: 15, priceId: 'pri_01m246sb2zff9qkk8jwk0asjtt', productId: 'pro_01m246sb19kmbhzkj1whmkgz2x' },
  { key: 'mixer', name: 'Fixer Mixer', usd: 25, priceId: 'pri_01m246savhk6dqjdd394x0rt1w', productId: 'pro_01m246sastw0s462v4wp66svtr' },
  { key: 'stripper', name: 'Podcast Stripper', usd: 25, priceId: 'pri_01m246saknyavnha44a8rb2hfz', productId: 'pro_01m246sahbeyb7162z48d0hkke' },
]

export function getByKey(key: string) {
  return CATALOG.find((i) => i.key === key)
}

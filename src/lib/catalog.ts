/** Sandbox Paddle catalog — price IDs verified via API. */

export type CatalogItem = {
  key: string
  name: string
  usd: number
  priceId: string
  productId: string
  brand: 'cougarcalc' | 'memorymap'
}

export const CATALOG: CatalogItem[] = [
  { key: 'suite', name: 'Podcast Suite', usd: 49, priceId: 'pri_01m246sbav8ry19brh1btsx57a', productId: 'pro_01m246sb93ah4twddghms9bh1s', brand: 'cougarcalc' },
  { key: 'leveler', name: 'Lil Leveler', usd: 15, priceId: 'pri_01m246sb2zff9qkk8jwk0asjtt', productId: 'pro_01m246sb19kmbhzkj1whmkgz2x', brand: 'cougarcalc' },
  { key: 'mixer', name: 'Fixer Mixer', usd: 25, priceId: 'pri_01m246savhk6dqjdd394x0rt1w', productId: 'pro_01m246sastw0s462v4wp66svtr', brand: 'cougarcalc' },
  { key: 'stripper', name: 'Podcast Stripper', usd: 25, priceId: 'pri_01m246saknyavnha44a8rb2hfz', productId: 'pro_01m246sahbeyb7162z48d0hkke', brand: 'cougarcalc' },
  { key: 'mm10', name: 'MemoryMap — 10 Credits', usd: 10, priceId: 'pri_01m246sabkepwkqnnypmyger43', productId: 'pro_01m246sa9x3xapjh1djp2qnpmt', brand: 'memorymap' },
  { key: 'mm3', name: 'MemoryMap — 3 Credits', usd: 5, priceId: 'pri_01m246sa48c91anzhcm7easdf3', productId: 'pro_01m246sa2cdyqv0q68xc90gh05', brand: 'memorymap' },
  { key: 'mm1', name: 'MemoryMap — 1 Credit', usd: 2, priceId: 'pri_01m246s9w36dtncatd7y2hy98w', productId: 'pro_01m246s9t9npapktyyzj5keb4j', brand: 'memorymap' },
]

export const COUGARCALC_PRODUCTS = CATALOG.filter((i) => i.brand === "cougarcalc")
export const MEMORYMAP_PRODUCTS = CATALOG.filter((i) => i.brand === "memorymap")

export function getByKey(key: string) {
  return CATALOG.find((i) => i.key === key)
}


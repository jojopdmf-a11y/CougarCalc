import type { ReactNode } from 'react'

type StubPageProps = {
  title: string
  children: ReactNode
}

export function StubPage({ title, children }: StubPageProps) {
  return (
    <section className="stub">
      <h1>{title}</h1>
      {children}
    </section>
  )
}

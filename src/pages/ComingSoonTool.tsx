export function ComingSoonTool({ hubHref, hubLabel }: { hubHref: string; hubLabel: string }) {
  return (
    <section className="stub">
      <h1>Coming soon</h1>
      <p>This calculator is not available yet.</p>
      <p>
        <a href={hubHref}>{hubLabel}</a>
      </p>
    </section>
  )
}

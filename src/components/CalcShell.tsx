import { Children, cloneElement, isValidElement, type ReactNode } from 'react'
import { useCalcForm } from './useCalcForm.ts'

type WarningKind = 'warn' | 'irreversible'

type CalcShellProps = {
  formId: string
  emptyMessage: string
  warning: string
  warningKind: WarningKind
  bind: (form: HTMLFormElement) => void
  children?: ReactNode
}

function slotName(child: ReactNode): string | undefined {
  if (!isValidElement(child)) return undefined
  const slot = (child.props as { slot?: string }).slot
  return slot
}

/**
 * Shared calculator chrome. Section order around this shell lives in ToolPage.
 * Safety is repeated on the result card. Result type uses --result size, not a second hue.
 */
export default function CalcShell({
  formId,
  emptyMessage,
  warning,
  warningKind,
  bind,
  children,
}: CalcShellProps) {
  const formRef = useCalcForm(bind)
  const warningClass = warningKind === 'irreversible' ? 'safety safety-irreversible' : 'safety safety-warn'
  const main: ReactNode[] = []
  const afterCard: ReactNode[] = []
  const below: ReactNode[] = []

  Children.forEach(children, (child) => {
    const slot = slotName(child)
    if ((slot === 'below' || slot === 'after-card') && isValidElement(child)) {
      const next = cloneElement(child, { slot: undefined } as { slot?: undefined })
      if (slot === 'below') below.push(next)
      else afterCard.push(next)
      return
    }
    main.push(child)
  })

  return (
    <form id={formId} ref={formRef} className="calc-stack" noValidate>
      <div className="calc-panel">
        {main}
        <div className="errors" data-errors hidden role="alert">
          <p>Check these inputs</p>
          <ul data-error-list></ul>
        </div>
      </div>
      <section className="result-card" aria-live="polite">
        <p className="result-eyebrow">Result</p>
        <p className="result-value" data-result-value>
          —
        </p>
        <p className="result-decision" data-decision>
          {emptyMessage}
        </p>
        <ul className="result-extras" data-extras></ul>
        <div className="actions">
          <button className="btn-primary" type="button" data-copy disabled>
            Copy result
          </button>
          <button className="btn-secondary" type="reset" data-reset>
            Reset
          </button>
        </div>
        <p className="copy-status" data-copy-status hidden></p>
        <p className={warningClass}>{warning}</p>
        {afterCard}
      </section>
      {below}
    </form>
  )
}

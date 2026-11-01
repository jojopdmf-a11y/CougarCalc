import { useEffect, useRef } from 'react'

/**
 * Mount an Origin island binder once. Islands own the DOM after this;
 * formulas stay in src/calcs.
 */
export function useCalcForm(bind: (form: HTMLFormElement) => void) {
  const ref = useRef<HTMLFormElement>(null)
  const bound = useRef(false)

  useEffect(() => {
    const form = ref.current
    if (!form || bound.current) return
    bound.current = true
    form.querySelectorAll('template').forEach((node) => {
      const tpl = node as HTMLTemplateElement
      if (tpl.content.childElementCount === 0) {
        while (tpl.firstChild) tpl.content.appendChild(tpl.firstChild)
      }
    })
    bind(form)
  }, [bind])

  return ref
}

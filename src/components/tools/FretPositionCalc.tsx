import { useEffect, useMemo, useState } from 'react'
import {
  computeFretPositions,
  DEFAULT_FRET_COUNT,
  formatFretCopy,
  formatFretTableTsv,
  formatScaleDisplay,
  type ScaleUnit,
} from '../../calc/fret-position.ts'
import { parseFiniteNumber, parseInteger } from '../../calc/parse.ts'
import { FRET_IRREVERSIBLE } from '../../data/toolCopy.ts'

const SCALE_CHIPS = [
  { scale: '25.5', unit: 'in' as ScaleUnit, label: '25.500 in', source: '25.5-in' },
  { scale: '650', unit: 'mm' as ScaleUnit, label: '650 mm', source: '650-mm' },
  { scale: '660', unit: 'mm' as ScaleUnit, label: '660 mm', source: '660-mm' },
]

const N_CHIPS = ['19', '21', '22', '24']

export function FretPositionCalc() {
  const [scale, setScale] = useState('')
  const [scaleUnit, setScaleUnit] = useState<ScaleUnit>('in')
  const [fretCount, setFretCount] = useState(String(DEFAULT_FRET_COUNT))
  const [kerf, setKerf] = useState('')
  const [scaleSource, setScaleSource] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState<string | null>(null)

  useEffect(() => {
    document.body.classList.add('is-fret-page')
    return () => document.body.classList.remove('is-fret-page')
  }, [])

  const computed = useMemo(() => {
    const idle = scale.trim() === ''
    const formErrors: string[] = []
    const scaleRaw = parseFiniteNumber(scale)
    const fretRaw = fretCount.trim() === '' ? { ok: true as const, value: DEFAULT_FRET_COUNT } : parseInteger(fretCount)

    if (idle && fretCount.trim() === '') {
      return { idle: true as const, errors: [] as string[], result: null }
    }

    if (idle) {
      return { idle: true as const, errors: [] as string[], result: null }
    }

    if (!scaleRaw.ok) {
      formErrors.push(scaleRaw.reason === 'empty' ? 'Enter a scale length.' : 'Scale length is not a number.')
    }
    if (!fretRaw.ok) {
      formErrors.push(
        fretRaw.reason === 'empty' ? 'Enter a fret count, or leave 22.' : 'Fret count must be a whole number.',
      )
    }

    if (formErrors.length > 0 || !scaleRaw.ok || !fretRaw.ok) {
      return { idle: false as const, errors: formErrors, result: null }
    }

    const result = computeFretPositions({
      scale: scaleRaw.value,
      scaleUnit,
      fretCount: fretRaw.value,
      outputUnit: scaleUnit,
    })

    if (!result.ok) {
      return { idle: false as const, errors: result.errors.map((e) => e.message), result: null }
    }

    return { idle: false as const, errors: [] as string[], result }
  }, [scale, scaleUnit, fretCount])

  function reset() {
    setScale('')
    setScaleUnit('in')
    setFretCount(String(DEFAULT_FRET_COUNT))
    setKerf('')
    setScaleSource(null)
    setCopyStatus(null)
  }

  async function copyPlain() {
    if (!computed.result) return
    try {
      await navigator.clipboard.writeText(formatFretCopy(computed.result))
      setCopyStatus('Copied result to clipboard.')
    } catch {
      setCopyStatus('Copy failed. Select the table and copy it manually.')
    }
  }

  async function copyTsv() {
    if (!computed.result) return
    try {
      await navigator.clipboard.writeText(formatFretTableTsv(computed.result))
      setCopyStatus('Copied fret table TSV to clipboard.')
    } catch {
      setCopyStatus('Copy failed. Select the table and copy it manually.')
    }
  }

  const unit = computed.result?.scaleUnit ?? scaleUnit
  const twelfthLabel = computed.result ? formatScaleDisplay(computed.result.twelfthFret, unit) : '—'
  const decision = computed.result
    ? computed.result.twelfthEqualsHalf
      ? `d(12) = S/2 · Pass (${formatScaleDisplay(computed.result.halfScale, unit)} ${unit})`
      : `Check failed · d(12) = ${formatScaleDisplay(computed.result.twelfthFret, unit)} ${unit}; S/2 = ${formatScaleDisplay(computed.result.halfScale, unit)} ${unit}`
    : 'Enter a scale length'

  return (
    <form
      className="calc-stack"
      noValidate
      onSubmit={(e) => e.preventDefault()}
      onReset={(e) => {
        e.preventDefault()
        reset()
      }}
    >
      <div className="calc-panel">
        <fieldset>
          <legend>Scale length</legend>
          <div className="field-row">
            <div className="field">
              <label htmlFor="scale-length">S</label>
              <input
                id="scale-length"
                name="scale"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={scale}
                onChange={(e) => {
                  setScale(e.target.value)
                  setScaleSource(null)
                }}
              />
            </div>
            <div className="field">
              <label htmlFor="scale-unit">Unit</label>
              <select
                id="scale-unit"
                name="scaleUnit"
                value={scaleUnit}
                onChange={(e) => setScaleUnit(e.target.value === 'mm' ? 'mm' : 'in')}
              >
                <option value="in">in</option>
                <option value="mm">mm</option>
              </select>
            </div>
          </div>
          <div className="chips" role="group" aria-label="Scale presets">
            {SCALE_CHIPS.map((chip) => (
              <button
                key={chip.source}
                type="button"
                className="chip"
                aria-pressed={scaleSource === chip.source}
                onClick={() => {
                  setScale(chip.scale)
                  setScaleUnit(chip.unit)
                  setScaleSource(chip.source)
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <p className="hint">
            Chips cite published common scales. 650 mm is not 25.5 in (25.500 × 25.4 = 647.7 mm).
            {scaleSource ? ` Active chip: ${scaleSource}.` : null}
          </p>
        </fieldset>

        <fieldset>
          <legend>Fret count N</legend>
          <div className="field">
            <label htmlFor="fret-count">Frets</label>
            <input
              id="fret-count"
              name="fretCount"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={fretCount}
              onChange={(e) => setFretCount(e.target.value)}
            />
            <p className="hint">Default 22.</p>
          </div>
          <div className="chips" role="group" aria-label="Fret count presets">
            {N_CHIPS.map((n) => (
              <button key={n} type="button" className="chip" aria-pressed={fretCount === n} onClick={() => setFretCount(n)}>
                {n}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Datum</legend>
          <div className="radios">
            <label>
              <input type="radio" name="datum" value="nut" defaultChecked /> Nut face
            </label>
            <label>
              <input type="radio" name="datum" value="zero-fret" disabled /> Zero fret (not in this prototype)
            </label>
          </div>
          <p className="hint">Distances are from the nut face. Zero-fret datum shift is not implemented here.</p>
        </fieldset>

        <details className="drawer">
          <summary>Kerf (empty = none)</summary>
          <div className="field">
            <label htmlFor="kerf">Saw kerf</label>
            <input
              id="kerf"
              name="kerf"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={kerf}
              onChange={(e) => setKerf(e.target.value)}
            />
          </div>
          <p className="hint">No spec default. Slot center = d(n). This tool does not invent a universal kerf clearance.</p>
        </details>

        <details className="drawer">
          <summary>Fan / multi-scale</summary>
          <p>Fan table not in this prototype. Parallel 12-TET only. SVG/DXF export is not in this prototype.</p>
        </details>

        {computed.errors.length > 0 ? (
          <div className="errors" role="alert">
            <p>Check these inputs</p>
            <ul>
              {computed.errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <section className="result-card" aria-live="polite">
        <p className="result-eyebrow">Result</p>
        <p className="result-value">
          {computed.result ? twelfthLabel : '—'}
          {computed.result ? <span className="result-unit">{unit}</span> : null}
        </p>
        <p className={`result-decision${computed.result ? (computed.result.twelfthEqualsHalf ? ' check-pass' : ' check-fail') : ''}`}>
          {decision}
        </p>
        {computed.result ? (
          <ul className="result-extras">
            <li>
              {formatScaleDisplay(computed.result.scale, unit)} {unit} scale · {computed.result.fretCount} frets · 12-TET from nut
            </li>
            {kerf.trim() ? <li>Kerf recorded: {kerf.trim()} (does not shift d(n))</li> : null}
          </ul>
        ) : null}
        <div className="actions">
          <button className="btn-primary" type="button" disabled={!computed.result} onClick={copyPlain}>
            Copy result
          </button>
          <button className="btn-secondary" type="button" disabled={!computed.result} onClick={copyTsv}>
            Copy table TSV
          </button>
          <button className="btn-secondary" type="reset">
            Reset
          </button>
        </div>
        {copyStatus ? <p className="copy-status">{copyStatus}</p> : null}
        <p className="safety safety-irreversible">{FRET_IRREVERSIBLE}</p>
      </section>

      <div className="table-wrap">
        <table>
          <caption className="visually-hidden">Fret distances from the nut</caption>
          <thead>
            <tr>
              <th scope="col">Fret</th>
              <th scope="col">From nut</th>
              <th scope="col">Fret to fret</th>
            </tr>
          </thead>
          <tbody>
            {computed.result
              ? computed.result.rows.map((row) => (
                  <tr key={row.fret} className={row.fret === 12 ? 'fret-12' : undefined}>
                    <th scope="row">{row.fret}</th>
                    <td>{formatScaleDisplay(row.distanceFromNut, unit)}</td>
                    <td>{formatScaleDisplay(row.fretToFret, unit)}</td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      <div className="print-preview">
        <p className="print-warning">Confirm nut, 12th, and last against a steel rule. Do not saw from an unscaled print.</p>
        <p className="hint print-only">Print uses white paper tokens. Printers are not CAM (Mottola).</p>
        <p className="mono">
          {computed.result
            ? `${formatScaleDisplay(computed.result.scale, unit)} ${unit} · d(12) ${twelfthLabel} ${unit}`
            : 'Enter a scale to preview marks.'}
        </p>
        <div className="scale-bars">
          <div className="scale-bar scale-bar-100mm">100 mm</div>
          <div className="scale-bar scale-bar-in">1 in</div>
        </div>
        <div className="fretboard" aria-hidden="true">
          <span className="fret-mark nut" style={{ left: 0 }} />
          {computed.result
            ? computed.result.rows.map((row) => (
                <span
                  key={row.fret}
                  className={`fret-mark${row.fret === 12 ? ' twelfth' : ''}`}
                  style={{ left: `${(row.distanceFromNut / computed.result!.scale) * 100}%` }}
                />
              ))
            : null}
        </div>
      </div>
    </form>
  )
}

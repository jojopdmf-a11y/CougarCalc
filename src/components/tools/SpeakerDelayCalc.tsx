import { useMemo, useState } from 'react'
import { formatSamples, formatSpeed, unitLabel } from '../../calc/format.ts'
import { parseFiniteNumber, parseOptionalFiniteNumber } from '../../calc/parse.ts'
import {
  computeSpeakerDelay,
  equivalentDistanceIn,
  formatDelayCopy,
  formatDelayMsDisplay,
  HAAS_SUGGESTION_MS,
  SAMPLE_RATES,
  type FillType,
  type DelayChannel,
} from '../../calc/speaker-delay.ts'
import type { LengthUnit, TemperatureUnit } from '../../calc/units.ts'
import { DELAY_SAFETY } from '../../data/toolCopy.ts'

const FILL_TYPES: { value: FillType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'front-fill', label: 'Front fill' },
  { value: 'underbalcony', label: 'Underbalcony' },
  { value: 'delay-tower', label: 'Delay tower' },
]

function asLengthUnit(value: string): LengthUnit {
  if (value === 'ft' || value === 'in' || value === 'm') return value
  return 'm'
}

function asTempUnit(value: string): TemperatureUnit {
  return value === 'F' ? 'F' : 'C'
}

function asSampleRate(value: string): number {
  const n = Number(value)
  return (SAMPLE_RATES as readonly number[]).includes(n) ? n : 48000
}

const defaults = {
  pathA: '',
  pathB: '',
  lengthUnit: 'm' as LengthUnit,
  temperature: '20',
  temperatureUnit: 'C' as TemperatureUnit,
  fillType: 'none' as FillType,
  haasMs: '0',
  latencyA: '',
  latencyB: '',
  sampleRate: '48000',
}

export function SpeakerDelayCalc() {
  const [pathA, setPathA] = useState(defaults.pathA)
  const [pathB, setPathB] = useState(defaults.pathB)
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>(defaults.lengthUnit)
  const [temperature, setTemperature] = useState(defaults.temperature)
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>(defaults.temperatureUnit)
  const [fillType, setFillType] = useState<FillType>(defaults.fillType)
  const [haasMs, setHaasMs] = useState(defaults.haasMs)
  const [latencyA, setLatencyA] = useState(defaults.latencyA)
  const [latencyB, setLatencyB] = useState(defaults.latencyB)
  const [sampleRate, setSampleRate] = useState(defaults.sampleRate)
  const [copyStatus, setCopyStatus] = useState<string | null>(null)

  const computed = useMemo(() => {
    const idle = pathA.trim() === '' && pathB.trim() === ''
    const formErrors: string[] = []
    const pathARaw = parseFiniteNumber(pathA)
    const pathBRaw = parseFiniteNumber(pathB)
    const tempRaw = parseFiniteNumber(temperature)
    const haasRaw = parseFiniteNumber(haasMs)
    const latARaw = parseOptionalFiniteNumber(latencyA)
    const latBRaw = parseOptionalFiniteNumber(latencyB)

    if (idle) {
      return { idle: true as const, errors: [] as string[], result: null }
    }

    if (!pathARaw.ok) {
      formErrors.push(pathARaw.reason === 'empty' ? 'Enter path A.' : 'Path A is not a number.')
    }
    if (!pathBRaw.ok) {
      formErrors.push(pathBRaw.reason === 'empty' ? 'Enter path B.' : 'Path B is not a number.')
    }
    if (!tempRaw.ok) {
      formErrors.push(tempRaw.reason === 'empty' ? 'Enter a temperature.' : 'Temperature is not a number.')
    }
    if (!haasRaw.ok) {
      formErrors.push(haasRaw.reason === 'empty' ? 'Enter Haas extra, or 0.' : 'Haas extra is not a number.')
    }
    if (!latARaw.ok) formErrors.push('Path A latency is not a number.')
    if (!latBRaw.ok) formErrors.push('Path B latency is not a number.')

    if (formErrors.length > 0 || !pathARaw.ok || !pathBRaw.ok || !tempRaw.ok || !haasRaw.ok || !latARaw.ok || !latBRaw.ok) {
      return { idle: false as const, errors: formErrors, result: null }
    }

    const result = computeSpeakerDelay({
      pathA: pathARaw.value,
      pathB: pathBRaw.value,
      lengthUnit,
      temperature: tempRaw.value,
      temperatureUnit,
      haasMs: haasRaw.value,
      latencyAMs: latARaw.value ?? 0,
      latencyBMs: latBRaw.value ?? 0,
      sampleRate: asSampleRate(sampleRate),
    })

    if (!result.ok) {
      return { idle: false as const, errors: result.errors.map((e) => e.message), result: null }
    }

    return { idle: false as const, errors: [] as string[], result }
  }, [pathA, pathB, lengthUnit, temperature, temperatureUnit, haasMs, latencyA, latencyB, sampleRate])

  function onFillChange(next: FillType) {
    setFillType(next)
    setHaasMs(String(HAAS_SUGGESTION_MS[next]))
  }

  function reset() {
    setPathA(defaults.pathA)
    setPathB(defaults.pathB)
    setLengthUnit(defaults.lengthUnit)
    setTemperature(defaults.temperature)
    setTemperatureUnit(defaults.temperatureUnit)
    setFillType(defaults.fillType)
    setHaasMs(defaults.haasMs)
    setLatencyA(defaults.latencyA)
    setLatencyB(defaults.latencyB)
    setSampleRate(defaults.sampleRate)
    setCopyStatus(null)
  }

  async function copyResult() {
    if (!computed.result) return
    try {
      await navigator.clipboard.writeText(formatDelayCopy(computed.result))
      setCopyStatus('Copied result to clipboard.')
    } catch {
      setCopyStatus('Copy failed. Select the result and copy it manually.')
    }
  }

  const extras = computed.result
    ? buildExtras(computed.result, lengthUnit, asSampleRate(sampleRate))
    : []

  const cLine = computed.result
    ? `${formatSpeed(computed.result.c_m_s)} m/s  =  331.3 + 0.6 × ${computed.result.temperatureC}  (Sengpiel simplified)`
    : 'Enter paths and temperature to see c.'

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
          <legend>Two paths to the seat</legend>
          <p className="hint">Acoustic path lengths to one seat. This is not cabinet spacing.</p>
          <div className="field">
            <label htmlFor="path-a">Path A</label>
            <input
              id="path-a"
              name="pathA"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={pathA}
              onChange={(e) => setPathA(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="path-b">Path B</label>
            <input
              id="path-b"
              name="pathB"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={pathB}
              onChange={(e) => setPathB(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="path-unit">Length unit</label>
            <select
              id="path-unit"
              name="lengthUnit"
              value={lengthUnit}
              onChange={(e) => setLengthUnit(asLengthUnit(e.target.value))}
            >
              <option value="m">m</option>
              <option value="ft">ft</option>
              <option value="in">in</option>
            </select>
          </div>
        </fieldset>

        <fieldset>
          <legend>Air</legend>
          <div className="field-row">
            <div className="field">
              <label htmlFor="temperature">Temperature</label>
              <input
                id="temperature"
                name="temperature"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
              <p className="hint">Default 20 °C / 68 °F. Not a reading.</p>
            </div>
            <div className="field">
              <label htmlFor="temperature-unit">Unit</label>
              <select
                id="temperature-unit"
                name="temperatureUnit"
                value={temperatureUnit}
                onChange={(e) => setTemperatureUnit(asTempUnit(e.target.value))}
              >
                <option value="C">°C</option>
                <option value="F">°F</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Fill type and Haas extra</legend>
          <div className="radios">
            {FILL_TYPES.map((fill) => (
              <label key={fill.value}>
                <input
                  type="radio"
                  name="fill-type"
                  value={fill.value}
                  checked={fillType === fill.value}
                  onChange={() => onFillChange(fill.value)}
                />{' '}
                {fill.label}
              </label>
            ))}
          </div>
          <div className="field">
            <label htmlFor="haas-ms">Haas extra (ms)</label>
            <input
              id="haas-ms"
              name="haasMs"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={haasMs}
              onChange={(e) => setHaasMs(e.target.value)}
            />
            <p className="hint">
              Starting offset, not a law. Suggestions: none 0, front fill 8, underbalcony 10, delay tower 15.
              Cited practice ranges: QSC 10–20 ms; SonaVyx front 5–10 ms, towers 10–20 ms.
            </p>
          </div>
        </fieldset>

        <details className="drawer">
          <summary>Existing latency (empty = 0 ms)</summary>
          <div className="field">
            <label htmlFor="latency-a">Path A latency (ms)</label>
            <input
              id="latency-a"
              name="latencyA"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={latencyA}
              onChange={(e) => setLatencyA(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="latency-b">Path B latency (ms)</label>
            <input
              id="latency-b"
              name="latencyB"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={latencyB}
              onChange={(e) => setLatencyB(e.target.value)}
            />
          </div>
          <p className="hint">DSP, network, and speaker processing already on that channel.</p>
        </details>

        <div className="field">
          <label htmlFor="sample-rate">Sample rate</label>
          <select id="sample-rate" name="sampleRate" value={sampleRate} onChange={(e) => setSampleRate(e.target.value)}>
            <option value="44100">44.1 kHz</option>
            <option value="48000">48 kHz</option>
            <option value="96000">96 kHz</option>
          </select>
        </div>

        <details className="drawer">
          <summary>Speed of sound c (read-only)</summary>
          <p className="mono">{cLine}</p>
          <p className="hint">c = 331.3 + 0.6 × T_C m/s (Sengpiel simplified). Humidity is ignored. No slider.</p>
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
          {computed.result ? formatDelayMsDisplay(computed.result.t_set) : '—'}
          {computed.result ? <span className="result-unit">ms</span> : null}
        </p>
        <p className="result-decision">
          {computed.result ? computed.result.delayChannelLabel : 'Enter both paths'}
        </p>
        {extras.length > 0 ? (
          <ul className="result-extras">
            {extras.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        ) : null}
        <div className="actions">
          <button className="btn-primary" type="button" onClick={copyResult} disabled={!computed.result}>
            Copy result
          </button>
          <button className="btn-secondary" type="reset">
            Reset
          </button>
        </div>
        {copyStatus ? <p className="copy-status">{copyStatus}</p> : null}
        <p className="safety safety-warn">{DELAY_SAFETY}</p>
      </section>
    </form>
  )
}

function buildExtras(
  result: {
    delay_ms: number
    haasMs: number
    fartherPath: DelayChannel
    pathDifference_m: number
    c_m_s: number
    samples: number | null
    latencyOvershoot: boolean
    overshootMs: number
  },
  lengthUnit: LengthUnit,
  sampleRate: number,
): string[] {
  const eq = equivalentDistanceIn(result.pathDifference_m, lengthUnit)
  const extras = [
    `Geometric ${formatDelayMsDisplay(result.delay_ms)} ms`,
    result.haasMs === 0
      ? 'Haas extra 0 ms'
      : `Haas extra ${Number.isInteger(result.haasMs) ? String(result.haasMs) : formatDelayMsDisplay(result.haasMs)} ms`,
    result.fartherPath === 'none' ? 'Paths are the same length' : `Farther path is path ${result.fartherPath}`,
    `Path difference ${eq.toFixed(3)} ${unitLabel(lengthUnit)}`,
    `c = ${formatSpeed(result.c_m_s)} m/s`,
    `Samples ${formatSamples(result.samples ?? 0)} at ${sampleRate} Hz (full precision)`,
  ]
  if (result.latencyOvershoot) {
    extras.unshift(
      `Existing latency overshoots geometry by ${formatDelayMsDisplay(result.overshootMs)} ms; no geometric delay added.`,
    )
  }
  return extras
}

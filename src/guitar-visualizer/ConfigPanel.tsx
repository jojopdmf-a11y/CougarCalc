import type { ConfigState } from './types'
import { isOptionEnabled } from './types'

type SectionId =
  | 'instrument'
  | 'body'
  | 'hand'
  | 'finish'
  | 'hardware'
  | 'pickups'
  | 'neck'
  | 'inlays'
  | 'extras'

type ConfigPanelProps = {
  config: ConfigState
  onChange: (patch: Partial<ConfigState>) => void
  openSection: SectionId | null
  onToggleSection: (id: SectionId) => void
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
  checklist: string[]
}

const SECTIONS: { id: SectionId; title: string; later?: boolean }[] = [
  { id: 'instrument', title: 'Instrument' },
  { id: 'body', title: 'Body shape' },
  { id: 'hand', title: 'Right / Left hand' },
  { id: 'finish', title: 'Body finish' },
  { id: 'hardware', title: 'Hardware' },
  { id: 'pickups', title: 'Pickups / electronics' },
  { id: 'neck', title: 'Neck & headstock' },
  { id: 'inlays', title: 'Inlays & cosmetics', later: true },
  { id: 'extras', title: 'Extras (optional)', later: true },
]

export function ConfigPanel({
  config,
  onChange,
  openSection,
  onToggleSection,
  mobileOpen,
  onMobileOpenChange,
  checklist,
}: ConfigPanelProps) {
  return (
    <>
      <button
        type="button"
        className="gv-sheet-toggle"
        aria-expanded={mobileOpen}
        onClick={() => onMobileOpenChange(!mobileOpen)}
      >
        {mobileOpen ? 'Hide options' : 'Configure'}
      </button>

      <aside className={`gv-panel ${mobileOpen ? 'is-open' : ''}`} aria-label="Guitar configuration">
        <p className="gv-panel-note">Textures are illustrative — proportions are approximate, not a build sheet.</p>

        <label className="gv-toggle-row">
          <input
            type="checkbox"
            checked={config.highlightChanges}
            onChange={(e) => onChange({ highlightChanges: e.target.checked })}
          />
          Highlight changes
        </label>

        <div className="gv-accordion">
          {SECTIONS.map((section) => {
            const open = openSection === section.id
            return (
              <div key={section.id} className="gv-acc-item">
                <button
                  type="button"
                  className="gv-acc-trigger"
                  aria-expanded={open}
                  onClick={() => onToggleSection(section.id)}
                >
                  <span>{section.title}</span>
                  <span className="gv-acc-mark">{open ? '−' : '+'}</span>
                </button>
                {open && (
                  <div className="gv-acc-body">
                    {section.later ? (
                      <p className="gv-later">Skeleton step — fills in a later build.</p>
                    ) : (
                      <SectionOptions
                        id={section.id}
                        config={config}
                        onChange={onChange}
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="gv-checklist">
          <h2>Configuration summary</h2>
          <ul>
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  )
}

function SectionOptions({
  id,
  config,
  onChange,
}: {
  id: SectionId
  config: ConfigState
  onChange: (patch: Partial<ConfigState>) => void
}) {
  if (id === 'instrument') {
    return (
      <OptionGroup
        name="instrument"
        value={config.instrument}
        options={[
          { value: 'guitar', label: 'Electric 6-string' },
          { value: 'bass', label: 'Electric 4-string bass (later)' },
        ]}
        config={config}
        field="instrument"
        onPick={(value) => onChange({ instrument: value as ConfigState['instrument'] })}
      />
    )
  }
  if (id === 'body') {
    return (
      <OptionGroup
        name="body"
        value={config.bodyShape}
        options={[
          { value: 'double-cut', label: 'Double-cut / Strat-style' },
          { value: 'single-cut', label: 'Single-cut (placeholder)' },
          { value: 'offset', label: 'Offset (placeholder)' },
        ]}
        config={config}
        field="bodyShape"
        onPick={(value) => onChange({ bodyShape: value as ConfigState['bodyShape'] })}
      />
    )
  }
  if (id === 'neck') {
    return (
      <div className="gv-options" role="group" aria-label="neck">
        <p className="gv-later" style={{ margin: 0 }}>
          Shape set 1: bolt-on neck with a <strong>6-inline headstock</strong> (tuners on one side). More
          headstock styles come later.
        </p>
      </div>
    )
  }
  if (id === 'hand') {
    return (
      <OptionGroup
        name="hand"
        value={config.handedness}
        options={[
          { value: 'right', label: 'Right-handed' },
          { value: 'left', label: 'Left-handed (later)' },
        ]}
        config={config}
        field="handedness"
        onPick={(value) => onChange({ handedness: value as ConfigState['handedness'] })}
      />
    )
  }
  if (id === 'finish') {
    return (
      <OptionGroup
        name="finish"
        value={config.bodyFinish}
        options={[
          { value: 'black', label: 'Black' },
          { value: 'sunburst', label: 'Sunburst' },
          { value: 'natural', label: 'Natural' },
          { value: 'racing-green', label: 'Racing green' },
          { value: 'olympic-white', label: 'Olympic white' },
        ]}
        config={config}
        field="bodyFinish"
        onPick={(value) => onChange({ bodyFinish: value as ConfigState['bodyFinish'] })}
      />
    )
  }
  if (id === 'hardware') {
    return (
      <OptionGroup
        name="hardware"
        value={config.hardware}
        options={[
          { value: 'chrome', label: 'Chrome' },
          { value: 'black', label: 'Black' },
          { value: 'gold', label: 'Gold' },
        ]}
        config={config}
        field="hardware"
        onPick={(value) => onChange({ hardware: value as ConfigState['hardware'] })}
      />
    )
  }
  if (id === 'pickups') {
    return (
      <OptionGroup
        name="pickups"
        value={config.pickupLayout}
        options={[
          { value: 'S/S', label: 'S / S' },
          { value: 'H/S/H', label: 'H / S / H' },
          { value: 'H/H', label: 'H / H' },
        ]}
        config={config}
        field="pickupLayout"
        onPick={(value) => onChange({ pickupLayout: value as ConfigState['pickupLayout'] })}
      />
    )
  }
  return null
}

function OptionGroup({
  name,
  value,
  options,
  config,
  field,
  onPick,
}: {
  name: string
  value: string
  options: { value: string; label: string }[]
  config: ConfigState
  field: keyof ConfigState
  onPick: (value: string) => void
}) {
  return (
    <div className="gv-options" role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const enabled = isOptionEnabled(field, opt.value, config)
        return (
          <label key={opt.value} className={`gv-option ${enabled ? '' : 'is-disabled'}`}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              disabled={!enabled}
              onChange={() => onPick(opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        )
      })}
    </div>
  )
}

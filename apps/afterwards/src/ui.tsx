import { useId, type ReactNode } from 'react'

export function Logo() {
  // A marigold: the flower of remembrance.
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse key={i} cx="16" cy="7.5" rx="4.2" ry="6.5" fill={i % 2 ? '#dc8419' : '#f0a63a'} transform={`rotate(${i * 36} 16 16)`} />
      ))}
      <circle cx="16" cy="16" r="4.6" fill="#a85a08" />
    </svg>
  )
}

type TextProps = {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  hint?: string
  placeholder?: string
  w?: 2 | 3 | 4 | 6
  inputMode?: 'numeric' | 'tel' | 'email' | 'text'
}

export function Text({ label, value, onChange, type = 'text', hint, placeholder, w = 3, inputMode }: TextProps) {
  const id = useId()
  return (
    <div className={`f w${w}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={value} placeholder={placeholder} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} />
      {hint && <small>{hint}</small>}
    </div>
  )
}

// A bare input for table cells; the column heading is its label.
export function Cell({ label, value, onChange, type = 'text', inputMode }: Omit<TextProps, 'w' | 'hint'>) {
  return <input aria-label={label} placeholder={label} type={type} value={value} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} />
}

type ChoiceProps<T extends string> = {
  label: string
  value: T | ''
  options: { v: T; l: string }[]
  onChange: (v: T) => void
  hint?: string
  w?: 3 | 6
}

export function Choice<T extends string>({ label, value, options, onChange, hint, w = 6 }: ChoiceProps<T>) {
  const name = useId()
  return (
    <fieldset className={`f w${w}`} style={{ border: 0, padding: 0, margin: 0 }}>
      <legend className="label" style={{ padding: 0, marginBottom: 6, fontSize: 14, fontWeight: 600 }}>{label}</legend>
      <div className="seg">
        {options.map((o) => (
          <label key={o.v}>
            <input type="radio" name={name} checked={value === o.v} onChange={() => onChange(o.v)} />
            <span>{o.l}</span>
          </label>
        ))}
      </div>
      {hint && <small>{hint}</small>}
    </fieldset>
  )
}

export function Head({ title, children }: { title: string; children: ReactNode }) {
  return (
    <header className="head">
      <h1>{title}</h1>
      <p>{children}</p>
    </header>
  )
}

export const YESNO = [
  { v: 'yes' as const, l: 'Yes' },
  { v: 'no' as const, l: 'No' },
]

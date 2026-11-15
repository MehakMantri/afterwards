import { useId, type ReactNode } from 'react'
import { nonLatin } from './pdf'

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

// The printed forms can only carry English letters, so say so at the field instead of dropping text later.
const SCRIPT_WARNING = 'Please type this in English letters. The printed forms cannot carry other scripts, so this would come out blank.'

export function Text({ label, value, onChange, type = 'text', hint, placeholder, w = 3, inputMode }: TextProps) {
  const id = useId()
  const bad = nonLatin(value)
  return (
    <div className={`f w${w}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={value} placeholder={placeholder} inputMode={inputMode} aria-invalid={bad || undefined} aria-describedby={bad ? `${id}-w` : undefined} onChange={(e) => onChange(e.target.value)} />
      {bad && (
        <small id={`${id}-w`} className="err" role="alert">
          {SCRIPT_WARNING}
        </small>
      )}
      {hint && <small>{hint}</small>}
    </div>
  )
}

// A bare input for table cells; the column heading is its label.
export function Cell({ label, value, onChange, type = 'text', inputMode }: Omit<TextProps, 'w' | 'hint'>) {
  return <input aria-label={label} placeholder={label} type={type} value={value} inputMode={inputMode} aria-invalid={nonLatin(value) || undefined} onChange={(e) => onChange(e.target.value)} />
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

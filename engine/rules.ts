// Rule evaluator. Knows nothing about any institution: a rulebook is data.
// First matching rule wins; the last rule of a rulebook should have no conditions.

export type Cond = string | number | boolean | { lte?: number; gt?: number }

export type Rule = {
  id: string
  when: Record<string, Cond>
  title: string
  explain: string
  forms: string[]
  documents: string[]
  lawyer?: string
  source: { title: string; para: string; url: string; date: string }
}

export type Facts = Record<string, string | number | boolean | undefined>

function holds(cond: Cond, value: Facts[string]): boolean {
  if (typeof cond !== 'object') return value === cond
  if (typeof value !== 'number' || Number.isNaN(value)) return false
  return (cond.lte === undefined || value <= cond.lte) && (cond.gt === undefined || value > cond.gt)
}

export function matches(rule: Rule, facts: Facts): boolean {
  return Object.entries(rule.when).every(([k, c]) => holds(c, facts[k]))
}

export function evaluate(rules: Rule[], facts: Facts): Rule | undefined {
  return rules.find((r) => matches(r, facts))
}

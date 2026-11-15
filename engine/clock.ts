// Calendar-day arithmetic for deadlines. Dates are ISO strings (yyyy-mm-dd), compared at UTC midnight
// so a daylight-saving change or the time of day never moves a deadline.

const DAY = 86400000
const midnight = (iso: string) => Date.parse(iso.slice(0, 10) + 'T00:00:00Z')

export const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Whole days from `from` to `to`. Never negative: a date in the future counts as day zero.
export function daysBetween(from: string, to: string): number {
  const n = Math.round((midnight(to) - midnight(from)) / DAY)
  return Number.isFinite(n) ? Math.max(0, n) : 0
}

export function addDays(iso: string, days: number): string {
  return new Date(midnight(iso) + days * DAY).toISOString().slice(0, 10)
}

// Where a deadline stands: `left` days remaining (0 on the last day), and `late` once it has passed.
export function deadline(startedOn: string, days: number, now = today()) {
  const elapsed = daysBetween(startedOn, now)
  return { due: addDays(startedOn, days), elapsed, left: Math.max(0, days - elapsed), late: elapsed > days, overdueBy: Math.max(0, elapsed - days) }
}

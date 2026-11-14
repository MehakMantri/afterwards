export const inr = (n: number) => '₹' + Math.round(n || 0).toLocaleString('en-IN')

// 2026-11-14 -> 14/11/2026
export const dmy = (iso?: string) =>
  iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso.slice(0, 10).split('-').reverse().join('/') : iso || ''

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
const two = (n: number) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : ''))
const three = (n: number) =>
  n >= 100 ? ONES[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + two(n % 100) : '') : two(n)

// Indian numbering: crore, lakh, thousand. Whole rupees, below 100 crore.
export function rupeesInWords(amount: number): string {
  const n = Math.round(amount || 0)
  if (n <= 0 || n >= 1e9) return ''
  const parts: string[] = []
  const crore = Math.floor(n / 1e7)
  const lakh = Math.floor(n / 1e5) % 100
  const thousand = Math.floor(n / 1e3) % 100
  const rest = n % 1000
  if (crore) parts.push(two(crore) + ' Crore')
  if (lakh) parts.push(two(lakh) + ' Lakh')
  if (thousand) parts.push(two(thousand) + ' Thousand')
  if (rest) parts.push(three(rest))
  return parts.join(' ') + ' Only'
}

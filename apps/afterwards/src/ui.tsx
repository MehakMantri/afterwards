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

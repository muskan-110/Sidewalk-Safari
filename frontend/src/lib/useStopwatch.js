import { useEffect, useState } from 'react'

// Computed from wall-clock time so it stays right if the phone screen locks.
export function useStopwatch(startedAt) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return Math.max(0, Math.floor((now - startedAt) / 1000))
}

export const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
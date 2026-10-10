export async function fetchMissions(settings, signal) {
  const res = await fetch('/api/missions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
    signal,
  })
  if (!res.ok) throw new Error(`The Safari server returned an error (${res.status}).`)
  const data = await res.json()
  if (!data || !Array.isArray(data.missions) || data.missions.length === 0) {
    throw new Error('The Safari server sent back something unexpected.')
  }
  return data
}
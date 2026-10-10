import { useEffect, useState } from 'react'

const TIPS = [
  'Once your missions appear, tap Pocket Mode and put your phone away.',
  'Safari rules: eyes and ears only, stay on paths, leave everything where it is.',
  'Look up. Look down. Then look closer.',
  'Your missions are written by an AI model running on your own computer.',
  'Small things count: a nibbled leaf, a patch of moss, a shadow.',
]

export default function Loading({ onCancel }) {
  const [sec, setSec] = useState(0)

  useEffect(() => {
    const t0 = Date.now()
    const id = setInterval(() => setSec(Math.floor((Date.now() - t0) / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  const tip = TIPS[Math.floor(sec / 6) % TIPS.length]

  return (
    <section className="loading text-center">
      <div className="footsteps" aria-hidden="true">
        <span>👣</span>
        <span>👣</span>
        <span>👣</span>
      </div>
      <h1 className="display h2" role="status">Scouting your safari…</h1>
      <p className="mb-1">Your computer is writing three missions. This can take up to a minute.</p>
      <p className="mins">{sec}s</p>
      <p className="tip">💡 {tip}</p>
      <button type="button" className="btn-game ghost small mt-3" onClick={onCancel}>
        Cancel
      </button>
    </section>
  )
}
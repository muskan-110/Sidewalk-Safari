import { useEffect, useState } from 'react'
import { Clock, Flag, Leaf, Smartphone } from 'lucide-react'
import MissionCard from '../components/MissionCard'
import { fmt, useStopwatch } from '../lib/useStopwatch'

export default function Active({ pack, done, startedAt, onToggle, onFinish }) {
  const elapsed = useStopwatch(startedAt)
  const [pocket, setPocket] = useState(false)
  const total = pack.missions.length
  const count = done.filter(Boolean).length
  const all = count === total

  useEffect(() => {
    if (!pocket) return
    const onKey = (e) => e.key === 'Escape' && setPocket(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pocket])

  return (
    <section>
      <div className="topbar">
        <span className="pill">
          <Clock size={18} aria-hidden="true" /> {fmt(elapsed)}
        </span>
        <button type="button" className="btn-game ghost small" onClick={() => setPocket(true)}>
          <Smartphone size={18} aria-hidden="true" /> Pocket Mode
        </button>
      </div>

      {pack.source === 'ai' ? (
        <p className="banner">
          💻 Missions written on your own device by <strong>{pack.model}</strong>.
        </p>
      ) : (
        <p className="banner warn">
          ⚠️ {pack.notice} These missions are not AI-generated.
        </p>
      )}

      <div className="progress-wrap">
        <div className="slots" aria-hidden="true">
          {done.map((d, i) => (
            <span key={i} className={`slot ${d ? 'filled' : ''}`}>
              <Leaf size={22} />
            </span>
          ))}
        </div>
        <p className="progress-text" aria-live="polite">
          {count} of {total} found
        </p>
      </div>

      {pack.missions.map((m, i) => (
        <MissionCard key={i} mission={m} index={i} done={done[i]} onToggle={() => onToggle(i)} />
      ))}

      <div className="text-center mt-4">
        <button type="button" className={`btn-game ${all ? 'acorn big' : 'ghost'}`} onClick={onFinish}>
          <Flag size={22} aria-hidden="true" /> {all ? 'Finish Safari' : 'End safari early'}
        </button>
      </div>

      {pocket && (
        <div className="pocket" role="dialog" aria-modal="true" aria-label="Pocket mode">
          <p className="pocket-line">
            Phone in your pocket.
            <br />
            Go find your missions.
          </p>
          <p className="pocket-time">{fmt(elapsed)}</p>
          <button type="button" className="btn-game acorn" autoFocus onClick={() => setPocket(false)}>
            I'm back
          </button>
        </div>
      )}
    </section>
  )
}
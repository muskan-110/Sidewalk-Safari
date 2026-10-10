import { useState } from 'react'
import { Check, Clock, Lightbulb, RotateCcw, Sparkles } from 'lucide-react'

export default function MissionCard({ mission, index, done, onToggle }) {
  const [open, setOpen] = useState(false)

  return (
    <article className={`quest ${done ? 'done' : ''}`}>
      {done && <span className="stamp" aria-hidden="true">FOUND!</span>}

      <header className="d-flex align-items-center gap-3 mb-2">
        <span className="quest-num" aria-hidden="true">{index + 1}</span>
        <div>
          <h2 className="h4 mb-0">
            <span className="visually-hidden">Mission {index + 1}: </span>
            {mission.title}
          </h2>
          <span className="mins">
            <Clock size={14} aria-hidden="true" /> about {mission.minutes} min
          </span>
        </div>
      </header>

      <p className="task">{mission.task}</p>

      {open && (
        <div className="hint-box">
          <Lightbulb size={18} aria-hidden="true" /> {mission.hint}
        </div>
      )}

      {done && (
        <p className="field-note">
          <Sparkles size={16} aria-hidden="true" /> <strong>Field note:</strong> {mission.learn}
        </p>
      )}

      <div className="d-flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          className="btn-game ghost small"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <Lightbulb size={18} aria-hidden="true" /> {open ? 'Hide Hint' : 'Reveal Hint'}
        </button>
        <button type="button" className={`btn-game small ${done ? 'ghost' : ''}`} onClick={onToggle}>
          {done ? (
            <>
              <RotateCcw size={18} aria-hidden="true" /> Undo
            </>
          ) : (
            <>
              <Check size={18} aria-hidden="true" /> Mark Complete
            </>
          )}
        </button>
      </div>
    </article>
  )
}
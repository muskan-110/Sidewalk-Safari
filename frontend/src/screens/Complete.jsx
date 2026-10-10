import { useRef, useState } from 'react'
import { BookOpen, RotateCcw, Save } from 'lucide-react'
import { fmt } from '../lib/useStopwatch'
import { saveEntry } from '../lib/storage'

const LEAVES = ['🍃', '🍂', '🌿', '🍁']

function makeConfetti(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    char: LEAVES[i % LEAVES.length],
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    dur: 3 + Math.random() * 2.5,
  }))
}

function draftEntry(missions, done, elapsed) {
  const mins = Math.max(1, Math.round(elapsed / 60))
  const found = missions.filter((_, i) => done[i]).map((m) => m.title)
  const first = `I went on a ${mins}-minute safari.`
  return found.length ? `${first} I found: ${found.join(', ')}.\n\n` : `${first}\n\n`
}

function message(count, total) {
  if (count === total) return 'You noticed everything on your list. The world is more interesting up close.'
  if (count > 0) return 'Nice looking! Every small thing you noticed counts.'
  return "Sometimes a walk is just a walk, and that's fine. Try again whenever you feel curious."
}

export default function Complete({ pack, done, elapsed, settings, onAgain, onHistory }) {
  const { missions } = pack
  const total = missions.length
  const count = done.filter(Boolean).length
  const idRef = useRef(String(Date.now()))
  const [notes, setNotes] = useState(() => missions.map(() => ''))
  const [entry, setEntry] = useState(() => draftEntry(missions, done, elapsed))
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [confetti] = useState(() => makeConfetti(count > 0 ? 18 : 0))

  const discoveries = notes.filter((n, i) => done[i] && n.trim()).length

  const setNote = (i, value) => {
    setNotes((prev) => prev.map((n, j) => (j === i ? value : n)))
    setSaved(false)
  }

  const handleSave = () => {
    const ok = saveEntry({
      id: idRef.current,
      savedAt: new Date().toISOString(),
      settings,
      source: pack.source,
      model: pack.model,
      elapsedSeconds: elapsed,
      completedCount: count,
      total,
      missions: missions.map((m, i) => ({
        title: m.title,
        task: m.task,
        learn: m.learn,
        completed: !!done[i],
        note: notes[i].trim(),
      })),
      entry: entry.trim(),
    })
    setSaved(ok)
    setSaveError(ok ? '' : "Couldn't save in this browser (storage may be blocked).")
  }

  return (
    <section>
      {confetti.length > 0 && (
        <div className="confetti" aria-hidden="true">
          {confetti.map((c) => (
            <span
              key={c.id}
              style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s` }}
            >
              {c.char}
            </span>
          ))}
        </div>
      )}

      <h1 className="display h2 text-center mb-1">Safari complete!</h1>
      <p className="text-center">{message(count, total)}</p>

      <div className="stats my-4">
        <div className="stat">
          <strong>{count}/{total}</strong>
          <span>Missions</span>
        </div>
        <div className="stat">
          <strong>{fmt(elapsed)}</strong>
          <span>Exploring</span>
        </div>
        <div className="stat">
          <strong>{discoveries}</strong>
          <span>Discoveries</span>
        </div>
      </div>

      {count > 0 && (
        <div className="panel mb-4">
          <h2 className="h4">What did you find?</h2>
          <p className="mins">Optional. One line per mission.</p>
          {missions.map(
            (m, i) =>
              done[i] && (
                <div key={i} className="mb-3">
                  <label htmlFor={`note-${i}`} className="fw-bold">{m.title}</label>
                  <input
                    id={`note-${i}`}
                    className="note-input"
                    maxLength={200}
                    value={notes[i]}
                    onChange={(e) => setNote(i, e.target.value)}
                    placeholder="A mossy stone near the bench…"
                  />
                </div>
              ),
          )}
        </div>
      )}

      <div className="panel">
        <label htmlFor="journal" className="display h4 d-block">
          What did you notice today that you would normally have missed?
        </label>
        <textarea
          id="journal"
          className="journal-input"
          value={entry}
          onChange={(e) => {
            setEntry(e.target.value)
            setSaved(false)
          }}
        />
        <div className="d-flex flex-wrap align-items-center gap-3 mt-3">
          <button type="button" className="btn-game" onClick={handleSave} disabled={saved}>
            <Save size={20} aria-hidden="true" /> {saved ? 'Saved' : 'Save My Safari'}
          </button>
          <span role="status" className="mins">
            {saved && 'Saved in this browser.'}
            {saveError}
          </span>
        </div>
      </div>

      <div className="d-flex flex-wrap justify-content-between gap-3 mt-4">
        <button type="button" className="btn-game ghost small" onClick={onHistory}>
          <BookOpen size={18} aria-hidden="true" /> My Field Journal
        </button>
        <button type="button" className="btn-game acorn" onClick={onAgain}>
          <RotateCcw size={20} aria-hidden="true" /> Start another safari
        </button>
      </div>
    </section>
  )
}
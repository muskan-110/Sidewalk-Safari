import { useState } from 'react'
import { ArrowLeft, Backpack, Trash2 } from 'lucide-react'
import { deleteEntry, loadEntries } from '../lib/storage'
import { fmt } from '../lib/useStopwatch'

export default function History({ onBack, onStart }) {
  const [entries, setEntries] = useState(() => loadEntries())

  const remove = (id) => {
    if (window.confirm('Delete this safari from your journal?')) {
      deleteEntry(id)
      setEntries(loadEntries())
    }
  }

  return (
    <section>
      <h1 className="display h2 mb-3">My Field Journal</h1>

      {entries.length === 0 ? (
        <div className="panel text-center">
          <p className="display h4">Nothing here yet</p>
          <p>Your saved safaris will show up here. Go find something small and interesting first.</p>
          <button type="button" className="btn-game acorn" onClick={onStart}>
            <Backpack size={20} aria-hidden="true" /> Start Adventure
          </button>
        </div>
      ) : (
        entries.map((e) => (
          <details key={e.id} className="entry">
            <summary>
              {new Date(e.savedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
              {' · '}
              {e.completedCount}/{e.total} missions · {fmt(e.elapsedSeconds)}
            </summary>
            <div className="pb-3">
              {e.entry && <p style={{ whiteSpace: 'pre-wrap' }}>{e.entry}</p>}
              <ul className="ps-3">
                {e.missions.map((m, i) => (
                  <li key={i}>
                    <strong>{m.completed ? '✓' : '○'} {m.title}</strong>
                    {m.note && <> — {m.note}</>}
                  </li>
                ))}
              </ul>
              <button type="button" className="btn-game ghost small" onClick={() => remove(e.id)}>
                <Trash2 size={16} aria-hidden="true" /> Delete
              </button>
            </div>
          </details>
        ))
      )}

      <div className="mt-4">
        <button type="button" className="btn-game ghost small" onClick={onBack}>
          <ArrowLeft size={18} aria-hidden="true" /> Back
        </button>
      </div>
    </section>
  )
}
import { useState } from 'react'
import { ArrowLeft, Play } from 'lucide-react'
import Choice from '../components/Choice'

const DURATIONS = [
  { id: 5, emoji: '⚡', label: '5 min', sub: 'Quick peek' },
  { id: 10, emoji: '🍃', label: '10 min', sub: 'Classic' },
  { id: 15, emoji: '🌲', label: '15 min', sub: 'Deep dive' },
]
const PLACES = [
  { id: 'campus', emoji: '🏫', label: 'Campus' },
  { id: 'park', emoji: '🌳', label: 'Park / Garden' },
  { id: 'neighborhood', emoji: '🏘️', label: 'Neighborhood' },
  { id: 'anywhere', emoji: '🧭', label: 'Anywhere outside' },
]
const LEVELS = [
  { id: 'easy', emoji: '🌱', label: 'Easy', sub: 'Quick finds' },
  { id: 'curious', emoji: '🔍', label: 'Curious', sub: 'Look closer' },
  { id: 'explorer', emoji: '🥾', label: 'Explorer', sub: 'Be patient' },
]

export default function Setup({ initial, onStart, onBack }) {
  const [s, setS] = useState(initial)
  const set = (key) => (value) => setS((prev) => ({ ...prev, [key]: value }))

  return (
    <section>
      <h1 className="display h2 mb-3">Pack your bag</h1>
      <div className="panel">
        <Choice legend="How long is your walk?" options={DURATIONS} value={s.duration} onChange={set('duration')} />
        <Choice legend="Where are you?" options={PLACES} value={s.surroundings} onChange={set('surroundings')} />
        <Choice legend="How tricky?" options={LEVELS} value={s.difficulty} onChange={set('difficulty')} />
      </div>

      <div className="d-flex flex-wrap justify-content-between gap-3 mt-4">
        <button type="button" className="btn-game ghost small" onClick={onBack}>
          <ArrowLeft size={18} aria-hidden="true" /> Back
        </button>
        <button type="button" className="btn-game acorn big" onClick={() => onStart(s)}>
          <Play size={24} aria-hidden="true" /> Start Safari
        </button>
      </div>
    </section>
  )
}
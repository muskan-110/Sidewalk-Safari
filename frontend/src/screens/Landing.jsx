import { Backpack, BookOpen } from 'lucide-react'

export default function Landing({ onStart, onHistory }) {
  return (
    <section className="hero text-center">
      <span className="drift d1" aria-hidden="true">🍃</span>
      <span className="drift d2" aria-hidden="true">🦋</span>
      <span className="drift d3" aria-hidden="true">🍂</span>

      <div className="logo-badge" aria-hidden="true">🌿</div>
      <h1 className="display title">Sidewalk Safari</h1>
      <p className="tagline">Turn a short walk into a nature expedition.</p>
      <p className="lead-text">
        Get three tiny missions, put your phone away, and find them in the real world. Come back
        afterwards and write down what you noticed.
      </p>

      <div className="d-flex flex-column align-items-center gap-4 mt-4">
        <button type="button" className="btn-game acorn big" onClick={onStart}>
          <Backpack size={26} aria-hidden="true" /> Start Adventure
        </button>
        <button type="button" className="btn-game ghost small" onClick={onHistory}>
          <BookOpen size={20} aria-hidden="true" /> My Field Journal
        </button>
      </div>

      <ul className="perks">
        <li>🔒 AI runs on your own computer</li>
        <li>📵 The screen is the shortest part</li>
        <li>🚫 No account, no streaks</li>
      </ul>
    </section>
  )
}
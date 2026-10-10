export default function ErrorScreen({ message, onRetry, onBack }) {
  return (
    <section className="text-center">
      <div className="logo-badge" aria-hidden="true">🍂</div>
      <h1 className="display h2">The trail got muddy</h1>
      <p role="alert">{message}</p>
      <div className="d-flex justify-content-center flex-wrap gap-3 mt-4">
        <button type="button" className="btn-game ghost small" onClick={onBack}>Change settings</button>
        <button type="button" className="btn-game acorn" onClick={onRetry}>Try again</button>
      </div>
    </section>
  )
}
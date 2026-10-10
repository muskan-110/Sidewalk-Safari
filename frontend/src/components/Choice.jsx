export default function Choice({ legend, options, value, onChange }) {
  return (
    <fieldset className="choice">
      <legend className="display">{legend}</legend>
      <div className="tiles">
        {options.map((o) => (
          <button
            type="button"
            key={o.id}
            className="tile"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
          >
            <span className="tile-emoji" aria-hidden="true">{o.emoji}</span>
            <span>{o.label}</span>
            {o.sub && <small>{o.sub}</small>}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
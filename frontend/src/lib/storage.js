const KEY = 'sidewalk-safari:v1:entries'

export function loadEntries() {
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

// Insert or update by id. Returns true on success.
export function saveEntry(entry) {
  try {
    const all = loadEntries()
    const i = all.findIndex((e) => e.id === entry.id)
    if (i >= 0) all[i] = entry
    else all.unshift(entry)
    localStorage.setItem(KEY, JSON.stringify(all))
    return true
  } catch {
    return false
  }
}

export function deleteEntry(id) {
  try {
    localStorage.setItem(KEY, JSON.stringify(loadEntries().filter((e) => e.id !== id)))
    return true
  } catch {
    return false
  }
}
const PREFIX = 'lsagriflow_'

function key(collection) { return PREFIX + collection }

export const db = {
  getAll(collection) {
    try { return JSON.parse(localStorage.getItem(key(collection)) || '[]') }
    catch { return [] }
  },
  getById(collection, id) {
    return this.getAll(collection).find(x => x.id === id) || null
  },
  insert(collection, item) {
    const all = this.getAll(collection)
    all.push(item)
    localStorage.setItem(key(collection), JSON.stringify(all))
    return item
  },
  update(collection, id, updates) {
    const all = this.getAll(collection)
    const idx = all.findIndex(x => x.id === id)
    if (idx === -1) return null
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() }
    localStorage.setItem(key(collection), JSON.stringify(all))
    return all[idx]
  },
  delete(collection, id) {
    const all = this.getAll(collection).filter(x => x.id !== id)
    localStorage.setItem(key(collection), JSON.stringify(all))
  },
  where(collection, predicate) {
    return this.getAll(collection).filter(predicate)
  },
  count(collection) { return this.getAll(collection).length },
  clear(collection) { localStorage.removeItem(key(collection)) },
  clearAll() {
    Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k))
  }
}

export function isSeeded() {
  return !!localStorage.getItem(PREFIX + '_seeded')
}
export function markSeeded() {
  localStorage.setItem(PREFIX + '_seeded', '1')
}

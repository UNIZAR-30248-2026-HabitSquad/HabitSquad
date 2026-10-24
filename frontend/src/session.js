const STORAGE_KEY = 'habitsquad.session'

export function getSession() {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (session?.access && session?.refresh) return session
  } catch {
    // Un valor que no es JSON cuenta como sesión inexistente.
  }
  return null
}

export function hasSession() {
  return getSession() !== null
}

export function saveSession({ access, refresh }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ access, refresh }))
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
}

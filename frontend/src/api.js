import { clearSession, getSession, saveSession } from './session.js'

export const SESSION_EXPIRED_EVENT = 'habitsquad:session-expired'

export class ApiError extends Error {
  constructor(status, data = null) {
    super(`La API respondió con el estado ${status}.`)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function readJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function postJson(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new ApiError(response.status, await readJson(response))
  return response.status === 204 ? null : readJson(response)
}

function expireSession() {
  clearSession()
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
}

export async function login({ email, password }) {
  saveSession(await postJson('/api/auth/token/', { email, password }))
}

let pendingRefresh = null

// El backend revoca cada refresh al usarlo: dos renovaciones simultáneas con
// el mismo token harían fallar la segunda y cerrarían la sesión.
export function refreshSession() {
  pendingRefresh ??= (async () => {
    const session = getSession()
    if (!session) {
      expireSession()
      throw new ApiError(401)
    }
    try {
      saveSession(
        await postJson('/api/auth/token/refresh/', { refresh: session.refresh }),
      )
    } catch (error) {
      if (error instanceof ApiError) expireSession()
      throw error
    }
  })().finally(() => {
    pendingRefresh = null
  })
  return pendingRefresh
}

function withAccess(options, access) {
  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${access}`)
  return { ...options, headers }
}

export async function authFetch(path, options = {}) {
  const session = getSession()
  if (!session) {
    expireSession()
    throw new ApiError(401)
  }

  const response = await fetch(path, withAccess(options, session.access))
  if (response.status !== 401) return response

  if (getSession()?.access === session.access) await refreshSession()
  const renewed = getSession()
  if (!renewed) throw new ApiError(401)
  return fetch(path, withAccess(options, renewed.access))
}

export async function logout() {
  const session = getSession()
  clearSession()
  if (!session) return
  try {
    await postJson('/api/auth/logout/', { refresh: session.refresh })
  } catch {
    // Si el refresh ya caducó o no hay conexión, la sesión local queda cerrada igual.
  }
}

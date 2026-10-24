const TOKEN_URL = '/api/auth/token/'
const ACCESS_KEY = 'habitsquad.access'
const REFRESH_KEY = 'habitsquad.refresh'

export const LOGIN_MESSAGES = {
  rejected: 'No se ha podido iniciar sesión con esos datos.',
  limited: 'Has superado el número de intentos. Prueba más tarde.',
  failed: 'No se ha podido iniciar sesión. Inténtalo de nuevo.',
  success: 'Has iniciado sesión.',
}

export function saveSession({ access, refresh }) {
  localStorage.setItem(ACCESS_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
}

export function readSession() {
  return {
    access: localStorage.getItem(ACCESS_KEY),
    refresh: localStorage.getItem(REFRESH_KEY),
  }
}

export async function loginWithPassword({ email, password }) {
  let response
  try {
    response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
  } catch {
    return { ok: false, message: LOGIN_MESSAGES.failed }
  }

  if (response.status === 200) {
    let data
    try {
      data = await response.json()
    } catch {
      return { ok: false, message: LOGIN_MESSAGES.failed }
    }
    if (!data?.access || !data?.refresh) {
      return { ok: false, message: LOGIN_MESSAGES.failed }
    }
    saveSession(data)
    return { ok: true, message: LOGIN_MESSAGES.success }
  }

  if (response.status === 401) {
    return { ok: false, message: LOGIN_MESSAGES.rejected }
  }

  if (response.status === 429) {
    return { ok: false, message: LOGIN_MESSAGES.limited }
  }

  return { ok: false, message: LOGIN_MESSAGES.failed }
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { startApp } from './app.js'
import { clearSession, hasSession, saveSession } from './session.js'

describe('startApp', () => {
  let stopApp

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>'
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    stopApp?.()
    stopApp = undefined
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('si la renovación falla, cierra la sesión y vuelve a /login?sesion=caducada', async () => {
    saveSession({ access: 'old-access', refresh: 'old-refresh' })
    stopApp = startApp()
    expect(window.location.pathname).toBe('/')

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Token is invalid' }),
      }),
    )

    const { refreshSession } = await import('./api.js')
    await expect(refreshSession()).rejects.toMatchObject({ status: 401 })

    expect(hasSession()).toBe(false)
    await vi.waitFor(() => {
      expect(window.location.pathname).toBe('/login')
      expect(window.location.search).toBe('?sesion=caducada')
      expect(document.body.textContent).toContain(
        'Tu sesión ha caducado. Vuelve a iniciar sesión.',
      )
    })
    clearSession()
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { LOGIN_MESSAGES, loginWithPassword, readSession } from './login.js'

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('loginWithPassword', () => {
  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('guarda access y refresh cuando el backend acepta el login', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, { access: 'access-token', refresh: 'refresh-token' }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await loginWithPassword({
      email: 'person@example.com',
      password: 'S0mething!Secure-497',
    })

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0][0]).toBe('/api/auth/token/')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      email: 'person@example.com',
      password: 'S0mething!Secure-497',
    })
    expect(result).toEqual({ ok: true, message: LOGIN_MESSAGES.success })
    expect(readSession()).toEqual({
      access: 'access-token',
      refresh: 'refresh-token',
    })
  })

  it('usa un aviso genérico si las credenciales no valen o la cuenta está inactiva', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(401, {
          detail: 'No active account found with the given credentials',
        }),
      ),
    )

    const result = await loginWithPassword({
      email: 'person@example.com',
      password: 'incorrect-password',
    })

    expect(result).toEqual({ ok: false, message: LOGIN_MESSAGES.rejected })
    expect(result.message).not.toContain('No active account')
    expect(readSession()).toEqual({ access: null, refresh: null })
  })

  it('avisa cuando el backend limita los intentos', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(429, { detail: 'throttled' })),
    )

    const result = await loginWithPassword({
      email: 'person@example.com',
      password: 'incorrect-password',
    })

    expect(result).toEqual({ ok: false, message: LOGIN_MESSAGES.limited })
  })

  it('avisa si no hay conexión con el backend', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    )

    const result = await loginWithPassword({
      email: 'person@example.com',
      password: 'S0mething!Secure-497',
    })

    expect(result).toEqual({ ok: false, message: LOGIN_MESSAGES.failed })
  })
})

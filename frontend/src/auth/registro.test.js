import { afterEach, describe, expect, it, vi } from 'vitest'
import { readSession } from './login.js'
import { MENU_PATH, REGISTER_MESSAGES, registerWithPassword } from './registro.js'

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('registerWithPassword', () => {
  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('crea la cuenta, guarda la sesión JWT y señala el menú principal', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(201, {
          id: 7,
          email: 'person@example.com',
          date_joined: '2026-10-17T12:00:00Z',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(200, { access: 'access-token', refresh: 'refresh-token' }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const result = await registerWithPassword({
      email: 'person@example.com',
      password: 'S0mething!Secure-497',
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/auth/register/')
    expect(fetchMock.mock.calls[1][0]).toBe('/api/auth/token/')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      email: 'person@example.com',
      password: 'S0mething!Secure-497',
    })
    expect(result).toEqual({ ok: true, redirect: MENU_PATH })
    expect(readSession()).toEqual({
      access: 'access-token',
      refresh: 'refresh-token',
    })
  })

  it('muestra el email duplicado que devuelve el backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(400, { email: ['Ya existe una cuenta con este email.'] }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await registerWithPassword({
      email: 'person@example.com',
      password: 'S0mething!Secure-497',
    })

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(result).toEqual({
      ok: false,
      errors: { email: 'Ya existe una cuenta con este email.' },
    })
    expect(readSession()).toEqual({ access: null, refresh: null })
  })

  it('avisa cuando el backend limita los registros', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(429, { detail: 'throttled' })),
    )

    const result = await registerWithPassword({
      email: 'person@example.com',
      password: 'S0mething!Secure-497',
    })

    expect(result).toEqual({ ok: false, message: REGISTER_MESSAGES.limited })
  })

  it('avisa si la cuenta se crea pero no se puede abrir la sesión', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          jsonResponse(201, {
            id: 7,
            email: 'person@example.com',
            date_joined: '2026-10-17T12:00:00Z',
          }),
        )
        .mockResolvedValueOnce(jsonResponse(401, { detail: 'No active account' })),
    )

    const result = await registerWithPassword({
      email: 'person@example.com',
      password: 'S0mething!Secure-497',
    })

    expect(result).toEqual({ ok: false, message: REGISTER_MESSAGES.sessionFailed })
    expect(readSession()).toEqual({ access: null, refresh: null })
  })
})

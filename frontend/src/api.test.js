import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, joinSquad } from './api.js'
import { saveSession } from './session.js'

function jsonResponse(data, status = 201) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  }
}

describe('joinSquad', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('envía el código con autenticación y devuelve el escuadrón creado', async () => {
    saveSession({ access: 'access-token', refresh: 'refresh-token' })
    const squad = {
      id: 1,
      nombre: 'Madrugadores',
      codigo_invitacion: 'X8K9QL',
    }
    fetch.mockResolvedValue(jsonResponse(squad))

    await expect(joinSquad('X8K9QL')).resolves.toEqual(squad)
    expect(fetch).toHaveBeenCalledWith(
      '/api/escuadrones/unirse/',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ codigo_invitacion: 'X8K9QL' }),
      }),
    )
    expect(fetch.mock.calls[0][1].headers.get('Authorization')).toBe(
      'Bearer access-token',
    )
  })

  it('propaga el código de estado y detalle devuelto por el backend', async () => {
    saveSession({ access: 'access-token', refresh: 'refresh-token' })
    fetch.mockResolvedValue(
      jsonResponse(
        { detail: 'No se ha encontrado un escuadrón con ese código' },
        404,
      ),
    )

    const error = await joinSquad('X8K9QL').catch((caught) => caught)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(404)
    expect(error.data).toEqual({
      detail: 'No se ha encontrado un escuadrón con ese código',
    })
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { routes } from '../routes.js'
import { clearSession, saveSession } from '../session.js'

const squadPath = '/api/escuadrones/7/'
const habitPath = `${squadPath}habito/`
const ownHabit = { opcion: 'otro', texto_personalizado: 'Caminar 20 minutos' }
const squad = {
  id: 7,
  nombre: 'Lectores',
  codigo_invitacion: 'ABC123',
  miembros: [
    { nombre: 'Ana', es_usuario: true, habito: ownHabit, prueba_hoy: null },
    { nombre: 'Laura', habito: { opcion: 'leer' }, prueba_hoy: { id: 21, estado: 'cumplido' } },
    { nombre: 'Carlos', habito: { opcion: 'estudiar' }, prueba_hoy: { id: 22, estado: 'pendiente' } },
    { nombre: 'Sara', habito: { opcion: 'gimnasio' }, prueba_hoy: { id: 23, estado: 'no_cumplido' } },
  ],
}

const json = (data) => new Response(JSON.stringify(data), { status: 200 })

describe('panel del escuadrón seleccionado', () => {
  let fetchMock

  beforeEach(() => {
    window.history.replaceState({}, '', '/escuadrones/panel?id=7')
    saveSession({ access: 'access', refresh: 'refresh' })
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    clearSession()
    window.history.replaceState({}, '', '/')
    vi.unstubAllGlobals()
  })

  function openPanel() {
    const route = routes.find(({ path }) => path === '/escuadrones/panel')
    return route.view({ navigate: vi.fn() })
  }

  it('muestra la carga hasta recibir los datos y pinta los estados de hoy del escuadrón', async () => {
    const habitRequest = Promise.withResolvers()
    fetchMock.mockImplementation(async (path) => {
      if (path === squadPath) return json(squad)
      if (path === habitPath) return habitRequest.promise
      throw new Error(`Petición inesperada: ${path}`)
    })

    const panel = openPanel()
    const status = () => panel.querySelector('[role="status"]')
    expect(status().textContent).toBe('Cargando escuadrón…')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledWith(habitPath, expect.any(Object)))
    expect(status().textContent).toBe('Cargando escuadrón…')
    expect(panel.textContent).not.toContain(squad.nombre)

    habitRequest.resolve(json(ownHabit))
    await vi.waitFor(() => expect(panel.querySelector('h1').textContent).toBe(squad.nombre))
    expect(panel.textContent).not.toContain('Cargando escuadrón…')
    expect(panel.textContent).toContain(squad.codigo_invitacion)
    expect(panel.textContent).toContain('4 de 5 miembros')
    expect(panel.textContent).toContain('Hoy1/4')
    const memberRows = [...panel.querySelectorAll('section li')].map((row) => row.textContent)
    expect(memberRows).toEqual([
      expect.stringContaining('TúCaminar 20 minutos · Sin prueba'),
      expect.stringContaining('LauraLeer · Cumplido'),
      expect.stringContaining('CarlosEstudiar · Pendiente'),
      expect.stringContaining('SaraIr al gimnasio · No cumplido'),
    ])
  })

  it.each([squadPath, habitPath])('muestra el error de conexión y recupera el panel al reintentar %s', async (failedPath) => {
    fetchMock.mockImplementation(async (path) => {
      if (path === failedPath) throw new TypeError('Sin conexión')
      if (path === squadPath) return json(squad)
      throw new Error(`Petición inesperada: ${path}`)
    })

    const panel = openPanel()
    const alert = panel.querySelector('[role="alert"]')
    const retry = [...panel.querySelectorAll('button')].find((button) => button.textContent === 'Reintentar')
    await vi.waitFor(() => expect(alert.textContent).toContain('No se ha podido cargar el escuadrón'))
    expect(retry.hidden).toBe(false)
    expect(panel.textContent).not.toContain('Cargando escuadrón…')
    expect(panel.textContent).not.toContain(squad.nombre)

    fetchMock.mockImplementation(async (path) => {
      if (path === squadPath) return json(squad)
      if (path === habitPath) return json(ownHabit)
      throw new Error(`Petición inesperada: ${path}`)
    })
    retry.click()
    expect(retry.hidden).toBe(true)
    expect(alert.textContent).toBe('')
    expect(panel.querySelector('[role="status"]').textContent).toBe('Cargando escuadrón…')
    await vi.waitFor(() => expect(panel.querySelector('h1').textContent).toBe(squad.nombre))
    expect(panel.querySelector('[role="alert"]')).toBeNull()
  })
})

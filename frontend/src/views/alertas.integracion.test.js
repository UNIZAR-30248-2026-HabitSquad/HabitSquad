import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { alertasScreen } from './alertas.js'
import { MENSAJES_TOQUE } from '../components/toques.js'
import { clearSession, saveSession } from '../session.js'

let miembros
let respuestaToque
let fetchMock

const respuesta = (datos, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => datos })
const boton = (root) => root.querySelector('.touch-preview button')
const peticionesToque = () => fetchMock.mock.calls.filter(([ruta]) => ruta.endsWith('/toques/'))

async function montar() {
  const root = alertasScreen({
    avisos: { consultar: async () => 'desactivado' },
    conectar: () => ({ cerrar: vi.fn() }),
  })
  document.body.replaceChildren(root)
  await vi.waitFor(() => expect(root.querySelector('input[value="2"]')).not.toBeNull())
  return root
}

beforeEach(() => {
  saveSession({ access: 'access-integracion', refresh: 'refresh-integracion' })
  miembros = [
    { usuario_id: 1, nickname: 'Ana', es_usuario: true, habito: { opcion: 'leer' } },
    { usuario_id: 2, nickname: 'Álex', habito: { opcion: 'leer' }, prueba_hoy: { estado: 'pendiente' } },
  ]
  respuestaToque = respuesta({ id: 4, fecha: '2026-11-28', enviado: true }, 201)
  fetchMock = vi.fn(async (ruta) => {
    if (ruta === '/api/perfil/') return respuesta({ nickname: 'Ana', hora_aviso: '21:30' })
    if (ruta === '/api/escuadrones/') return respuesta([{ id: 7, nombre: 'Imparables' }])
    if (ruta === '/api/escuadrones/7/') return respuesta({ miembros })
    if (ruta === '/api/escuadrones/7/toques/') return respuestaToque
    throw new Error(`Petición inesperada: ${ruta}`)
  })
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(async () => {
  document.body.replaceChildren()
  await Promise.resolve()
  clearSession()
  localStorage.clear()
  vi.unstubAllGlobals()
})

describe('Alertas y toques conectada al backend', () => {
  it.each([false, true])('envía el mensaje desde la vista real usando JWT (personalizado: %s)', async (personalizado) => {
    const root = await montar()
    root.querySelector('input[value="2"]').click()
    let texto = MENSAJES_TOQUE[0].texto
    if (personalizado) {
      texto = 'Álex, hoy sumamos juntos.'
      const editor = root.querySelector('textarea')
      editor.value = texto
      editor.dispatchEvent(new Event('input', { bubbles: true }))
    }
    expect(boton(root).hidden).toBe(false)
    expect(boton(root).disabled).toBe(false)
    boton(root).click()
    await vi.waitFor(() => expect(root.querySelector('[data-toques] [role="status"]').textContent).toBe('¡Toque enviado a Álex!'))
    expect(peticionesToque()).toHaveLength(1)
    const [, opciones] = peticionesToque()[0]
    expect(opciones.headers.get('Authorization')).toBe('Bearer access-integracion')
    expect(JSON.parse(opciones.body)).toEqual({ destinatario_id: 2, mensaje: texto })
    expect(boton(root).hidden).toBe(true)
  })

  it('oculta Dar toque cuando cumple entre la selección y el envío, sin llamar al POST', async () => {
    const root = await montar()
    root.querySelector('input[value="2"]').click()
    miembros = miembros.map((miembro) => ({ ...miembro, prueba_hoy: { estado: 'cumplido' } }))
    boton(root).click()
    await vi.waitFor(() => expect(root.querySelector('[data-toques] [role="status"]').textContent).toContain('ya no tiene una tarea pendiente'))
    expect(boton(root).hidden).toBe(true)
    expect(peticionesToque()).toHaveLength(0)
  })

  it.each([400, 409])('no muestra un envío exitoso si el backend rechaza el toque (%s)', async (codigo) => {
    respuestaToque = respuesta({ detail: 'El servidor ha rechazado el toque.' }, codigo)
    const root = await montar()
    root.querySelector('input[value="2"]').click()
    boton(root).click()
    await vi.waitFor(() => expect(root.querySelector('[data-toques] [role="alert"]').textContent).toBe('El servidor ha rechazado el toque.'))
    expect(root.textContent).not.toContain('¡Toque enviado')
    expect(peticionesToque()).toHaveLength(1)
  })
})

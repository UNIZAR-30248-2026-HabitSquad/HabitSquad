import { afterEach, describe, expect, it, vi } from 'vitest'
import { MENSAJES_TOQUE, toquesPanel } from './toques.js'
import { ApiError } from '../api.js'

const miembros = [
  { usuario_id: 1, nickname: 'Yo', es_usuario: true, habito: { opcion: 'leer' } },
  { usuario_id: 2, nickname: 'Álex', habito: { opcion: 'leer' } },
  { usuario_id: 3, nickname: 'Marta', habito: { opcion: 'leer' }, prueba_hoy: { estado: 'cumplido' } },
]
const diferida = () => {
  let resolve
  const promise = new Promise((resolver) => { resolve = resolver })
  return { promise, resolve }
}

async function montar(overrides = {}, opciones = {}) {
  const api = {
    listSquads: vi.fn().mockResolvedValue([{ id: 7, nombre: 'Imparables' }, { id: 8, nombre: 'Lectores' }]),
    getSquad: vi.fn().mockResolvedValue({ miembros }),
    sendTouch: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
  const root = toquesPanel({ api, ...opciones })
  document.body.replaceChildren(root)
  await vi.waitFor(() => expect(root.querySelector('select').disabled).toBe(false))
  return { root, api }
}

const input = (root, value) => [...root.querySelectorAll('input')].find((control) => control.value === value)
const elegir = (root, value) => input(root, value).click()
const enviar = (root) => [...root.querySelectorAll('button')].find((control) => /Dar toque|Enviando/.test(control.textContent))

afterEach(() => { document.body.replaceChildren(); sessionStorage.clear() })

describe('toquesPanel', () => {
  it('excluye al usuario y bloquea a quienes ya han cumplido; la vista previa sigue las selecciones', async () => {
    const { root } = await montar()
    expect(input(root, '1')).toBeUndefined()
    expect(input(root, '3').disabled).toBe(true)
    expect(enviar(root).disabled).toBe(true)
    elegir(root, '2')
    elegir(root, 'prueba')
    expect(root.querySelector('.touch-notification').textContent).toContain('Para Álex')
    expect(root.querySelector('.touch-notification').textContent).toContain(MENSAJES_TOQUE[2].texto)
    expect(enviar(root).disabled).toBe(false)
  })

  it('envía la selección una sola vez y bloquea los controles hasta recibir respuesta', async () => {
    const pendiente = diferida()
    const { root, api } = await montar({ sendTouch: vi.fn(() => pendiente.promise) })
    elegir(root, '2')
    elegir(root, 'equipo')
    enviar(root).click()
    enviar(root).click()
    await vi.waitFor(() => expect(api.sendTouch).toHaveBeenCalledExactlyOnceWith({ squadId: '7', userId: 2, messageId: 'equipo', text: MENSAJES_TOQUE[1].texto }))
    expect(root.querySelector('select').disabled).toBe(true)
    expect(root.querySelector('.touch-messages').disabled).toBe(true)
    expect(root.querySelector('textarea').disabled).toBe(true)
    expect(input(root, '2').disabled).toBe(true)
    pendiente.resolve()
    await vi.waitFor(() => expect(root.textContent).toContain('¡Toque enviado a Álex!'))
    expect(input(root, '2').disabled).toBe(true)
    expect(enviar(root).disabled).toBe(true)
    expect(root.querySelector('select').disabled).toBe(false)
    expect(root.querySelector('textarea').disabled).toBe(false)
  })

  it('permite editar una plantilla, actualiza la vista previa y envía el texto personalizado', async () => {
    const { root, api } = await montar()
    elegir(root, '2')
    const editor = root.querySelector('textarea')
    expect(editor.value).toBe(MENSAJES_TOQUE[0].texto)
    editor.value = '  ¡Álex, hoy lo conseguimos juntos!  '
    editor.dispatchEvent(new Event('input', { bubbles: true }))
    expect(input(root, 'personalizado').checked).toBe(true)
    expect(root.querySelector('.touch-notification').textContent).toContain('¡Álex, hoy lo conseguimos juntos!')
    enviar(root).click()
    await vi.waitFor(() => expect(api.sendTouch).toHaveBeenCalledExactlyOnceWith({ squadId: '7', userId: 2, messageId: 'personalizado', text: '¡Álex, hoy lo conseguimos juntos!' }))
  })

  it('conserva el borrador al alternar entre un mensaje predefinido y el personalizado', async () => {
    const { root } = await montar()
    const editor = root.querySelector('textarea')
    editor.value = 'Un poco cada día.'
    editor.dispatchEvent(new Event('input', { bubbles: true }))
    elegir(root, 'equipo')
    expect(editor.value).toBe(MENSAJES_TOQUE[1].texto)
    elegir(root, 'personalizado')
    expect(editor.value).toBe('Un poco cada día.')
    expect(root.querySelector('.touch-notification').textContent).toContain('Un poco cada día.')
  })

  it('no permite enviar mensajes vacíos y conserva el texto personalizado tras un error', async () => {
    const { root } = await montar({ sendTouch: vi.fn().mockRejectedValue(new Error()) })
    elegir(root, '2')
    const editor = root.querySelector('textarea')
    editor.value = '   '
    editor.dispatchEvent(new Event('input', { bubbles: true }))
    expect(enviar(root).disabled).toBe(true)
    editor.value = 'Hoy puedes con ello.'
    editor.dispatchEvent(new Event('input', { bubbles: true }))
    enviar(root).click()
    await vi.waitFor(() => expect(root.querySelector('[role="alert"]').textContent).toContain('Conservamos tu selección'))
    expect(editor.value).toBe('Hoy puedes con ello.')
    expect(editor.disabled).toBe(false)
    expect(enviar(root).disabled).toBe(false)
  })

  it('conserva las selecciones si falla el envío y permite reintentar', async () => {
    const { root, api } = await montar({ sendTouch: vi.fn().mockRejectedValueOnce(new Error()).mockResolvedValue(undefined) })
    elegir(root, '2')
    elegir(root, 'prueba')
    enviar(root).click()
    await vi.waitFor(() => expect(root.querySelector('[role="alert"]').textContent).toContain('Conservamos tu selección'))
    expect(input(root, '2').checked).toBe(true)
    expect(input(root, 'prueba').checked).toBe(true)
    expect(enviar(root).disabled).toBe(false)
    enviar(root).click()
    await vi.waitFor(() => expect(api.sendTouch).toHaveBeenCalledTimes(2))
  })

  it('ignora respuestas antiguas al cambiar de escuadrón y limpia el destinatario', async () => {
    const primera = diferida()
    const segunda = diferida()
    const { root } = await montar({ getSquad: vi.fn().mockReturnValueOnce(primera.promise).mockReturnValueOnce(segunda.promise) })
    root.querySelector('select').value = '8'
    root.querySelector('select').dispatchEvent(new Event('change'))
    segunda.resolve({ miembros: [{ usuario_id: 9, nickname: 'Sofía', habito: { opcion: 'leer' } }] })
    await vi.waitFor(() => expect(root.textContent).toContain('Sofía'))
    primera.resolve({ miembros })
    await Promise.resolve()
    expect(input(root, '2')).toBeUndefined()
    expect(enviar(root).disabled).toBe(true)
    elegir(root, '9')
    expect(root.querySelector('.touch-preview').textContent).toContain('Lectores')
  })

  it('explica la disponibilidad sin fingir envíos cuando falta la API', async () => {
    const { root } = await montar({ sendTouch: undefined })
    elegir(root, '2')
    expect(enviar(root).disabled).toBe(true)
    expect(root.textContent).toContain('El envío de toques estará disponible próximamente.')
  })

  it('la demo deja claro que el toque no se ha enviado', async () => {
    const { root } = await montar({}, { demo: true })
    elegir(root, '2')
    enviar(root).click()
    await vi.waitFor(() => expect(root.textContent).toContain('Toque de ejemplo preparado para Álex. No se ha enviado.'))
  })

  it('sin escuadrones ofrece un estado vacío', async () => {
    const api = { listSquads: vi.fn().mockResolvedValue([]), getSquad: vi.fn() }
    const root = toquesPanel({ api })
    await vi.waitFor(() => expect(root.textContent).toContain('Únete a un escuadrón'))
    expect(api.getSquad).not.toHaveBeenCalled()
    expect(enviar(root).disabled).toBe(true)
  })

  it('permite recuperar una carga fallida de compañeros', async () => {
    const { root, api } = await montar({ getSquad: vi.fn().mockRejectedValueOnce(new Error()).mockResolvedValue({ miembros }) })
    await vi.waitFor(() => expect(root.querySelector('[role="alert"]').textContent).toContain('No se han podido cargar los compañeros'))
    root.querySelector('.touch-retry').click()
    await vi.waitFor(() => expect(input(root, '2')).toBeDefined())
    expect(api.getSquad).toHaveBeenCalledTimes(2)
  })

  it.each(['cumplido', 'no_cumplido'])('oculta Dar toque y no permite seleccionar al compañero con estado %s', async (estado) => {
    const { root, api } = await montar({ getSquad: vi.fn().mockResolvedValue({ miembros: [
      miembros[0], { ...miembros[1], prueba_hoy: { estado } },
    ] }) })
    expect(input(root, '2').disabled).toBe(true)
    elegir(root, '2')
    expect(input(root, '2').checked).toBe(false)
    expect(enviar(root).hidden).toBe(true)
    enviar(root).click()
    expect(api.sendTouch).not.toHaveBeenCalled()
    if (estado === 'cumplido') expect(root.textContent).toContain('¡Todo el equipo ha cumplido!')
  })

  it('permite dar un toque con prueba pendiente de validar, pero no a quien no tiene hábito', async () => {
    const { root, api } = await montar({ getSquad: vi.fn().mockResolvedValue({ miembros: [
      { ...miembros[1], prueba_hoy: { estado: 'pendiente' } },
      { usuario_id: 4, nickname: 'Sin hábito', habito: null },
    ] }) })
    expect(enviar(root).hidden).toBe(true)
    expect(input(root, '4').disabled).toBe(true)
    elegir(root, '2')
    expect(enviar(root).hidden).toBe(false)
    expect(enviar(root).disabled).toBe(false)
    enviar(root).click()
    await vi.waitFor(() => expect(api.sendTouch).toHaveBeenCalledOnce())
  })

  it('vuelve a comprobar el estado antes de enviar y oculta el botón si acaba de cumplir', async () => {
    const { root, api } = await montar({ getSquad: vi.fn()
      .mockResolvedValueOnce({ miembros })
      .mockResolvedValue({ miembros: [{ ...miembros[1], prueba_hoy: { estado: 'cumplido' } }] }) })
    elegir(root, '2')
    enviar(root).click()
    await vi.waitFor(() => expect(root.textContent).toContain('Este compañero ya no tiene una tarea pendiente hoy.'))
    expect(enviar(root).hidden).toBe(true)
    expect(api.sendTouch).not.toHaveBeenCalled()
  })

  it('oculta Dar toque si el destinatario cumple en directo, conserva el borrador y cierra la conexión al salir', async () => {
    const cerrar = vi.fn()
    const conectar = vi.fn(() => ({ cerrar }))
    const { root, api } = await montar({}, { conectar })
    elegir(root, '2')
    const editor = root.querySelector('textarea')
    editor.value = 'Sigue así, Álex.'
    editor.dispatchEvent(new Event('input', { bubbles: true }))
    expect(enviar(root).hidden).toBe(false)
    api.getSquad.mockResolvedValue({ miembros: [{ ...miembros[1], prueba_hoy: { estado: 'cumplido' } }] })
    await conectar.mock.calls[0][1].alActualizar()
    expect(enviar(root).hidden).toBe(true)
    expect(input(root, '2').disabled).toBe(true)
    expect(editor.value).toBe('Sigue así, Álex.')
    expect(api.sendTouch).not.toHaveBeenCalled()
    root.remove()
    await vi.waitFor(() => expect(cerrar).toHaveBeenCalledOnce())
  })

  it('respeta el límite diario global entre escuadrones y permite volver a dar un toque al día siguiente en Madrid', async () => {
    let momento = new Date('2026-11-28T22:59:00Z')
    const { root, api } = await montar({}, { ahora: () => momento })
    elegir(root, '2')
    enviar(root).click()
    await vi.waitFor(() => expect(root.textContent).toContain('¡Toque enviado a Álex!'))
    const selector = root.querySelector('select')
    selector.value = '8'
    selector.dispatchEvent(new Event('change'))
    await vi.waitFor(() => expect(input(root, '2')).toBeDefined())
    expect(input(root, '2').disabled).toBe(true)
    expect(root.textContent).toContain('Toque enviado')
    momento = new Date('2026-11-28T23:01:00Z')
    selector.value = '7'
    selector.dispatchEvent(new Event('change'))
    await vi.waitFor(() => expect(input(root, '2')?.disabled).toBe(false))
    elegir(root, '2')
    expect(enviar(root).disabled).toBe(false)
    expect(api.sendTouch).toHaveBeenCalledOnce()
  })

  it('cierra la conexión anterior al cambiar de escuadrón e ignora su actualización tardía', async () => {
    const conexiones = []
    const conectar = vi.fn(() => {
      const conexion = { cerrar: vi.fn() }
      conexiones.push(conexion)
      return conexion
    })
    const { root, api } = await montar({}, { conectar })
    const antigua = diferida()
    api.getSquad.mockReturnValueOnce(antigua.promise)
      .mockResolvedValue({ miembros: [{ usuario_id: 9, nickname: 'Sofía', habito: { opcion: 'leer' } }] })
    const actualizacion = conectar.mock.calls[0][1].alActualizar()
    root.querySelector('select').value = '8'
    root.querySelector('select').dispatchEvent(new Event('change'))
    await vi.waitFor(() => expect(input(root, '9')).toBeDefined())
    expect(conexiones[0].cerrar).toHaveBeenCalledOnce()
    antigua.resolve({ miembros })
    await actualizacion
    expect(input(root, '2')).toBeUndefined()
    expect(root.textContent).toContain('Sofía')
    root.remove()
    await vi.waitFor(() => expect(conexiones[1].cerrar).toHaveBeenCalledOnce())
  })

  it('un 409 explica el límite y bloquea nuevos intentos también desde otro escuadrón', async () => {
    const { root, api } = await montar({ sendTouch: vi.fn().mockRejectedValue(new ApiError(409, { detail: 'El destinatario ya ha recibido un toque hoy.' })) })
    elegir(root, '2')
    enviar(root).click()
    await vi.waitFor(() => expect(root.querySelector('[role="alert"]').textContent).toBe('El destinatario ya ha recibido un toque hoy.'))
    expect(enviar(root).hidden).toBe(true)
    root.querySelector('select').value = '8'
    root.querySelector('select').dispatchEvent(new Event('change'))
    await vi.waitFor(() => expect(input(root, '2')).toBeDefined())
    expect(input(root, '2').disabled).toBe(true)
    expect(api.sendTouch).toHaveBeenCalledOnce()
  })

  it.each([
    [400, { detail: 'No ha sido posible enviar la notificación por falta de permisos del usuario.' }],
    [400, { mensaje: ['Este campo no puede estar vacío.'] }],
    [401, null],
  ])('muestra el error %s del servidor y conserva el mensaje para reintentar', async (codigo, datos) => {
    const { root } = await montar({ sendTouch: vi.fn().mockRejectedValue(new ApiError(codigo, datos)) })
    elegir(root, '2')
    enviar(root).click()
    await vi.waitFor(() => expect(root.querySelector('[role="alert"]').textContent)
      .toBe(datos?.detail ?? datos?.mensaje?.[0] ?? 'Tu sesión ha caducado. Vuelve a iniciar sesión.'))
    expect(root.querySelector('textarea').value).toBe(MENSAJES_TOQUE[0].texto)
    expect(enviar(root).disabled).toBe(false)
  })

  it.each([403, 404])('oculta la acción si pierde el acceso al escuadrón (%s)', async (codigo) => {
    const { root } = await montar({ sendTouch: vi.fn().mockRejectedValue(new ApiError(codigo, { detail: 'Escuadrón no disponible.' })) })
    elegir(root, '2')
    enviar(root).click()
    await vi.waitFor(() => expect(enviar(root).hidden).toBe(true))
    expect(root.querySelector('[role="alert"]').textContent).toBe('Escuadrón no disponible.')
    expect(root.querySelectorAll('.touch-member')).toHaveLength(0)
  })
})

import { describe, expect, it, vi } from 'vitest'
import { crearEscuadronScreen } from './crearEscuadron.js'

function mount(screen = crearEscuadronScreen()) {
  document.body.replaceChildren(screen)
  return screen
}

function submit(element) {
  element.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }))
}

describe('crearEscuadronScreen', () => {
  it('muestra la pantalla «Crea tu escuadrón»', () => {
    const element = mount()

    expect(element.querySelector('h1').textContent).toBe('Crea tu escuadrón')
    expect(element.querySelector('input[name="nombre"]').placeholder).toBe('Ej. Gym Bros')
    expect(element.querySelector('button[type="submit"]').textContent).toBe(
      'Crear escuadrón',
    )
    const joinLink = [...element.querySelectorAll('a[data-link]')].find(
      (link) => link.textContent === 'Quiero unirme a uno',
    )
    expect(joinLink.getAttribute('href')).toBe('/escuadrones/unirse')
  })

  it('no envía el formulario si el nombre está vacío', () => {
    const onSubmit = vi.fn()
    const element = mount(crearEscuadronScreen({ onSubmit }))
    element.querySelector('input[name="nombre"]').value = '   '
    submit(element)

    expect(onSubmit).not.toHaveBeenCalled()
    expect(element.querySelector('[role="alert"]').textContent).toBe(
      'Ponle un nombre a tu escuadrón.',
    )
  })

  // T17: pruebas pendientes de la creación de escuadrón.
  it.todo('entrega el nombre sin espacios al enviar')
  it.todo('muestra el error del servidor y reactiva el botón')
  it.todo('tras crearlo muestra el código de invitación y los miembros')
  it.todo('copia el código al portapapeles')
})

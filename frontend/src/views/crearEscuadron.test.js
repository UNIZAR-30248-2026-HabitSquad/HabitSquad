import { describe, expect, it, vi } from 'vitest'
import { crearEscuadronScreen, validateSquadName } from './crearEscuadron.js'

function mount(screen = crearEscuadronScreen()) {
  document.body.replaceChildren(screen)
  return screen
}

function fill(element, nombre) {
  element.querySelector('input[name="nombre"]').value = nombre
}

function submit(element) {
  element.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }))
}

describe('validateSquadName', () => {
  it('acepta un nombre recortado', () => {
    expect(validateSquadName('  Gym Bros  ')).toEqual({
      ok: true,
      name: 'Gym Bros',
    })
  })

  it('rechaza un nombre vacío o solo espacios', () => {
    expect(validateSquadName('')).toEqual({
      ok: false,
      error: 'Ponle un nombre a tu escuadrón.',
    })
    expect(validateSquadName('   ')).toEqual({
      ok: false,
      error: 'Ponle un nombre a tu escuadrón.',
    })
  })

  it('rechaza un nombre de más de 100 caracteres', () => {
    expect(validateSquadName('a'.repeat(101))).toEqual({
      ok: false,
      error: 'El nombre puede tener como máximo 100 caracteres.',
    })
  })
})

describe('crearEscuadronScreen', () => {
  it('muestra la pantalla «Crea tu escuadrón»', () => {
    const element = mount()

    expect(element.querySelector('h1').textContent).toBe('Crea tu escuadrón')
    expect(element.textContent).toContain('Nombre del escuadrón')
    expect(element.querySelector('input[name="nombre"]').placeholder).toBe('Ej. Gym Bros')
    expect(element.querySelector('input[name="nombre"]').maxLength).toBe(100)
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
    fill(element, '   ')
    submit(element)

    expect(onSubmit).not.toHaveBeenCalled()
    expect(element.querySelector('[role="alert"]').textContent).toBe(
      'Ponle un nombre a tu escuadrón.',
    )
  })

  it('no envía el formulario si el nombre es demasiado largo', () => {
    const onSubmit = vi.fn()
    const element = mount(crearEscuadronScreen({ onSubmit }))
    const input = element.querySelector('input[name="nombre"]')
    input.removeAttribute('maxLength')
    fill(element, 'a'.repeat(101))
    submit(element)

    expect(onSubmit).not.toHaveBeenCalled()
    expect(element.querySelector('[role="alert"]').textContent).toBe(
      'El nombre puede tener como máximo 100 caracteres.',
    )
  })

  it('entrega el nombre sin espacios al enviar', () => {
    const onSubmit = vi.fn()
    const element = mount(crearEscuadronScreen({ onSubmit }))
    fill(element, '  Gym Bros  ')
    submit(element)

    expect(onSubmit).toHaveBeenCalledWith('Gym Bros')
  })

  // T17: pruebas pendientes
  it.todo('muestra el error del servidor y reactiva el botón')
  it.todo('tras crearlo muestra el código de invitación y los miembros')
  it.todo('copia el código al portapapeles')
})

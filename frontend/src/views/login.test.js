import { describe, expect, it, vi } from 'vitest'
import { loginScreen } from './acceso.js'

function mount(screen = loginScreen()) {
  document.body.replaceChildren(screen)
  return screen
}

function submit(element) {
  element.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }))
}

describe('loginScreen', () => {
  it('muestra la vista de iniciar sesión', () => {
    const element = mount()

    expect(element.querySelector('h1').textContent).toBe('Iniciar sesión')
    expect(element.className).toContain('w-full')
    expect(element.className).toContain('min-h-dvh')
    expect(element.textContent).toContain('HabitSquad')
    expect(element.textContent).toContain('Cumple tu hábito. Que no caiga la racha.')
    expect(element.textContent).toContain('Correo')
    expect(element.textContent).toContain('Contraseña')
    expect(element.querySelector('input[name="email"]').placeholder).toBe('tu@correo.com')
    expect(element.querySelector('input[name="password"]').placeholder).toBe(
      'Tu contraseña',
    )
    expect(element.querySelector('button[type="submit"]').textContent).toBe('Entrar')
    expect(element.textContent).toContain(
      'Después podrás crear un escuadrón o unirte a uno.',
    )

    const registerTab = [...element.querySelectorAll('a[data-link]')].find(
      (link) => link.textContent === 'Registrarme',
    )
    expect(registerTab.getAttribute('href')).toBe('/registro')
    expect(
      element.querySelector('a[aria-current="page"]').textContent,
    ).toBe('Iniciar sesión')
  })

  it('avisa si faltan el correo o la contraseña y no envía el formulario', () => {
    const onSubmit = vi.fn()
    const element = mount(loginScreen({ onSubmit }))
    submit(element)

    expect(onSubmit).not.toHaveBeenCalled()
    const alerts = [...element.querySelectorAll('[role="alert"]')]
    expect(alerts.map((alert) => alert.textContent)).toEqual([
      'Introduce tu correo.',
      'Introduce tu contraseña.',
    ])
  })

  it('entrega el correo normalizado y la contraseña cuando son válidos', () => {
    const onSubmit = vi.fn()
    const element = mount(loginScreen({ onSubmit }))
    element.querySelector('input[name="email"]').value = ' Persona@Example.com '
    element.querySelector('input[name="password"]').value = 'secreta'
    submit(element)

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'persona@example.com',
      password: 'secreta',
    })
  })

  // T12: pruebas pendientes del inicio de sesión.
  it.todo('muestra y oculta la contraseña')
  it.todo('muestra el aviso de sesión caducada')
  it.todo('avisa de que están activadas las mayúsculas')
  it.todo('muestra el error del servidor y selecciona la contraseña')
})

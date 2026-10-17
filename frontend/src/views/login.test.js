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
    expect(element.querySelector(':scope > div').className).toContain('max-w-md')
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

  it('muestra y oculta la contraseña', () => {
    const element = mount()
    const password = element.querySelector('input[name="password"]')
    const toggle = element.querySelector('button[aria-pressed]')

    toggle.click()
    expect(password.type).toBe('text')
    expect(toggle.textContent).toBe('Ocultar')

    toggle.click()
    expect(password.type).toBe('password')
    expect(toggle.textContent).toBe('Mostrar')
  })

  it('muestra el aviso que recibe, por ejemplo de sesión caducada', () => {
    const element = mount(
      loginScreen({ notice: 'Tu sesión ha caducado. Vuelve a iniciar sesión.' }),
    )

    expect(element.querySelector('[role="status"]').textContent).toBe(
      'Tu sesión ha caducado. Vuelve a iniciar sesión.',
    )
  })
})

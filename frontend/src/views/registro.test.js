import { beforeEach, describe, expect, it, vi } from 'vitest'
import { registroScreen, validateRegistration } from './registro.js'

const VALID_EMAIL = 'Person@Example.com'
const VALID_PASSWORD = 'S0mething!Secure-497'

function mount(screen = registroScreen()) {
  document.body.replaceChildren(screen)
  return screen
}

function fill(element, { email = '', password = '' } = {}) {
  const emailInput = element.querySelector('input[name="email"]')
  const passwordInput = element.querySelector('input[name="password"]')
  emailInput.value = email
  passwordInput.value = password
  return { emailInput, passwordInput }
}

function submit(element) {
  element.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }))
}

function alerts(element) {
  return [...element.querySelectorAll('[role="alert"]')]
}

describe('validateRegistration', () => {
  it('acepta un email normalizado y una contraseña que cumple las reglas', () => {
    const result = validateRegistration({
      email: `  ${VALID_EMAIL}  `,
      password: VALID_PASSWORD,
    })

    expect(result.ok).toBe(true)
    expect(result.email).toBe('person@example.com')
    expect(result.password).toBe(VALID_PASSWORD)
    expect(result.errors).toEqual({})
  })

  it('conserva los espacios de la contraseña', () => {
    const result = validateRegistration({
      email: VALID_EMAIL,
      password: `  ${VALID_PASSWORD}`,
    })

    expect(result.ok).toBe(true)
    expect(result.password).toBe(`  ${VALID_PASSWORD}`)
  })

  it.each([
    ['', 'Introduce tu email.'],
    ['   ', 'Introduce tu email.'],
    ['not-an-email', 'Introduce un email válido.'],
    ['persona@', 'Introduce un email válido.'],
    ['persona@example', 'Introduce un email válido.'],
  ])('rechaza el email %j', (email, message) => {
    const result = validateRegistration({ email, password: VALID_PASSWORD })

    expect(result.ok).toBe(false)
    expect(result.errors.email).toBe(message)
    expect(result.errors.password).toBeUndefined()
  })

  it('exige la contraseña', () => {
    const result = validateRegistration({ email: VALID_EMAIL, password: '' })

    expect(result.ok).toBe(false)
    expect(result.errors.password).toBe('Introduce una contraseña.')
  })

  it('exige al menos 8 caracteres', () => {
    const result = validateRegistration({ email: VALID_EMAIL, password: 'Corta1!' })

    expect(result.errors.password).toBe(
      'La contraseña debe tener al menos 8 caracteres.',
    )
  })

  it('rechaza una contraseña solo numérica', () => {
    const result = validateRegistration({
      email: VALID_EMAIL,
      password: '1234567890123456',
    })

    expect(result.errors.password).toBe('La contraseña no puede ser solo números.')
  })

  it('rechaza una contraseña demasiado común', () => {
    const result = validateRegistration({
      email: VALID_EMAIL,
      password: 'password',
    })

    expect(result.errors.password).toBe('Esta contraseña es demasiado común.')
  })

  it('rechaza una contraseña demasiado parecida al email', () => {
    const result = validateRegistration({
      email: VALID_EMAIL,
      password: 'person99xx',
    })

    expect(result.errors.password).toBe(
      'La contraseña es demasiado parecida al email.',
    )
  })

  it('informa email y contraseña a la vez cuando ambos fallan', () => {
    const result = validateRegistration({ email: '', password: '' })

    expect(result.ok).toBe(false)
    expect(result.errors.email).toBe('Introduce tu email.')
    expect(result.errors.password).toBe('Introduce una contraseña.')
  })
})

describe('validación local del formulario de registro', () => {
  let element

  beforeEach(() => {
    element = mount()
  })

  it('muestra email, contraseña y el botón sin avisos', () => {
    expect(element.querySelector('h1').textContent).toBe('Registrarme')
    expect(element.querySelector('input[name="email"]').type).toBe('email')
    expect(element.querySelector('input[name="password"]').type).toBe('password')
    expect(element.querySelector('button[type="submit"]').textContent).toBe('Crear cuenta')
    for (const alert of alerts(element)) {
      expect(alert.classList.contains('hidden')).toBe(true)
      expect(alert.className).toContain('text-red-600')
    }
  })

  it('muestra los avisos y no envía el formulario si los datos no valen', () => {
    const onSubmit = vi.fn()
    const screen = mount(registroScreen({ onSubmit }))
    fill(screen, { email: 'not-an-email', password: 'password' })
    submit(screen)

    expect(onSubmit).not.toHaveBeenCalled()
    const [emailAlert, passwordAlert] = alerts(screen)
    expect(emailAlert.classList.contains('hidden')).toBe(false)
    expect(emailAlert.textContent).toBe('Introduce un email válido.')
    expect(passwordAlert.classList.contains('hidden')).toBe(false)
    expect(passwordAlert.textContent).toBe('Esta contraseña es demasiado común.')
    expect(screen.querySelector('input[name="email"]').getAttribute('aria-invalid')).toBe(
      'true',
    )
    expect(
      screen.querySelector('input[name="password"]').getAttribute('aria-invalid'),
    ).toBe('true')
    expect(document.activeElement).toBe(screen.querySelector('input[name="email"]'))
  })

  it('retira solo el aviso del campo que se corrige', () => {
    fill(element, { email: '', password: '' })
    submit(element)
    const emailInput = element.querySelector('input[name="email"]')
    emailInput.value = VALID_EMAIL
    emailInput.dispatchEvent(new Event('input'))

    const [emailAlert, passwordAlert] = alerts(element)
    expect(emailAlert.classList.contains('hidden')).toBe(true)
    expect(emailInput.getAttribute('aria-invalid')).toBe('false')
    expect(passwordAlert.classList.contains('hidden')).toBe(false)
  })

  it('entrega el email normalizado y la contraseña si la validación local pasa', () => {
    const onSubmit = vi.fn()
    const screen = mount(registroScreen({ onSubmit }))
    fill(screen, { email: VALID_EMAIL, password: VALID_PASSWORD })
    submit(screen)

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'person@example.com',
      password: VALID_PASSWORD,
    })
    for (const alert of alerts(screen)) {
      expect(alert.classList.contains('hidden')).toBe(true)
    }
    for (const input of screen.querySelectorAll('input')) {
      expect(input.getAttribute('aria-invalid')).toBe('false')
    }
  })
})

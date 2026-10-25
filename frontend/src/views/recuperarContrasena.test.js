import { describe, expect, it, vi } from 'vitest'
import { recuperarContrasenaScreen } from './recuperarContrasena.js'

function mount(screen = recuperarContrasenaScreen()) {
  document.body.replaceChildren(screen)
  return screen
}

function fill(element, email) {
  element.querySelector('input[name="email"]').value = email
}

function submit(element) {
  element.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }))
}

describe('recuperarContrasenaScreen', () => {
  it('no envía un correo inválido', () => {
    const onSubmit = vi.fn()
    const element = mount(recuperarContrasenaScreen({ onSubmit }))

    fill(element, 'no-es-correo')
    submit(element)

    expect(onSubmit).not.toHaveBeenCalled()
    expect(element.querySelector('[role="alert"]').textContent).toBe(
      'Introduce un correo válido.',
    )
  })

  it('no envía un correo vacío', () => {
    const onSubmit = vi.fn()
    const element = mount(recuperarContrasenaScreen({ onSubmit }))

    submit(element)

    expect(onSubmit).not.toHaveBeenCalled()
    expect(element.querySelector('[role="alert"]').textContent).toBe(
      'Introduce tu correo.',
    )
  })

  it('envía el correo y confirma sin revelar si la cuenta existe', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const element = mount(recuperarContrasenaScreen({ onSubmit }))

    fill(element, ' Persona@Example.com ')
    submit(element)

    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('persona@example.com')
      expect(element.querySelector('form')).toBeNull()
      expect(element.querySelector('[role="status"]').textContent).toContain(
        'Si hay una cuenta con persona@example.com, te hemos enviado un enlace.',
      )
      expect(element.textContent).toContain('Revisa también la carpeta de spam.')
    })
  })

  it('avisa si el servicio aún no está disponible (404) o hay demasiados intentos (429)', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(
        new Error('La recuperación de contraseña todavía no está disponible.'),
      )
      .mockRejectedValueOnce(
        new Error('Has hecho demasiados intentos. Espera un rato y vuelve a probar.'),
      )

    const element404 = mount(recuperarContrasenaScreen({ onSubmit }))
    fill(element404, 'persona@example.com')
    submit(element404)

    await vi.waitFor(() => {
      expect(element404.textContent).toContain(
        'La recuperación de contraseña todavía no está disponible.',
      )
      expect(element404.querySelector('form')).not.toBeNull()
    })

    const element429 = mount(recuperarContrasenaScreen({ onSubmit }))
    fill(element429, 'persona@example.com')
    submit(element429)

    await vi.waitFor(() => {
      expect(element429.textContent).toContain(
        'Has hecho demasiados intentos. Espera un rato y vuelve a probar.',
      )
      expect(element429.querySelector('form')).not.toBeNull()
    })
  })
})

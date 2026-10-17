import { describe, expect, it, vi } from 'vitest'
import { recuperarContrasenaScreen } from './recuperarContrasena.js'

function submit(element, email) {
  element.querySelector('input[name="email"]').value = email
  element.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }))
}

describe('recuperarContrasenaScreen', () => {
  it('no envía un correo inválido', () => {
    const onSubmit = vi.fn()
    const element = recuperarContrasenaScreen({ onSubmit })
    document.body.replaceChildren(element)

    submit(element, 'no-es-un-correo')

    expect(onSubmit).not.toHaveBeenCalled()
    expect(element.querySelector('[role="alert"]').textContent).toBe(
      'Introduce un correo válido.',
    )
  })

  it('envía el correo y confirma sin revelar si la cuenta existe', async () => {
    const onSubmit = vi.fn().mockResolvedValue()
    const element = recuperarContrasenaScreen({ onSubmit })

    submit(element, ' Persona@Example.com ')

    expect(onSubmit).toHaveBeenCalledWith('persona@example.com')
    await vi.waitFor(() =>
      expect(element.querySelector('[role="status"]').textContent).toContain(
        'Si hay una cuenta con persona@example.com, te hemos enviado un enlace.',
      ),
    )
    expect(element.querySelector('form')).toBeNull()
  })
})

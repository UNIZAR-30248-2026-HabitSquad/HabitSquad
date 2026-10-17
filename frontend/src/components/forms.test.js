import { describe, expect, it } from 'vitest'
import {
  clearFieldError,
  labeledField,
  passwordField,
  setFieldError,
  setSubmitPending,
  submitButton,
} from './forms.js'

describe('forms', () => {
  it('enlaza la etiqueta y el aviso de error con el campo', () => {
    const field = labeledField({
      label: 'Correo',
      id: 'correo',
      name: 'email',
      type: 'email',
      placeholder: 'tu@correo.com',
      autocomplete: 'email',
    })

    expect(field.wrapper.querySelector('label').htmlFor).toBe('correo')
    setFieldError(field.input, field.error, 'Introduce tu correo.')
    expect(field.input.getAttribute('aria-describedby')).toBe('correo-error')
    clearFieldError(field.input, field.error)
    expect(field.input.getAttribute('aria-describedby')).toBeNull()
  })

  it('el campo de contraseña puede mostrarse y ocultarse', () => {
    const field = passwordField({
      label: 'Contraseña',
      id: 'contrasena',
      name: 'password',
      placeholder: 'Tu contraseña',
      autocomplete: 'current-password',
    })
    const toggle = field.wrapper.querySelector('button[aria-pressed]')

    toggle.click()
    expect(field.input.type).toBe('text')
    toggle.click()
    expect(field.input.type).toBe('password')
  })

  it('el botón de envío muestra el estado de espera', () => {
    const button = submitButton('Entrar')

    setSubmitPending(button, true, 'Entrando…')
    expect(button.disabled).toBe(true)
    expect(button.textContent).toBe('Entrando…')
    setSubmitPending(button, false, 'Entrando…')
    expect(button.textContent).toBe('Entrar')
  })
})

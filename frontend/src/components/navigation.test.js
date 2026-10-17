import { describe, expect, it } from 'vitest'
import { authTabs, passwordRecoveryLink } from './navigation.js'

describe('navigation', () => {
  it('marca la pestaña activa del acceso', () => {
    const tabs = authTabs('login')

    expect(tabs.querySelector('a[aria-current="page"]').textContent).toBe(
      'Iniciar sesión',
    )
  })

  it('el enlace de recuperación lleva a su pantalla', () => {
    const link = passwordRecoveryLink()

    expect(link.getAttribute('href')).toBe('/recuperar-contrasena')
    expect(link.textContent).toContain('¿Has olvidado tu contraseña?')
  })
})

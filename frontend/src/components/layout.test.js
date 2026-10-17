import { describe, expect, it } from 'vitest'
import { authLayout } from './layout.js'

describe('authLayout', () => {
  it('crea el panel de marca para escritorio y la tarjeta del formulario', () => {
    const topAction = document.createElement('a')
    topAction.textContent = 'Volver'
    const { main, content } = authLayout({
      title: 'Iniciar sesión',
      description: 'Entra en tu cuenta.',
      topAction,
    })
    const child = document.createElement('p')
    child.textContent = 'Formulario'
    content.append(child)

    expect(main.querySelector('h1').textContent).toBe('Iniciar sesión')
    expect(main.querySelector('aside').className).toContain('hidden')
    expect(main.querySelector('aside').className).toContain('lg:flex')
    expect(content.textContent).toContain('Formulario')
    expect(main.textContent).toContain('Volver')
  })
})

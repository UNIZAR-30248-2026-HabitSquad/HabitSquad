import { describe, expect, it } from 'vitest'
import { splitLayout } from './layout.js'

describe('splitLayout', () => {
  it('crea el panel de marca para escritorio y la tarjeta del formulario', () => {
    const topAction = document.createElement('a')
    topAction.textContent = 'Volver'
    const { main, content } = splitLayout({
      title: 'Iniciar sesión',
      description: 'Entra en tu cuenta.',
      top: topAction,
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

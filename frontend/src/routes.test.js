import { afterEach, describe, expect, it, vi } from 'vitest'
import { guard, notFound, routes } from './routes.js'
import { getSession } from './session.js'

describe('routes', () => {
  it.each(routes.map((route) => [route.path, route]))(
    '%s pinta una pantalla con su título',
    (_path, route) => {
      const element = route.view()
      expect(element.querySelector('h1').textContent).toBe(route.title)
    },
  )

  it('las pantallas enlazan con el enrutador mediante data-link', () => {
    const home = routes.find((route) => route.path === '/').view()
    const hrefs = [...home.querySelectorAll('a[data-link]')].map((a) =>
      a.getAttribute('href'),
    )
    const paths = routes.map((route) => route.path)
    expect(hrefs.length).toBeGreaterThan(0)
    expect(hrefs.every((href) => paths.includes(href))).toBe(true)
  })

  it('la pantalla de no encontrada tiene título y enlace al inicio', () => {
    const element = notFound.view()
    expect(element.querySelector('h1').textContent).toBe(notFound.title)
    expect(element.querySelector('a[data-link]').getAttribute('href')).toBe('/')
  })
})

describe('sesión', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('sin sesión las rutas privadas llevan a /login', () => {
    const privatePaths = routes.filter((route) => route.private).map((route) => route.path)
    expect(privatePaths).toEqual(['/', '/escuadrones/nuevo', '/escuadrones/unirse'])
    for (const path of privatePaths) {
      expect(guard(routes.find((route) => route.path === path))).toBe('/login')
    }
  })

  it('un login correcto guarda los tokens y abre el inicio', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ access: 'a1', refresh: 'r1' }), { status: 200 }),
      ),
    )
    const navigate = vi.fn()
    const element = routes.find((route) => route.path === '/login').view({ navigate })
    element.querySelector('input[name="email"]').value = 'persona@example.com'
    element.querySelector('input[name="password"]').value = 'secreta'
    element.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }))

    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/'))
    expect(getSession()).toEqual({ access: 'a1', refresh: 'r1' })
  })
})

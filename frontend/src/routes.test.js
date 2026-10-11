import { describe, expect, it } from 'vitest'
import { notFound, routes } from './routes.js'

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

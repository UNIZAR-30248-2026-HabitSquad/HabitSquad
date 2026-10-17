import { describe, expect, it } from 'vitest'
import { guard, notFound, routes } from './routes.js'

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
  it('sin sesión las rutas privadas llevan a /login', () => {
    localStorage.clear()
    const privateRoute = routes.find((route) => route.path === '/')
    expect(guard(privateRoute)).toBe('/login')
  })

  // T12: pruebas pendientes de la sesión.
  it.todo('con sesión, /login y /registro llevan al inicio')
  it.todo('un login correcto guarda los tokens y abre el inicio')
  it.todo('traduce los errores 401 y 429 del login')
  it.todo('renueva el access una sola vez aunque fallen dos peticiones a la vez')
  it.todo('si la renovación falla, cierra la sesión y vuelve a /login?sesion=caducada')
  it.todo('cerrar sesión borra los tokens aunque falle la petición')
  it.todo('ignora una sesión guardada corrupta')
})

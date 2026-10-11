import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createRouter, matchRoute } from './router.js'

function view(text) {
  return () => {
    const element = document.createElement('p')
    element.textContent = text
    return element
  }
}

const routes = [
  { path: '/', title: 'HabitSquad', view: view('inicio') },
  { path: '/login', title: 'Iniciar sesión', view: view('login') },
]
const notFound = { title: 'Página no encontrada', view: view('404') }

describe('matchRoute', () => {
  it('devuelve la ruta cuyo path coincide', () => {
    expect(matchRoute(routes, '/login')).toBe(routes[1])
  })

  it('devuelve null si ninguna ruta coincide', () => {
    expect(matchRoute(routes, '/no-existe')).toBeNull()
  })
})

describe('createRouter', () => {
  let root
  let router

  beforeEach(() => {
    window.history.replaceState({}, '', '/')
    document.body.innerHTML = '<div id="app"></div><a href="/login" data-link>Entrar</a>'
    root = document.querySelector('#app')
    router = createRouter({ routes, notFound, root })
    router.start()
  })

  afterEach(() => {
    router.stop()
  })

  it('pinta la pantalla de la URL actual al arrancar', () => {
    expect(root.textContent).toBe('inicio')
    expect(document.title).toBe('HabitSquad')
  })

  it('navega a otra pantalla y actualiza URL y título', () => {
    router.navigate('/login')
    expect(window.location.pathname).toBe('/login')
    expect(root.textContent).toBe('login')
    expect(document.title).toBe('Iniciar sesión · HabitSquad')
  })

  it('no añade una entrada al historial si ya está en esa URL', () => {
    const length = window.history.length
    router.navigate('/')
    expect(window.history.length).toBe(length)
  })

  it('pinta la pantalla de no encontrada para rutas desconocidas', () => {
    router.navigate('/no-existe')
    expect(root.textContent).toBe('404')
    expect(document.title).toBe('Página no encontrada · HabitSquad')
  })

  it('intercepta los clics en enlaces con data-link', () => {
    const link = document.querySelector('a[data-link]')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(root.textContent).toBe('login')
  })

  it('deja al navegador abrir en otra pestaña con Ctrl+clic', () => {
    const link = document.querySelector('a[data-link]')
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
    })
    link.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(root.textContent).toBe('inicio')
  })

  it('ignora clics fuera de enlaces con data-link', () => {
    root.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(root.textContent).toBe('inicio')
  })

  it('vuelve a pintar al usar atrás y adelante del navegador', () => {
    window.history.pushState({}, '', '/login')
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(root.textContent).toBe('login')
  })
})

import { screen } from './views/screen.js'
import { unirseEscuadronScreen } from './views/unirseEscuadron.js'

const backHome = [{ href: '/', label: 'Volver al inicio' }]

export const routes = [
  {
    path: '/',
    title: 'HabitSquad',
    view: () =>
      screen({
        title: 'HabitSquad',
        description: 'Cumple tu hábito. Que no caiga la racha.',
        links: [
          { href: '/login', label: 'Iniciar sesión' },
          { href: '/registro', label: 'Registrarme' },
          { href: '/escuadrones/nuevo', label: 'Crear un escuadrón' },
          { href: '/escuadrones/unirse', label: 'Unirme a un escuadrón' },
        ],
      }),
  },
  {
    path: '/login',
    title: 'Iniciar sesión',
    view: () => screen({ title: 'Iniciar sesión', links: backHome }),
  },
  {
    path: '/registro',
    title: 'Registrarme',
    view: () => screen({ title: 'Registrarme', links: backHome }),
  },
  {
    path: '/escuadrones/nuevo',
    title: 'Crea tu escuadrón',
    view: () =>
      screen({
        title: 'Crea tu escuadrón',
        description: 'Ponle nombre y comparte el código con tu gente.',
        links: backHome,
      }),
  },
  {
    path: '/escuadrones/unirse',
    title: 'Únete a un escuadrón',
    view: () => unirseEscuadronScreen(),
  },
]

export const notFound = {
  title: 'Página no encontrada',
  view: () =>
    screen({
      title: 'Página no encontrada',
      description: 'La dirección no corresponde a ninguna pantalla.',
      links: backHome,
    }),
}

import { ApiError, login, logout, requestPasswordReset } from './api.js'
import { hasSession } from './session.js'
import { loginScreen, registroScreen } from './views/acceso.js'
import { inicioScreen } from './views/inicio.js'
import { recuperarContrasenaScreen } from './views/recuperarContrasena.js'
import { screen } from './views/screen.js'
import { unirseEscuadronScreen } from './views/unirseEscuadron.js'

const backHome = [{ href: '/', label: 'Volver al inicio' }]

function loginErrorMessage(error) {
  if (error instanceof ApiError && error.status === 401) {
    return 'El correo o la contraseña no son correctos.'
  }
  if (error instanceof ApiError && error.status === 429) {
    return 'Has hecho demasiados intentos. Espera un rato y vuelve a probar.'
  }
  return 'No se ha podido iniciar sesión. Comprueba tu conexión e inténtalo de nuevo.'
}

function passwordResetErrorMessage(error) {
  if (error instanceof ApiError && error.status === 404) {
    return 'La recuperación de contraseña todavía no está disponible.'
  }
  if (error instanceof ApiError && error.status === 429) {
    return 'Has hecho demasiados intentos. Espera un rato y vuelve a probar.'
  }
  return 'No se ha podido enviar el enlace. Comprueba tu conexión e inténtalo de nuevo.'
}

export const routes = [
  {
    path: '/',
    title: 'HabitSquad',
    private: true,
    view: ({ navigate } = {}) =>
      inicioScreen({
        onLogout: async () => {
          await logout()
          navigate('/login')
        },
      }),
  },
  {
    path: '/login',
    title: 'Iniciar sesión',
    guestOnly: true,
    view: ({ navigate } = {}) =>
      loginScreen({
        notice:
          new URLSearchParams(window.location.search).get('sesion') === 'caducada'
            ? 'Tu sesión ha caducado. Vuelve a iniciar sesión.'
            : null,
        onSubmit: async (credentials) => {
          try {
            await login(credentials)
          } catch (error) {
            throw new Error(loginErrorMessage(error), { cause: error })
          }
          navigate('/')
        },
      }),
  },
  {
    path: '/registro',
    title: 'Registrarme',
    guestOnly: true,
    view: () => registroScreen(),
  },
  {
    path: '/recuperar-contrasena',
    title: 'Recuperar contraseña',
    guestOnly: true,
    view: () =>
      recuperarContrasenaScreen({
        onSubmit: async (email) => {
          try {
            await requestPasswordReset(email)
          } catch (error) {
            throw new Error(passwordResetErrorMessage(error), { cause: error })
          }
        },
      }),
  },
  {
    path: '/escuadrones/nuevo',
    title: 'Crea tu escuadrón',
    private: true,
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
    private: true,
    view: () => unirseEscuadronScreen(),
  },
]

export function guard(route) {
  if (route.private && !hasSession()) return '/login'
  if (route.guestOnly && hasSession()) return '/'
  return null
}

export const notFound = {
  title: 'Página no encontrada',
  view: () =>
    screen({
      title: 'Página no encontrada',
      description: 'La dirección no corresponde a ninguna pantalla.',
      links: backHome,
    }),
}

import { ApiError, createSquad, login, logout, requestPasswordReset } from './api.js'
import { hasSession } from './session.js'
import { loginScreen, registroScreen } from './views/acceso.js'
import { crearEscuadronScreen } from './views/crearEscuadron.js'
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

function createSquadErrorMessage(error) {
  const nameError = error instanceof ApiError ? error.data?.nombre?.[0] : null
  if (nameError) return nameError
  if (error instanceof ApiError && error.status === 401) {
    return 'Tu sesión ha caducado. Vuelve a iniciar sesión.'
  }
  return 'No se ha podido crear el escuadrón. Comprueba tu conexión e inténtalo de nuevo.'
}

function homeScreen(onLogout) {
  const element = screen({
    title: 'HabitSquad',
    description: 'Cumple tu hábito. Que no caiga la racha.',
    links: [
      { href: '/escuadrones/nuevo', label: 'Crear un escuadrón' },
      { href: '/escuadrones/unirse', label: 'Unirme a un escuadrón' },
    ],
  })

  const logoutButton = document.createElement('button')
  logoutButton.type = 'button'
  logoutButton.className = 'self-start font-medium text-indigo-700 underline disabled:opacity-60'
  logoutButton.textContent = 'Cerrar sesión'
  logoutButton.addEventListener('click', async () => {
    logoutButton.disabled = true
    try {
      await onLogout()
    } finally {
      logoutButton.disabled = false
    }
  })
  element.querySelector('nav').append(logoutButton)
  return element
}

export const routes = [
  {
    path: '/',
    title: 'HabitSquad',
    private: true,
    view: ({ navigate } = {}) =>
      homeScreen(async () => {
        await logout()
        navigate('/login')
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
      crearEscuadronScreen({
        onSubmit: async (nombre) => {
          try {
            return await createSquad(nombre)
          } catch (error) {
            throw new Error(createSquadErrorMessage(error), { cause: error })
          }
        },
      }),
  },
  {
    path: '/mi-habito',
    title: 'Mi hábito diario',
    private: true,
    view: () =>
      screen({
        title: 'Mi hábito diario',
        description: 'Uno solo, tuyo. Si falla, falla la racha de todos.',
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

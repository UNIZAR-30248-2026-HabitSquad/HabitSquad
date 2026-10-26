import { SESSION_EXPIRED_EVENT } from './api.js'
import { createRouter } from './router.js'
import { guard, notFound, routes } from './routes.js'

export function startApp(root = document.querySelector('#app')) {
  const router = createRouter({
    routes,
    notFound,
    guard,
    root,
  })

  function onSessionExpired() {
    router.navigate('/login?sesion=caducada')
  }

  window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired)
  router.start()

  return function stopApp() {
    window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired)
    router.stop()
  }
}

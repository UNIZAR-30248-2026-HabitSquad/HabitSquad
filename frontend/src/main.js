import '@fontsource-variable/nunito'
import './style.css'
import { SESSION_EXPIRED_EVENT } from './api.js'
import { createRouter } from './router.js'
import { guard, notFound, routes } from './routes.js'

const router = createRouter({
  routes,
  notFound,
  guard,
  root: document.querySelector('#app'),
})

window.addEventListener(SESSION_EXPIRED_EVENT, () =>
  router.navigate('/login?sesion=caducada'),
)
router.start()

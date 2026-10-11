import './style.css'
import { createRouter } from './router.js'
import { notFound, routes } from './routes.js'

createRouter({
  routes,
  notFound,
  root: document.querySelector('#app'),
}).start()

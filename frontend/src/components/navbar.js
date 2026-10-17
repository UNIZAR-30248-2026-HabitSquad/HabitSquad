import { INSTALL_AVAILABILITY_EVENT, canInstall, promptInstall } from '../install.js'
import { appMark } from './brand.js'
import { chevronDownIcon, closeIcon, downloadIcon, menuIcon } from './icons.js'

const ACCOUNT_LINKS = {
  login: { href: '/login', label: 'Iniciar sesión' },
  register: { href: '/registro', label: 'Registrarme' },
}

const STEPS = [
  ['Crea tu escuadrón', 'Ponle nombre e invita a tu gente con un código de 6 caracteres.'],
  ['Sube tu prueba', 'Cada día, una foto de que has cumplido tu hábito.'],
  ['Que no caiga la racha', 'Tu escuadrón valida las pruebas y la racha sigue creciendo.'],
]

const STEP_COLORS = ['bg-accent', 'bg-sky', 'bg-streak']

const itemClass = [
  'flex h-10 items-center gap-1.5 rounded-xl px-3 text-[0.9375rem] font-extrabold',
  'text-ink-muted transition-colors hover:bg-fill hover:text-ink',
  'aria-expanded:bg-fill aria-expanded:text-ink',
  'focus-visible:outline-2 focus-visible:outline-accent',
].join(' ')

const chunkyButtonClass = [
  'inline-flex h-11 shrink-0 items-center rounded-2xl border-2 border-b-4 border-hairline',
  'bg-white/85 px-4 text-[0.875rem] font-extrabold tracking-[0.06em] text-accent uppercase',
  'transition-[transform,border-width] duration-75 hover:bg-white',
  'active:translate-y-0.5 active:border-b-2',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
].join(' ')

function element(tag, className = '', text = '') {
  const node = document.createElement(tag)
  node.className = className
  if (text) node.textContent = text
  return node
}

function link({ href, label }, className, current = false) {
  const anchor = element('a', className, label)
  anchor.href = href
  anchor.dataset.link = ''
  if (current) anchor.setAttribute('aria-current', 'page')
  return anchor
}

// Los escuchadores de document y window se quitan solos cuando la pantalla
// sale del DOM, porque el router crea una barra nueva en cada navegación.
function listenWhileMounted(node, target, type, handler) {
  let mounted = false
  function listener(event) {
    if (node.isConnected) mounted = true
    else if (mounted) {
      target.removeEventListener(type, listener)
      return
    }
    handler(event)
  }
  target.addEventListener(type, listener)
}

function disclosure(button, panel, root) {
  button.setAttribute('aria-expanded', 'false')
  button.setAttribute('aria-controls', panel.id)
  panel.hidden = true

  function setOpen(open) {
    button.setAttribute('aria-expanded', String(open))
    panel.hidden = !open
  }

  button.addEventListener('click', () =>
    setOpen(button.getAttribute('aria-expanded') !== 'true'),
  )
  listenWhileMounted(root, document, 'click', (event) => {
    if (!root.contains(event.target)) setOpen(false)
  })
  listenWhileMounted(root, document, 'keydown', (event) => {
    if (event.key !== 'Escape' || panel.hidden) return
    const focusInside = panel.contains(document.activeElement)
    setOpen(false)
    if (focusInside) button.focus()
  })
  return setOpen
}

function stepsList() {
  const list = element('ol', 'flex flex-col gap-3')
  STEPS.forEach(([title, text], index) => {
    const item = element('li', 'flex gap-3')
    const number = element(
      'span',
      `grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[1rem] font-black text-white ${STEP_COLORS[index]}`,
      String(index + 1),
    )
    const body = element('div', 'min-w-0')
    body.append(
      element('p', 'text-[0.9375rem] font-extrabold text-ink', title),
      element('p', 'text-[0.8125rem] leading-snug font-semibold text-ink-muted', text),
    )
    item.append(number, body)
    list.append(item)
  })
  return list
}

function stepsHeading() {
  return element(
    'p',
    'mb-3 text-[0.8125rem] font-extrabold tracking-widest text-ink-muted uppercase',
    'Cómo funciona',
  )
}

function installButton(className, iconClass) {
  const button = element('button', className)
  button.type = 'button'
  button.hidden = !canInstall()
  button.append(downloadIcon(iconClass), element('span', '', 'Instalar app'))
  button.addEventListener('click', () => promptInstall())
  return button
}

function logo() {
  const anchor = link({ href: '/', label: '' }, 'flex items-center gap-2.5 rounded-xl')
  anchor.setAttribute('aria-label', 'HabitSquad')
  anchor.append(
    appMark('h-9 w-9'),
    element(
      'span',
      'hidden text-[1.5rem] font-black tracking-tight text-accent sm:inline',
      'HabitSquad',
    ),
  )
  return anchor
}

export function accessNavbar({ active = null } = {}) {
  const wrapper = element(
    'div',
    'relative z-30 shrink-0 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5',
  )
  const header = element(
    'header',
    'glass mx-auto flex h-14 max-w-5xl items-center gap-2 rounded-full ps-2.5 pe-2 sm:h-16 sm:ps-3 sm:pe-2.5',
  )

  const howButton = element('button', itemClass)
  howButton.type = 'button'
  howButton.append(element('span', '', 'Cómo funciona'), chevronDownIcon())
  const howPanel = element(
    'div',
    'glass absolute top-full left-1/2 mt-3 w-[23rem] -translate-x-1/2 rounded-3xl p-5 max-lg:hidden',
  )
  howPanel.id = 'como-funciona'
  howPanel.append(stepsHeading(), stepsList())

  const center = element('nav', 'mx-auto hidden items-center gap-1 lg:flex')
  center.setAttribute('aria-label', 'Principal')
  const desktopInstall = installButton(itemClass, 'h-4.5 w-4.5 shrink-0')
  center.append(howButton, desktopInstall)

  // En registro, el enlace sencillo es «Registrarme» y el botón lleva a iniciar sesión.
  const textKey = active === 'register' ? 'register' : 'login'
  const buttonKey = textKey === 'login' ? 'register' : 'login'
  const textLink = link(
    ACCOUNT_LINKS[textKey],
    `hidden h-10 items-center rounded-xl px-3 text-[0.9375rem] font-extrabold sm:flex ${
      active === textKey ? 'text-accent' : 'text-ink-muted hover:text-ink'
    }`,
    active === textKey,
  )

  const menuButton = element(
    'button',
    'group grid h-10 w-10 place-items-center rounded-xl text-ink transition-colors hover:bg-fill aria-expanded:bg-fill focus-visible:outline-2 focus-visible:outline-accent lg:hidden',
  )
  menuButton.type = 'button'
  menuButton.setAttribute('aria-label', 'Menú')
  const openGlyph = element('span', 'flex group-aria-expanded:hidden')
  openGlyph.append(menuIcon())
  const closeGlyph = element('span', 'hidden group-aria-expanded:flex')
  closeGlyph.append(closeIcon())
  menuButton.append(openGlyph, closeGlyph)

  const end = element('div', 'ms-auto flex items-center gap-1.5 lg:ms-0')
  end.append(textLink, link(ACCOUNT_LINKS[buttonKey], chunkyButtonClass), menuButton)
  header.append(logo(), center, end)

  const mobilePanel = element(
    'div',
    'glass absolute inset-x-3 top-full mt-2 rounded-3xl p-4 sm:inset-x-6 lg:hidden',
  )
  mobilePanel.id = 'menu-acceso'
  const mobileNav = element('nav', 'flex flex-col gap-1')
  mobileNav.setAttribute('aria-label', 'Menú')
  for (const key of ['login', 'register']) {
    mobileNav.append(
      link(
        ACCOUNT_LINKS[key],
        `${itemClass} h-12 ${active === key ? 'text-accent' : ''}`,
        active === key,
      ),
    )
  }
  const mobileInstall = installButton(`${itemClass} h-12`, 'h-5 w-5 shrink-0')
  mobileNav.append(mobileInstall)
  const mobileSteps = element('div', 'mt-2 border-t-2 border-hairline px-3 pt-4')
  mobileSteps.append(stepsHeading(), stepsList())
  mobilePanel.append(mobileNav, mobileSteps)

  wrapper.append(header, howPanel, mobilePanel)

  const setHowOpen = disclosure(howButton, howPanel, wrapper)
  const setMenuOpen = disclosure(menuButton, mobilePanel, wrapper)
  const desktop = window.matchMedia?.('(min-width: 64rem)')
  if (desktop) {
    listenWhileMounted(wrapper, desktop, 'change', () => {
      setHowOpen(false)
      setMenuOpen(false)
    })
  }
  listenWhileMounted(wrapper, window, INSTALL_AVAILABILITY_EVENT, () => {
    desktopInstall.hidden = !canInstall()
    mobileInstall.hidden = !canInstall()
  })

  return wrapper
}

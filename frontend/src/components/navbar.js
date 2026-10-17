import { appMark } from './brand.js'

const ACCOUNT_LINKS = {
  login: { href: '/login', label: 'Iniciar sesión' },
  register: { href: '/registro', label: 'Registrarme' },
}

const chunkyButtonClass = [
  'inline-flex h-11 shrink-0 items-center rounded-2xl border-2 border-b-4 border-hairline',
  'bg-white/85 px-4 text-[0.875rem] font-extrabold tracking-[0.06em] text-accent uppercase',
  'transition-[transform,border-width] duration-75 hover:bg-white',
  'active:translate-y-0.5 active:border-b-2',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
].join(' ')

function link({ href, label }, className, current = false) {
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.dataset.link = ''
  anchor.className = className
  anchor.textContent = label
  if (current) anchor.setAttribute('aria-current', 'page')
  return anchor
}

function logo() {
  const anchor = link({ href: '/', label: '' }, 'flex items-center gap-2.5 rounded-xl')
  anchor.setAttribute('aria-label', 'HabitSquad')
  const name = document.createElement('span')
  name.className = 'hidden text-[1.5rem] font-black tracking-tight text-accent sm:inline'
  name.textContent = 'HabitSquad'
  anchor.append(appMark('h-9 w-9'), name)
  return anchor
}

export function accessNavbar({ active = null } = {}) {
  const wrapper = document.createElement('div')
  wrapper.className =
    'relative z-30 shrink-0 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5'

  const header = document.createElement('header')
  header.className =
    'glass mx-auto flex h-14 max-w-5xl items-center gap-2 rounded-full ps-2.5 pe-2 sm:h-16 sm:ps-3 sm:pe-2.5'

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

  const end = document.createElement('nav')
  end.className = 'ms-auto flex items-center gap-1.5'
  end.setAttribute('aria-label', 'Cuenta')
  end.append(textLink, link(ACCOUNT_LINKS[buttonKey], chunkyButtonClass))

  header.append(logo(), end)
  wrapper.append(header)
  return wrapper
}

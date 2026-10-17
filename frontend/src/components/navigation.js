import { chevronLeftIcon, chevronRightIcon } from './icons.js'

function segment(href, label, active) {
  const link = document.createElement('a')
  link.href = href
  link.dataset.link = ''
  link.textContent = label
  link.className = [
    'flex h-9 min-w-0 items-center justify-center rounded-[0.5rem] px-2 text-center',
    'text-[0.875rem] leading-tight transition-colors duration-200',
    'focus-visible:outline-2 focus-visible:outline-accent',
    active
      ? 'bg-surface font-semibold text-ink shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
      : 'font-medium text-ink-muted hover:text-ink',
  ].join(' ')
  if (active) link.setAttribute('aria-current', 'page')
  return link
}

export function authTabs(activeMode) {
  const tabs = document.createElement('nav')
  tabs.className = 'grid min-w-0 grid-cols-2 gap-0.5 rounded-[0.625rem] bg-fill p-0.5'
  tabs.setAttribute('aria-label', 'Acceso')
  tabs.append(
    segment('/login', 'Iniciar sesión', activeMode === 'login'),
    segment('/registro', 'Registrarme', activeMode === 'register'),
  )
  return tabs
}

export function passwordRecoveryLink() {
  const link = document.createElement('a')
  link.href = '/recuperar-contrasena'
  link.dataset.link = ''
  link.className = [
    '-mt-1 self-start rounded text-[0.9375rem] text-accent',
    'hover:text-accent-hover hover:underline underline-offset-4',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
  ].join(' ')
  link.textContent = '¿Has olvidado tu contraseña?'
  return link
}

export function backLink({ href, label }) {
  const link = document.createElement('a')
  link.href = href
  link.dataset.link = ''
  link.className = [
    '-ms-1.5 mb-8 inline-flex min-h-11 items-center gap-0.5 self-start rounded-lg pe-2',
    'text-[1.0625rem] text-accent hover:text-accent-hover',
    'focus-visible:outline-2 focus-visible:outline-accent',
  ].join(' ')
  const text = document.createElement('span')
  text.textContent = label
  link.append(chevronLeftIcon('h-5 w-5 shrink-0'), text)
  return link
}

export function listRow({ href, title, subtitle, icon }) {
  const link = document.createElement('a')
  link.href = href
  link.dataset.link = ''
  link.className = [
    'group flex min-h-16 min-w-0 items-center gap-4 px-4 py-3 transition-colors duration-150',
    'hover:bg-canvas/70 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent',
  ].join(' ')

  const badge = document.createElement('span')
  badge.className =
    'grid h-9 w-9 shrink-0 place-items-center rounded-[0.625rem] bg-accent text-white'
  badge.append(icon)

  const text = document.createElement('span')
  text.className = 'min-w-0 flex-1'

  const titleElement = document.createElement('span')
  titleElement.className = 'block text-[1.0625rem] font-medium text-ink'
  titleElement.textContent = title

  const subtitleElement = document.createElement('span')
  subtitleElement.className = 'mt-0.5 block text-[0.875rem] leading-snug text-ink-muted'
  subtitleElement.textContent = subtitle

  text.append(titleElement, subtitleElement)
  link.append(
    badge,
    text,
    chevronRightIcon('h-4 w-4 shrink-0 text-ink-muted/60 transition-transform group-hover:translate-x-0.5'),
  )
  return link
}

export function groupedList(label, rows) {
  const nav = document.createElement('nav')
  nav.setAttribute('aria-label', label)
  nav.className = [
    'flex min-w-0 flex-col divide-y divide-hairline/70 overflow-hidden rounded-2xl bg-surface',
  ].join(' ')
  nav.append(...rows)
  return nav
}

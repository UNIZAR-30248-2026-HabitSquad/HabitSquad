import { arrowRightIcon } from './icons.js'

function tab(href, label, active) {
  const link = document.createElement('a')
  link.href = href
  link.dataset.link = ''
  link.textContent = label
  link.className = [
    'min-w-0 border-b-[3px] px-1 pb-3 text-center text-base leading-tight text-balance transition-colors',
    active
      ? 'border-[#5b32ea] font-bold text-[#5b32ea]'
      : 'border-transparent font-semibold text-[#5c5678] hover:border-[#c9c0e8] hover:text-[#211a45]',
  ].join(' ')
  if (active) link.setAttribute('aria-current', 'page')
  return link
}

export function authTabs(activeMode) {
  const tabs = document.createElement('nav')
  tabs.className = 'grid min-w-0 grid-cols-2 border-b border-[#e4e0ef]'
  tabs.setAttribute('aria-label', 'Acceso')
  tabs.append(
    tab('/login', 'Iniciar sesión', activeMode === 'login'),
    tab('/registro', 'Registrarme', activeMode === 'register'),
  )
  return tabs
}

export function passwordRecoveryLink() {
  const link = document.createElement('a')
  link.href = '/recuperar-contrasena'
  link.dataset.link = ''
  link.className = [
    '-mt-2 self-start rounded text-sm font-semibold text-[#5b32ea]',
    'underline-offset-4 hover:text-[#4c28cc] hover:underline',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b32ea]',
  ].join(' ')
  link.textContent = '¿Has olvidado tu contraseña?'
  return link
}

export function backLink({ href, label }) {
  const link = document.createElement('a')
  link.href = href
  link.dataset.link = ''
  link.className = [
    'inline-flex min-h-10 items-center self-start rounded-full px-2 text-sm font-semibold',
    'text-[#5b32ea] transition hover:bg-[#f0ebff] hover:text-[#4c28cc]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b32ea]',
  ].join(' ')
  link.textContent = `‹ ${label}`
  return link
}

export function actionLink({ href, label, primary = false }) {
  const link = document.createElement('a')
  link.href = href
  link.dataset.link = ''
  link.className = [
    'flex min-h-12 w-full min-w-0 items-center justify-between gap-3 rounded-2xl px-4 py-3',
    'text-base font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b32ea]',
    primary
      ? 'bg-[#5b32ea] text-white shadow-lg shadow-[#5b32ea]/25 hover:bg-[#4c28cc]'
      : 'border border-[#ded9ee] bg-white text-[#5b32ea] hover:border-[#5b32ea] hover:bg-[#f7f4ff]',
  ].join(' ')

  const text = document.createElement('span')
  text.textContent = label
  link.append(text, arrowRightIcon())
  return link
}

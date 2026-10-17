import { brand } from '../components/brand.js'
import { checkIcon } from '../components/icons.js'
import { actionLink } from '../components/navigation.js'

const FEATURES = [
  'Un hábito diario elegido por cada persona.',
  'Prueba con foto y validación del escuadrón.',
  'Una única racha compartida por todo el equipo.',
]

function feature(text) {
  const item = document.createElement('li')
  item.className = 'flex items-start gap-3 text-sm leading-snug font-medium text-[#3f3862]'

  const badge = document.createElement('span')
  badge.className =
    'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#ece7fd] text-[#5b32ea]'
  badge.append(checkIcon('h-3.5 w-3.5 shrink-0'))

  const label = document.createElement('span')
  label.textContent = text
  item.append(badge, label)
  return item
}

export function inicioScreen({ onLogout } = {}) {
  const main = document.createElement('main')
  main.className = [
    'min-h-dvh w-full min-w-0 bg-[#f4f2fb] text-slate-950',
    'ps-[env(safe-area-inset-left)] pe-[env(safe-area-inset-right)]',
    'pt-[env(safe-area-inset-top)]',
  ].join(' ')

  const container = document.createElement('div')
  container.className = [
    'mx-auto flex min-h-dvh w-full max-w-6xl min-w-0 flex-col px-4 py-5',
    'pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 lg:px-10 lg:py-8',
  ].join(' ')

  const header = document.createElement('header')
  header.className = 'flex items-center justify-between gap-4'

  const logoutButton = document.createElement('button')
  logoutButton.type = 'button'
  logoutButton.className = [
    'inline-flex min-h-11 shrink-0 items-center rounded-full border border-[#ded9ee] bg-white px-4',
    'text-sm font-semibold text-[#5c5678] shadow-sm transition hover:border-[#c9c0e8] hover:text-[#211a45]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b32ea]',
    'disabled:cursor-wait disabled:opacity-70',
  ].join(' ')
  logoutButton.textContent = 'Cerrar sesión'
  logoutButton.addEventListener('click', async () => {
    if (typeof onLogout !== 'function') return
    logoutButton.disabled = true
    logoutButton.textContent = 'Cerrando sesión…'
    try {
      await onLogout()
    } finally {
      logoutButton.disabled = false
      logoutButton.textContent = 'Cerrar sesión'
    }
  })

  header.append(brand(), logoutButton)

  const card = document.createElement('section')
  card.className = [
    'mt-8 grid flex-1 items-center gap-8 rounded-[2rem] bg-white p-5',
    'shadow-[0_24px_70px_rgba(59,20,127,0.12)] ring-1 ring-[#e4e0ef]',
    'sm:p-8 lg:mt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:p-12',
  ].join(' ')

  const copy = document.createElement('div')
  const heading = document.createElement('h1')
  heading.className = 'sr-only'
  heading.textContent = 'HabitSquad'

  const eyebrow = document.createElement('p')
  eyebrow.className = 'text-sm font-bold tracking-wide text-[#5b32ea] uppercase'
  eyebrow.textContent = 'Tu escuadrón'

  const headline = document.createElement('p')
  headline.className =
    'mt-3 text-4xl leading-[1.05] font-black tracking-tight text-balance text-[#211a45] sm:text-5xl'
  headline.textContent = 'Un hábito al día. Una racha de todo el equipo.'

  const intro = document.createElement('p')
  intro.className = 'mt-4 max-w-xl text-base leading-relaxed text-pretty text-[#5c5678] sm:text-lg'
  intro.textContent =
    'Crea un escuadrón nuevo o únete a uno con el código que te han pasado para empezar.'

  const features = document.createElement('ul')
  features.className = 'mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3'
  features.append(...FEATURES.map(feature))

  copy.append(heading, eyebrow, headline, intro, features)

  const actionsPanel = document.createElement('div')
  actionsPanel.className = 'rounded-[1.5rem] bg-[#f7f4ff] p-4 sm:p-5'

  const actionsTitle = document.createElement('p')
  actionsTitle.className = 'px-1 text-base font-bold text-[#211a45]'
  actionsTitle.textContent = '¿Por dónde empezamos?'

  const actions = document.createElement('nav')
  actions.className = 'mt-4 flex min-w-0 flex-col gap-3'
  actions.setAttribute('aria-label', 'Escuadrón')
  actions.append(
    actionLink({ href: '/escuadrones/nuevo', label: 'Crear un escuadrón', primary: true }),
    actionLink({ href: '/escuadrones/unirse', label: 'Unirme a un escuadrón' }),
  )

  const actionsNote = document.createElement('p')
  actionsNote.className = 'mt-4 px-1 text-sm leading-relaxed text-[#5c5678]'
  actionsNote.textContent =
    'Si te han enviado un código de seis caracteres, elige unirte a un escuadrón.'

  actionsPanel.append(actionsTitle, actions, actionsNote)
  card.append(copy, actionsPanel)
  container.append(header, card)
  main.append(container)
  return main
}

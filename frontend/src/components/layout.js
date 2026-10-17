import { brand } from './brand.js'
import { checkIcon } from './icons.js'

const BENEFITS = [
  'Una racha compartida que se cuida entre todos.',
  'Una foto al día para demostrar tu hábito.',
  'Avisos y toques cuando alguien necesita un empujón.',
]

function benefit(text) {
  const item = document.createElement('li')
  item.className = 'flex items-start gap-3 text-base leading-snug text-white/85'

  const badge = document.createElement('span')
  badge.className =
    'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15 text-white'
  badge.append(checkIcon('h-3.5 w-3.5 shrink-0'))

  const label = document.createElement('span')
  label.textContent = text
  item.append(badge, label)
  return item
}

function streakPreview() {
  const card = document.createElement('div')
  card.className = [
    'mt-12 max-w-md rounded-[2rem] border border-white/20 bg-white/10 p-6',
    'shadow-2xl shadow-black/10 backdrop-blur-md',
  ].join(' ')

  const label = document.createElement('p')
  label.className = 'text-sm font-semibold tracking-wide text-white/70 uppercase'
  label.textContent = 'Racha del escuadrón'

  const value = document.createElement('p')
  value.className = 'mt-2 text-5xl font-black tracking-tight text-white'
  value.textContent = '12 días'

  const detail = document.createElement('p')
  detail.className = 'mt-2 text-sm text-white/75'
  detail.textContent = 'Hoy cumplen 2 de 3 · La racha se cierra a las 23:59'

  const progress = document.createElement('div')
  progress.className = 'mt-5 h-2 overflow-hidden rounded-full bg-white/20'
  const bar = document.createElement('div')
  bar.className = 'h-full w-2/3 rounded-full bg-white'
  progress.append(bar)

  card.append(label, value, detail, progress)
  return card
}

function brandPanel() {
  const aside = document.createElement('aside')
  aside.className = [
    'relative hidden overflow-hidden bg-[#5b32ea] lg:flex lg:flex-col lg:justify-between',
    'px-12 py-12 xl:px-16 xl:py-16',
    'bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_34%),linear-gradient(155deg,#3b147f_0%,#5b32ea_52%,#7c5cff_100%)]',
  ].join(' ')
  aside.setAttribute('aria-hidden', 'true')

  const top = document.createElement('div')
  top.className = 'relative z-10'
  top.append(brand({ inverse: true }))

  const copy = document.createElement('div')
  copy.className = 'relative z-10 mt-16 max-w-xl'

  const headline = document.createElement('p')
  headline.className =
    'text-5xl leading-[1.02] font-black tracking-tight text-balance text-white xl:text-6xl'
  headline.textContent = 'Los hábitos se cumplen mejor en equipo.'

  const intro = document.createElement('p')
  intro.className = 'mt-5 max-w-lg text-lg leading-relaxed text-white/80'
  intro.textContent =
    'Crea tu escuadrón, elige un hábito diario y mantened viva la racha un día más.'

  const benefits = document.createElement('ul')
  benefits.className = 'mt-8 flex flex-col gap-4'
  benefits.append(...BENEFITS.map(benefit))

  copy.append(headline, intro, benefits, streakPreview())
  aside.append(top, copy)
  return aside
}

export function authLayout({ title, description, topAction = null }) {
  const main = document.createElement('main')
  main.className = [
    'min-h-dvh w-full min-w-0 bg-[#f4f2fb] text-slate-950',
    'ps-[env(safe-area-inset-left)] pe-[env(safe-area-inset-right)]',
    'pt-[env(safe-area-inset-top)]',
  ].join(' ')

  const shell = document.createElement('div')
  shell.className = 'grid min-h-dvh w-full lg:grid-cols-[1.05fr_0.95fr]'

  const panel = document.createElement('section')
  panel.className = [
    'flex min-w-0 items-center justify-center px-4 py-6',
    'pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-10 lg:px-12 xl:px-16',
  ].join(' ')

  const card = document.createElement('div')
  card.className = [
    'w-full max-w-[32rem] min-w-0 rounded-[2rem] bg-white p-5',
    'shadow-[0_24px_70px_rgba(59,20,127,0.14)] ring-1 ring-[#e4e0ef]',
    'sm:p-8 lg:p-10',
  ].join(' ')

  const mobileBrand = document.createElement('div')
  mobileBrand.className = 'mb-8 lg:hidden'
  mobileBrand.append(brand())

  const heading = document.createElement('h1')
  heading.className =
    'text-3xl leading-tight font-extrabold tracking-tight text-balance text-[#211a45] sm:text-4xl'
  heading.textContent = title

  const intro = document.createElement('p')
  intro.className = 'mt-3 text-base leading-relaxed text-pretty text-[#5c5678]'
  intro.textContent = description

  const content = document.createElement('div')
  content.className = 'mt-7'

  if (topAction) card.append(topAction)
  card.append(mobileBrand, heading, intro, content)
  panel.append(card)
  shell.append(brandPanel(), panel)
  main.append(shell)

  return { main, content }
}

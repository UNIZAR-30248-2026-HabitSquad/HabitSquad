import { brand } from './brand.js'
import { squadPreview } from './squadPreview.js'

function pageShell() {
  const main = document.createElement('main')
  main.className = [
    'min-h-dvh w-full min-w-0 bg-canvas font-sans text-ink',
    'ps-[env(safe-area-inset-left)] pe-[env(safe-area-inset-right)]',
    'pt-[env(safe-area-inset-top)]',
  ].join(' ')
  return main
}

function heading({ title, srTitle }) {
  const fragment = document.createDocumentFragment()
  const titleClass =
    'text-[2rem] leading-[1.1] font-semibold tracking-[-0.022em] text-balance text-ink sm:text-[2.5rem]'

  if (srTitle) {
    const hidden = document.createElement('h1')
    hidden.className = 'sr-only'
    hidden.textContent = srTitle
    const visible = document.createElement('p')
    visible.className = titleClass
    visible.textContent = title
    fragment.append(hidden, visible)
  } else {
    const h1 = document.createElement('h1')
    h1.className = titleClass
    h1.textContent = title
    fragment.append(h1)
  }
  return fragment
}

export function splitLayout({ title, srTitle, description, top = null, showBrand = true }) {
  const main = pageShell()

  const shell = document.createElement('div')
  shell.className = [
    'mx-auto grid min-h-dvh w-full max-w-6xl min-w-0 content-start lg:content-center lg:items-center',
    'px-6 sm:px-10 lg:grid-cols-[minmax(0,25rem)_1fr] lg:gap-24 lg:px-12',
  ].join(' ')

  const column = document.createElement('section')
  column.className = [
    'flex w-full max-w-[25rem] min-w-0 flex-col justify-self-center py-10',
    'pb-[max(2.5rem,env(safe-area-inset-bottom))] lg:justify-self-start',
  ].join(' ')

  if (top) column.append(top)
  if (showBrand) {
    const lockup = brand({ large: true })
    lockup.classList.add('mb-10')
    column.append(lockup)
  }
  column.append(heading({ title, srTitle }))

  if (description) {
    const intro = document.createElement('p')
    intro.className = 'mt-3 text-[1.0625rem] leading-relaxed text-pretty text-ink-muted'
    intro.textContent = description
    column.append(intro)
  }

  const content = document.createElement('div')
  content.className = 'mt-8 flex min-w-0 flex-col'
  column.append(content)

  const aside = document.createElement('aside')
  aside.className = 'hidden justify-center py-10 lg:flex'
  aside.append(squadPreview())

  shell.append(column, aside)
  main.append(shell)
  return { main, content }
}
